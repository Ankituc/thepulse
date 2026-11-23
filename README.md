# ThePulse

ThePulse is a static news frontend served by an Express backend. Accounts, login sessions, saved stories, newsletter subscribers, and contact messages use SQLite; passwords are stored as bcrypt hashes. Signed-in saved stories sync to the account, while signed-out bookmarks remain in the current browser and are imported after login.

## Run locally

1. Install Node.js (version 20 or newer).
2. Run `npm install` in this folder.
3. Copy `.env.example` to `.env`, set a random `SESSION_SECRET` (at least 32 characters), and add a valid `GNEWS_API_KEY`. Configure the SMTP values if you want signup welcome emails to be delivered.
4. Run `npm start` and open `http://localhost:3000`.

The server creates `.thepulse-data/thepulse.sqlite` on its first start. Account records and login sessions remain there between server restarts.

## Authentication API

- `POST /api/auth/signup` — creates an account from `firstName`, `lastName`, `email`, `password`, `confirmPassword`, and `termsAccepted`.
- `POST /api/auth/login` — verifies credentials and starts a session.
- `GET /api/auth/me` — returns the current session user.
- `POST /api/auth/logout` — destroys the current session.

The login page's “Remember me” option now controls whether the browser receives a persistent seven-day session cookie. Without it, the cookie lasts only for the browser session.

When SMTP is configured, successful signup sends a welcome email from ThePulse. Email delivery failures do not undo account creation; the signup response tells the user whether the email was sent. To use Gmail, enable 2-Step Verification and create a Google App Password, then set `SMTP_USER` and `SMTP_PASS` in `.env`. Keep SMTP credentials private and never put them in frontend code.

## Newsletter and contact forms

- `POST /api/newsletter/subscribe` — validates an email, stores it once in the `newsletter_subscribers` SQLite table, and sends a welcome email when delivery is configured.
- `POST /api/contact` — validates and stores messages in `contact_messages`; submissions are rate limited.
- `GET /api/saved-stories` — lists the signed-in user's saved stories.
- `POST /api/saved-stories` and `DELETE /api/saved-stories` — add/remove a story for the signed-in user.

Password reset links are sent through the configured SMTP transport and expire after 30 minutes. Newsletter welcome messages use Resend's HTTPS API when `RESEND_API_KEY` is configured, or the configured SMTP transport otherwise. Set `RESEND_FROM` to a sender address on a domain verified with Resend. On Render's free web plan, use Resend's HTTPS API because outbound SMTP ports are blocked. If no mail provider is configured, the subscription is still saved and the form says that the welcome email could not be sent. Newsletter campaign delivery and unsubscribe are not implemented. Contact messages are stored without notifications; the site owner must access SQLite to read them.

The Terms of Service and Privacy Policy pages are project drafts describing current behavior. Review them for your jurisdiction and hosting setup before public launch.

The default session secret is for local development only. Set `SESSION_SECRET` and use HTTPS before deploying this app publicly. The existing account forms keep their current appearance and submit to these API routes through `js/auth.js`.

## Before deployment

- Use a Node.js host with Node 20 or newer and set the start command to `npm start`.
- Set `NODE_ENV=production`, `SESSION_SECRET`, and a valid `GNEWS_API_KEY` in the hosting provider's secret/environment settings. The app's production startup check intentionally refuses placeholder session and news keys. Do not commit `.env`.
- The GNews key and session secret were previously visible in screenshots/source during development. Revoke the exposed GNews key and generate a new session secret before deployment.
- Generate the session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`; do not use the example value.
- The included `render.yaml` targets Render's free web plan and stores SQLite at `/tmp/thepulse.sqlite`. This is suitable for a portfolio demo, but user accounts, saved stories, contact messages, newsletter addresses, and sessions can be lost when the service restarts or redeploys. For persistent production data, use a paid host disk or migrate to a managed database. This SQLite setup supports one server instance; it is not suitable for horizontally scaled instances.
- Deploy behind HTTPS. The server sets secure session cookies in production and checks `/api/health` for a simple health check.
- Login, signup, newsletter, and contact requests are IP rate limited in the running server process. For a multi-instance deployment, use a shared rate-limit store and a shared database.
- Review GNews plan limits and hosting-provider storage/backup behavior before opening the site to users.
- Add `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` to the host settings together to enable welcome emails; `SMTP_PORT`, `SMTP_SECURE`, and `EMAIL_FROM` are also configurable. Verify the sender address with the provider. Without SMTP settings, accounts still work but signup emails are not sent.
- Newsletter campaign delivery/unsubscribe and contact notifications are not implemented. Keep those limitations clear to users until those flows are added.
- For newsletter welcome emails on Render Free, add `RESEND_API_KEY` and `RESEND_FROM` in the Render service's environment settings. Keep the API key private and use a sender address from a verified domain.
- Set a retention and deletion process for newsletter addresses and contact messages; there is no self-service deletion or admin dashboard in this project.
- Review the draft Terms of Service and Privacy Policy for your jurisdiction, actual hosting provider, contact details, and retention practices before launch.

The app now handles `SIGINT` and `SIGTERM` by closing the HTTP server, SMTP transport, and SQLite connection cleanly. `/api/health` checks that SQLite is responding and returns `503` if it is unavailable.
