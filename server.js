require("dotenv").config();

const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { getFallbackHeadlines, searchFallbackNews } = require("./data/fallback-news");

const app = express();
const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;
const databasePath = process.env.DATABASE_PATH || path.join(rootDir, ".thepulse-data", "thepulse.sqlite");
const dataDir = path.dirname(databasePath);
const isProduction = process.env.NODE_ENV === "production";
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpCoreSettings = [process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS];
const smtpConfiguredCount = smtpCoreSettings.filter(Boolean).length;
if (smtpConfiguredCount > 0 && smtpConfiguredCount < smtpCoreSettings.length) {
  throw new Error("Set SMTP_HOST, SMTP_USER, and SMTP_PASS together, or leave all three unset.");
}
const mailTransport = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true" || (!process.env.SMTP_SECURE && smtpPort === 465),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    })
  : null;
const allowedTopics = new Set([
  "world", "nation", "business", "technology", "sports", "science", "entertainment"
]);

if (isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || process.env.SESSION_SECRET.startsWith("replace-"))) {
  throw new Error("Set SESSION_SECRET to a random value of at least 32 characters before production.");
}
if (isProduction && (!process.env.GNEWS_API_KEY || process.env.GNEWS_API_KEY.startsWith("replace-"))) {
  throw new Error("Set GNEWS_API_KEY before starting in production.");
}

fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    welcome_email_sent INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS saved_stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, url)
  );
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS saved_stories_user_idx ON saved_stories (user_id, saved_at DESC);
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
`);

const newsletterColumns = db.pragma("table_info(newsletter_subscribers)");
if (!newsletterColumns.some((column) => column.name === "welcome_email_sent")) {
  db.exec("ALTER TABLE newsletter_subscribers ADD COLUMN welcome_email_sent INTEGER NOT NULL DEFAULT 0");
}

class SQLiteSessionStore extends session.Store {
  constructor(database) {
    super();
    this.getStatement = database.prepare("SELECT sess, expires_at FROM sessions WHERE sid = ?");
    this.setStatement = database.prepare(`
      INSERT INTO sessions (sid, sess, expires_at) VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires_at = excluded.expires_at
    `);
    this.touchStatement = database.prepare("UPDATE sessions SET expires_at = ? WHERE sid = ?");
    this.destroyStatement = database.prepare("DELETE FROM sessions WHERE sid = ?");
    this.deleteExpiredStatement = database.prepare("DELETE FROM sessions WHERE expires_at <= ?");
    this.lastCleanup = 0;
  }

  get(sid, callback) {
    try {
      const row = this.getStatement.get(sid);
      if (!row) return callback(null, null);
      if (row.expires_at <= Date.now()) {
        this.destroyStatement.run(sid);
        return callback(null, null);
      }
      return callback(null, JSON.parse(row.sess));
    } catch (error) {
      return callback(error);
    }
  }

  set(sid, sess, callback = () => {}) {
    try {
      const expiresAt = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + (sess.cookie?.maxAge || 1000 * 60 * 60 * 24 * 7);
      this.setStatement.run(sid, JSON.stringify(sess), expiresAt);
      if (Date.now() - this.lastCleanup > 60 * 60 * 1000) {
        this.deleteExpiredStatement.run(Date.now());
        this.lastCleanup = Date.now();
      }
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  touch(sid, sess, callback = () => {}) {
    try {
      const expiresAt = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + (sess.cookie?.maxAge || 1000 * 60 * 60 * 24 * 7);
      this.touchStatement.run(expiresAt, sid);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }

  destroy(sid, callback = () => {}) {
    try {
      this.destroyStatement.run(sid);
      return callback(null);
    } catch (error) {
      return callback(error);
    }
  }
}

app.disable("x-powered-by");
if (isProduction) app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
      ...(isProduction ? { upgradeInsecureRequests: [] } : {})
    }
  },
  crossOriginResourcePolicy: false
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(session({
  name: "thepulse.sid",
  secret: process.env.SESSION_SECRET || "local-only-session-secret-change-before-deploying-123456",
  store: new SQLiteSessionStore(db),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." }
});
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again in an hour." }
});

function validEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

async function sendWelcomeEmail(firstName, email) {
  if (!mailTransport) return null;

  const safeFirstName = escapeHtml(firstName);
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  try {
    await mailTransport.sendMail({
      from,
      to: email,
      subject: "Welcome to ThePulse",
      text: `Hi ${firstName},\n\nWelcome to ThePulse. Your account has been created successfully. You can now log in and explore the latest stories.\n\nThanks,\nThePulse team`,
      html: `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#202124"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e6e8ec;border-radius:16px"><p style="margin:0 0 20px;color:#155db2;font-size:22px;font-weight:700">ThePulse</p><h1 style="margin:0 0 16px;font-size:24px">Welcome, ${safeFirstName}!</h1><p style="margin:0 0 12px;line-height:1.6">Your ThePulse account has been created successfully.</p><p style="margin:0;line-height:1.6;color:#5f6368">You can now log in and explore the latest stories.</p><p style="margin:28px 0 0;line-height:1.6">Thanks,<br><strong>ThePulse team</strong></p></div></body></html>`
    });
    return true;
  } catch (error) {
    console.error("Welcome email could not be delivered:", error.message);
    return false;
  }
}

async function sendNewsletterWelcomeEmail(email, subscriberId) {
  const subject = "Thanks for joining ThePulse";
  const text = "Thanks for joining ThePulse Daily Dispatch. You’re on the list for updates from ThePulse.\n\nBest regards,\nThePulse team";
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f3;font-family:Arial,Helvetica,sans-serif;color:#202124"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e6e8ec;border-radius:16px"><p style="margin:0 0 20px;color:#c62828;font-size:22px;font-weight:700">ThePulse</p><h1 style="margin:0 0 16px;font-size:24px">Thanks for joining us.</h1><p style="margin:0 0 12px;line-height:1.6">You’re now on the list for ThePulse Daily Dispatch. We’re glad to have you with us.</p><p style="margin:24px 0 0;line-height:1.6">Best regards,<br><strong>ThePulse team</strong></p></div></body></html>`;

  try {
    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `newsletter-welcome-${subscriberId}`
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "ThePulse <onboarding@resend.dev>",
          to: [email], subject, text, html
        }),
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        throw new Error(`Resend returned status ${response.status}.`);
      }
      return true;
    }

    if (!mailTransport) return null;
    await mailTransport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      text,
      html
    });
    return true;
  } catch (error) {
    console.error("Newsletter welcome email could not be delivered:", error.message);
    return false;
  }
}

function requireSameOriginJson(req, res, next) {
  if (!req.is("application/json")) {
    return res.status(415).json({ error: "This endpoint accepts JSON requests only." });
  }
  const origin = req.get("origin");
  if (origin && origin !== `${req.protocol}://${req.get("host")}`) {
    return res.status(403).json({ error: "Cross-origin request rejected." });
  }
  if (req.get("sec-fetch-site") === "cross-site") {
    return res.status(403).json({ error: "Cross-origin request rejected." });
  }
  return next();
}

app.get("/api/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.set("Cache-Control", "no-store");
    return res.json({ status: "ok" });
  } catch {
    return res.status(503).json({ status: "unavailable" });
  }
});

app.use("/api/auth", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  return next();
});

app.post("/api/newsletter/subscribe", requireSameOriginJson, formLimiter, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!validEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  const result = db.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)").run(email);
  const subscriber = db.prepare("SELECT id, welcome_email_sent FROM newsletter_subscribers WHERE email = ? COLLATE NOCASE").get(email);
  if (subscriber.welcome_email_sent) {
    return res.status(200).json({ message: "This email is already on ThePulse Daily Dispatch list.", welcomeEmailSent: true });
  }
  const welcomeEmailSent = await sendNewsletterWelcomeEmail(email, subscriber.id);
  if (welcomeEmailSent === true) {
    db.prepare("UPDATE newsletter_subscribers SET welcome_email_sent = 1 WHERE id = ?").run(subscriber.id);
  }
  const message = welcomeEmailSent === true
    ? "Thanks for joining ThePulse! Check your inbox for a welcome email."
    : welcomeEmailSent === false
      ? "Thanks for joining ThePulse! Your email was saved, but we could not send the welcome email right now."
      : "Thanks for joining ThePulse! Your email was saved. Email delivery is not configured yet.";
  return res.status(result.changes ? 201 : 200).json({ message, welcomeEmailSent: welcomeEmailSent === true });
});

app.post("/api/contact", requireSameOriginJson, formLimiter, (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const topic = String(req.body.topic || "").trim();
  const message = String(req.body.message || "").trim();
  if (!name || name.length > 100 || !validEmail(email) || !topic || topic.length > 120 || !message || message.length > 5000) {
    return res.status(400).json({ error: "Complete each field with a valid email. Messages must be 5,000 characters or fewer." });
  }
  db.prepare("INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)").run(name, email, topic, message);
  return res.status(201).json({ message: "Thanks. Your message has been saved for the site owner." });
});

async function requestGNews(endpoint, params) {
  const apiKey = String(process.env.GNEWS_API_KEY || "").trim();
  if (!apiKey || apiKey.startsWith("replace-")) {
    const error = new Error("News service is not configured. Set GNEWS_API_KEY on the server.");
    error.status = 503;
    throw error;
  }

  const url = new URL(`https://gnews.io/api/v4/${endpoint}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("lang", "en");
  url.searchParams.set("max", "10");
  url.searchParams.set("apikey", apiKey);
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    });
  } catch (error) {
    error.status = error.name === "TimeoutError" ? 504 : 502;
    error.message = "The news provider is temporarily unavailable. Please try again shortly.";
    throw error;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = "The news provider is temporarily unavailable. Please try again shortly.";
    if (response.status === 400 || response.status === 401) {
      message = "GNews did not accept the configured API key. Check GNEWS_API_KEY in .env and use the API key from your GNews dashboard.";
    } else if (response.status === 403) {
      message = "GNews denied the request. Check your account verification and API quota.";
    } else if (response.status === 429) {
      message = "GNews rate limit reached. Wait a moment before trying again.";
    }
    const error = new Error(message);
    error.status = response.status >= 500 ? 502 : 503;
    error.providerStatus = response.status;
    throw error;
  }
  return data;
}

app.get("/api/news/headlines", async (req, res, next) => {
  try {
    const category = String(req.query.category || "general");
    if (category !== "general" && !allowedTopics.has(category)) {
      return res.status(400).json({ error: "Unsupported news category." });
    }
    const searchQueries = {
      general: "news",
      world: "world news",
      nation: "India politics",
      business: "business news",
      technology: "technology news",
      sports: "sports news",
      science: "science news",
      entertainment: "entertainment news"
    };
    const params = { q: searchQueries[category] };
    if (category === "general" || category === "nation") params.country = "in";
    let data;
    try {
      data = await requestGNews("search", params);
    } catch (gnewsError) {
      console.warn(`[ThePulse News] GNews API unavailable (${gnewsError.message}). Serving fallback stories for '${category}'.`);
      data = getFallbackHeadlines(category);
    }
    res.set("Cache-Control", "public, max-age=120");
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/news/search", async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query || query.length > 200) {
      return res.status(400).json({ error: "Search must be between 1 and 200 characters." });
    }
    let data;
    try {
      data = await requestGNews("search", { q: query });
    } catch (gnewsError) {
      console.warn(`[ThePulse News] GNews search unavailable (${gnewsError.message}). Searching fallback stories for '${query}'.`);
      data = searchFallbackNews(query);
    }
    res.set("Cache-Control", "public, max-age=60");
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

const publicUser = (user) => ({
  id: user.id,
  firstName: user.first_name
});

function requireUser(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Log in to sync saved stories." });
  return next();
}

app.get("/api/saved-stories", requireUser, (req, res) => {
  const stories = db.prepare("SELECT url, title, saved_at AS savedAt FROM saved_stories WHERE user_id = ? ORDER BY saved_at DESC")
    .all(req.session.user.id);
  return res.json({ stories });
});

app.post("/api/saved-stories", requireSameOriginJson, requireUser, (req, res) => {
  const url = String(req.body.url || "").trim();
  const title = String(req.body.title || "").trim();
  let parsedUrl;
  try { parsedUrl = new URL(url); } catch { return res.status(400).json({ error: "Enter a valid story URL." }); }
  if (!["http:", "https:"].includes(parsedUrl.protocol) || !title || title.length > 500) {
    return res.status(400).json({ error: "A valid story URL and title are required." });
  }
  db.prepare("INSERT OR IGNORE INTO saved_stories (user_id, url, title) VALUES (?, ?, ?)")
    .run(req.session.user.id, parsedUrl.href, title);
  return res.status(201).json({ message: "Story saved to your account." });
});

app.delete("/api/saved-stories", requireSameOriginJson, requireUser, (req, res) => {
  const url = String(req.body.url || "").trim();
  db.prepare("DELETE FROM saved_stories WHERE user_id = ? AND url = ?").run(req.session.user.id, url);
  return res.json({ message: "Story removed from your saved stories." });
});

app.post("/api/auth/signup", requireSameOriginJson, authLimiter, async (req, res, next) => {
  try {
    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const confirmPassword = String(req.body.confirmPassword || "");
    const termsAccepted = req.body.termsAccepted === true;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Please complete all required fields." });
    }
    if (firstName.length > 80 || lastName.length > 80) {
      return res.status(400).json({ error: "Names must be 80 characters or fewer." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "Password must be at least 8 characters and no more than 72 bytes." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    if (!termsAccepted) {
      return res.status(400).json({ error: "Please accept the Terms of Service and Privacy Policy." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    db.prepare(`
      INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(firstName, lastName, email, passwordHash);

    const welcomeEmailSent = await sendWelcomeEmail(firstName, email);
    const message = welcomeEmailSent === true
      ? "Account created successfully. A welcome email has been sent."
      : welcomeEmailSent === false
        ? "Account created successfully, but the welcome email could not be sent. Please try again later."
        : "Account created successfully. Email delivery is not configured yet.";
    return res.status(201).json({ message, welcomeEmailSent: welcomeEmailSent === true });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "This email is already registered." });
    }
    return next(error);
  }
});

app.post("/api/auth/password-reset/request", requireSameOriginJson, authLimiter, async (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  const user = db.prepare("SELECT id, first_name FROM users WHERE email = ? COLLATE NOCASE").get(email);
  if (user && mailTransport) {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const now = Date.now();
      db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ? OR expires_at <= ?").run(user.id, now);
      db.prepare("INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)")
        .run(user.id, tokenHash, now + 30 * 60 * 1000, now);
      const resetUrl = new URL(`/pages/forgot-password.html?token=${token}`, `${req.protocol}://${req.get("host")}`).href;
      await mailTransport.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Reset your ThePulse password",
        text: `Hi ${user.first_name},\n\nUse this link within 30 minutes to reset your password: ${resetUrl}\n\nIf you did not request this, ignore this email.`,
        html: `<p>Hi ${escapeHtml(user.first_name)},</p><p><a href="${escapeHtml(resetUrl)}">Reset your ThePulse password</a> within 30 minutes.</p><p>If you did not request this, ignore this email.</p>`
      });
    } catch (error) {
      console.error("Password reset email could not be delivered:", error.message);
    }
  }
  return res.json({ message: "If an account exists for that email and email delivery is configured, a reset link will arrive shortly." });
});

app.post("/api/auth/password-reset/complete", requireSameOriginJson, authLimiter, async (req, res, next) => {
  try {
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");
    if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ error: "This reset link is invalid or expired." });
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "Password must be at least 8 characters and no more than 72 bytes." });
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const reset = db.prepare("SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ?").get(tokenHash, Date.now());
    if (!reset) return res.status(400).json({ error: "This reset link is invalid or expired." });
    const passwordHash = await bcrypt.hash(password, 12);
    const update = db.transaction(() => {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, reset.user_id);
      db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(reset.user_id);
      db.prepare("DELETE FROM sessions WHERE json_extract(sess, '$.user.id') = ?").run(reset.user_id);
    });
    update();
    return res.json({ message: "Password updated. You can now log in." });
  } catch (error) { return next(error); }
});

app.post("/api/auth/login", requireSameOriginJson, authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.cookie.maxAge = req.body.rememberMe === true ? 1000 * 60 * 60 * 24 * 7 : null;
      req.session.user = publicUser(user);
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.json({ message: "Login successful.", user: req.session.user });
      });
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in." });
  return res.json({ user: req.session.user });
});

app.post("/api/auth/logout", requireSameOriginJson, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("thepulse.sid", { httpOnly: true, sameSite: "lax", secure: isProduction });
    return res.json({ message: "Logged out." });
  });
});

app.get(["/", "/index.html"], (req, res) => res.sendFile(path.join(rootDir, "index.html")));
app.use("/css", express.static(path.join(rootDir, "css"), { dotfiles: "deny", index: false }));
app.use("/js", express.static(path.join(rootDir, "js"), { dotfiles: "deny", index: false }));
app.use("/pages", express.static(path.join(rootDir, "pages"), { dotfiles: "deny", index: false }));

app.use((error, req, res, next) => {
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({
      error: error.status === 413 ? "Request body is too large." : "Invalid request."
    });
  }
  if (error.status >= 500 && error.status < 600) {
    console.error("Request failed:", error);
    return res.status(error.status).json({
      error: error.status === 500 ? "Something went wrong. Please try again." : error.message
    });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Invalid request body." });
  }
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
});

const server = app.listen(port, () => {
  console.log(`ThePulse is running at http://localhost:${port}`);
});

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;

let isShuttingDown = false;
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Closing ThePulse cleanly.`);
  server.close((error) => {
    if (error) {
      console.error("Error while closing the HTTP server:", error);
      process.exitCode = 1;
    }
    if (mailTransport) mailTransport.close();
    if (db.open) db.close();
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
