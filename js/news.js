const categoryLinks = Array.from(document.querySelectorAll(".category-nav a"));
const searchInput = document.getElementById("search-input");
const newsFeedback = document.getElementById("news-feedback");
const searchModeIndicator = document.getElementById("search-mode-indicator");
let activeRequestId = 0;
let activeSearchIndicatorId = 0;
let lastNewsRequest = { type: "category", category: "general" };

function safeArticleUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : "#";
    } catch {
        return "#";
    }
}

function externalLink(element, url) {
    const safeUrl = safeArticleUrl(url);
    element.href = safeUrl;
    if (safeUrl !== "#") {
        element.target = "_blank";
        element.rel = "noopener noreferrer";
    } else {
        element.setAttribute("aria-disabled", "true");
        element.addEventListener("click", (event) => event.preventDefault());
    }
    return element;
}

function articleImage(article, className = "") {
    if (!article.image) return null;
    const imageUrl = safeArticleUrl(article.image);
    if (imageUrl === "#") return null;
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    if (className) image.className = className;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    return image;
}

let activeHeroArticle = null;
const savedStoriesKey = "thepulse.savedStories";
const bookmarkButton = document.querySelector('[data-article-action="bookmark"]');
const shareButton = document.querySelector('[data-article-action="share"]');
const articleActionStatus = document.getElementById("article-action-status");
let signedInUser = false;
let accountSavedStories = [];

fetch("/api/auth/me", { credentials: "same-origin" }).then((response) => {
    signedInUser = response.ok;
    if (!signedInUser) return;
    return fetch("/api/saved-stories", { credentials: "same-origin" })
        .then((response) => response.ok ? response.json() : { stories: [] })
        .then((data) => { accountSavedStories = data.stories || []; updateBookmarkState(activeHeroArticle); });
}).catch(() => {});

function readSavedStories() {
    try {
        const stories = JSON.parse(localStorage.getItem(savedStoriesKey) || "[]");
        return Array.isArray(stories) ? stories : [];
    } catch {
        return [];
    }
}

function updateBookmarkState(article) {
    if (!bookmarkButton) return;
    const isSaved = Boolean(article?.url) && (signedInUser
        ? accountSavedStories.some((story) => story.url === article.url)
        : readSavedStories().some((story) => story.url === article.url));
    bookmarkButton.setAttribute("aria-pressed", String(isSaved));
    bookmarkButton.setAttribute("aria-label", isSaved ? "Remove saved story" : "Save this story");
    bookmarkButton.title = isSaved ? "Remove saved story" : "Save this story";
    bookmarkButton.classList.toggle("is-saved", isSaved);
}

function setActiveCategory(category) {
    categoryLinks.forEach((link) => {
        const isActive = link.dataset.category === category;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
    if (category && searchModeIndicator) searchModeIndicator.hidden = true;
}

function showSearchMode(query) {
    if (!searchModeIndicator) return;
    searchModeIndicator.textContent = `Search: ${query}  ×`;
    searchModeIndicator.setAttribute("aria-label", `Clear search for ${query} and show latest headlines`);
    searchModeIndicator.hidden = false;
}

function showNewsFeedback(message, actionLabel = "", action = null) {
    if (!newsFeedback) return;
    newsFeedback.replaceChildren();
    newsFeedback.hidden = !message;
    if (!message) return;
    const text = document.createElement("span");
    text.textContent = message;
    newsFeedback.append(text);
    if (actionLabel && action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "news-feedback-action";
        button.textContent = actionLabel;
        button.addEventListener("click", action);
        newsFeedback.append(button);
    }
}

function retryLastNewsRequest() {
    if (lastNewsRequest.type === "search") return searchNews(lastNewsRequest.query);
    return fetchNews(lastNewsRequest.category);
}

bookmarkButton?.addEventListener("click", async () => {
    if (!activeHeroArticle?.url) return;
    if (signedInUser) {
        const wasSaved = accountSavedStories.some((story) => story.url === activeHeroArticle.url);
        try {
            const response = await fetch("/api/saved-stories", {
                method: wasSaved ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify(wasSaved ? { url: activeHeroArticle.url } : {
                    url: activeHeroArticle.url,
                    title: activeHeroArticle.title || "Untitled story"
                })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Could not update saved story.");
            accountSavedStories = wasSaved
                ? accountSavedStories.filter((story) => story.url !== activeHeroArticle.url)
                : [{ url: activeHeroArticle.url, title: activeHeroArticle.title || "Untitled story" }, ...accountSavedStories];
            updateBookmarkState(activeHeroArticle);
            if (articleActionStatus) articleActionStatus.textContent = wasSaved ? "Story removed from your account." : "Story saved to your account.";
        } catch (error) {
            if (articleActionStatus) articleActionStatus.textContent = error.message;
        }
        return;
    }
    const stories = readSavedStories();
    const existingIndex = stories.findIndex((story) => story.url === activeHeroArticle.url);
    const isSaved = existingIndex === -1;
    if (isSaved) {
        stories.push({
            url: activeHeroArticle.url,
            title: activeHeroArticle.title || "Untitled story",
            savedAt: new Date().toISOString()
        });
    } else {
        stories.splice(existingIndex, 1);
    }
    try {
        localStorage.setItem(savedStoriesKey, JSON.stringify(stories));
        updateBookmarkState(activeHeroArticle);
        if (articleActionStatus) articleActionStatus.textContent = isSaved ? "Story saved on this device." : "Story removed from saved stories.";
    } catch {
        if (articleActionStatus) articleActionStatus.textContent = "This browser could not save the story.";
    }
});

shareButton?.addEventListener("click", async () => {
    const articleUrl = safeArticleUrl(activeHeroArticle?.url);
    if (!activeHeroArticle || articleUrl === "#") {
        if (articleActionStatus) articleActionStatus.textContent = "This story has no shareable link.";
        return;
    }
    const shareData = {
        title: activeHeroArticle.title || "ThePulse story",
        text: activeHeroArticle.description || "Read this story on ThePulse.",
        url: articleUrl
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            if (articleActionStatus) articleActionStatus.textContent = "Story shared.";
        } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(articleUrl);
            if (articleActionStatus) articleActionStatus.textContent = "Story link copied.";
        } else {
            window.prompt("Copy this story link:", articleUrl);
        }
    } catch (error) {
        if (error.name !== "AbortError" && articleActionStatus) {
            articleActionStatus.textContent = "Could not share the story. Please try again.";
        }
    }
});

function setNewsMessage(message, { actionLabel = "Try again", action = retryLastNewsRequest, feedbackMessage = "" } = {}) {
    activeHeroArticle = null;
    if (bookmarkButton) bookmarkButton.disabled = true;
    if (shareButton) shareButton.disabled = true;
    const heroTitle = document.getElementById("hero-title");
    heroTitle.textContent = message;
    heroTitle.href = "#";
    heroTitle.removeAttribute("target");
    heroTitle.removeAttribute("rel");
    heroTitle.setAttribute("aria-disabled", "true");
    heroTitle.tabIndex = -1;
    document.getElementById("hero-desc").textContent = "";
    document.getElementById("hero-author").textContent = "";
    showNewsFeedback(feedbackMessage || message, actionLabel, action);
    const heroImage = document.getElementById("hero-image");
    heroImage.replaceChildren();
    heroImage.onclick = null;
    heroImage.onkeydown = null;
    heroImage.removeAttribute("role");
    heroImage.removeAttribute("tabindex");
    heroImage.removeAttribute("aria-label");
    document.getElementById("breaking-news").textContent = message;
    document.getElementById("trending-news").replaceChildren();
    document.getElementById("latest-news").replaceChildren();
    document.getElementById("news-slider").replaceChildren();
    document.getElementById("editor-picks").replaceChildren();
}

function renderNews(articles) {
    if (!Array.isArray(articles) || articles.length === 0) {
        const emptyMessage = lastNewsRequest.type === "search"
            ? `No stories found for “${lastNewsRequest.query}”.`
            : `No stories found in ${categoryLinks.find((link) => link.dataset.category === lastNewsRequest.category)?.textContent || "this section"}.`;
        setNewsMessage(emptyMessage, {
            actionLabel: "Show latest headlines",
            feedbackMessage: "Try another search or return to the latest headlines.",
            action: () => {
                if (searchInput) searchInput.value = "";
                setActiveCategory("general");
                fetchNews("general");
            }
        });
        return;
    }

    showNewsFeedback("");

    const hero = articles[0];
    activeHeroArticle = hero;
    if (bookmarkButton) bookmarkButton.disabled = false;
    if (shareButton) shareButton.disabled = false;
    const heroTitle = document.getElementById("hero-title");
    const heroImage = document.getElementById("hero-image");
    const heroUrl = safeArticleUrl(hero.url);
    heroTitle.textContent = hero.title || "Untitled story";
    heroTitle.href = heroUrl;
    if (heroUrl !== "#") {
        heroTitle.target = "_blank";
        heroTitle.rel = "noopener noreferrer";
        heroTitle.removeAttribute("aria-disabled");
        heroTitle.tabIndex = 0;
    } else {
        heroTitle.removeAttribute("target");
        heroTitle.removeAttribute("rel");
        heroTitle.setAttribute("aria-disabled", "true");
        heroTitle.tabIndex = -1;
    }
    document.getElementById("hero-desc").textContent = hero.description || "";
    const published = new Date(hero.publishedAt);
    const dateLabel = Number.isNaN(published.getTime()) ? "" : published.toLocaleDateString();
    document.getElementById("hero-author").textContent = [hero.source?.name || "News", dateLabel].filter(Boolean).join(" · ");
    updateBookmarkState(hero);

    const image = articleImage(hero);
    heroImage.replaceChildren(...(image ? [image] : []));
    if (heroUrl !== "#") {
        heroImage.setAttribute("role", "link");
        heroImage.tabIndex = 0;
        heroImage.setAttribute("aria-label", `Read full story: ${hero.title || "Untitled story"}`);
        heroImage.onclick = () => window.open(heroUrl, "_blank", "noopener,noreferrer");
        heroImage.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                window.open(heroUrl, "_blank", "noopener,noreferrer");
            }
        };
    } else {
        heroImage.onclick = null;
        heroImage.onkeydown = null;
        heroImage.removeAttribute("role");
        heroImage.removeAttribute("tabindex");
        heroImage.removeAttribute("aria-label");
    }

    document.getElementById("breaking-news").textContent = articles[1]?.title || hero.title || "";

    const trending = document.getElementById("trending-news");
    trending.replaceChildren(...articles.slice(0, 4).map((article, index) => {
        const item = document.createElement("li");
        item.className = "trending-item";
        const number = document.createElement("span");
        number.className = "trending-num";
        number.textContent = String(index + 1);
        const title = externalLink(document.createElement("a"), article.url);
        title.className = "trending-text";
        title.textContent = article.title || "Untitled story";
        item.append(number, title);
        return item;
    }));

    const latest = document.getElementById("latest-news");
    latest.replaceChildren(...articles.slice(4, 10).map((article) => {
        const link = externalLink(document.createElement("a"), article.url);
        link.className = "story-link";
        const card = document.createElement("div");
        card.className = "story-card";
        const imageWrap = document.createElement("div");
        imageWrap.className = "story-image";
        const img = articleImage(article);
        if (img) imageWrap.append(img);
        const body = document.createElement("div");
        body.className = "story-body";
        const title = document.createElement("div");
        title.className = "story-title";
        title.textContent = article.title || "Untitled story";
        const time = document.createElement("div");
        time.className = "story-time";
        const published = new Date(article.publishedAt);
        time.textContent = Number.isNaN(published.getTime()) ? "" : published.toLocaleDateString();
        body.append(title, time);
        card.append(imageWrap, body);
        link.append(card);
        return link;
    }));

    const editor = document.getElementById("editor-picks");
    editor.replaceChildren(...articles.slice(1, 3).map((article) => {
        const card = externalLink(document.createElement("a"), article.url);
        card.className = "editor-card";
        const img = articleImage(article);
        if (img) card.append(img);
        const content = document.createElement("div");
        content.className = "editor-content";
        const source = document.createElement("div");
        source.className = "editor-tag";
        source.textContent = article.source?.name || "News";
        const title = document.createElement("div");
        title.className = "editor-title";
        title.textContent = article.title || "Untitled story";
        const description = document.createElement("div");
        description.className = "editor-desc";
        description.textContent = article.description || "Read the full story...";
        const readMore = document.createElement("div");
        readMore.className = "editor-link";
        readMore.textContent = "Read Full Story →";
        content.append(source, title, description, readMore);
        card.append(content);
        return card;
    }));

    const slider = document.getElementById("news-slider");
    slider.replaceChildren(...articles.map((article) => {
        const card = externalLink(document.createElement("a"), article.url);
        card.className = "slider-card";
        const img = articleImage(article);
        if (img) card.append(img);
        const content = document.createElement("div");
        content.className = "slider-content";
        const title = document.createElement("div");
        title.className = "slider-title";
        title.textContent = article.title || "Untitled story";
        content.append(title);
        card.append(content);
        return card;
    }));
}

async function loadNews(url, loadingMessage) {
    if (window.location.protocol === "file:") {
        setNewsMessage("Start ThePulse with npm start, then open http://localhost:3000.", {
            actionLabel: "Retry",
            feedbackMessage: "News needs the Express server to run."
        });
        return;
    }
    const requestId = ++activeRequestId;
    const mainContent = document.querySelector(".main-content");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    if (mainContent) mainContent.setAttribute("aria-busy", "true");
    showNewsFeedback(loadingMessage);
    try {
        const response = await fetch(url, {
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "News could not be loaded.");
        if (requestId !== activeRequestId) return;
        renderNews(data.articles);
    } catch (error) {
        if (requestId !== activeRequestId) return;
        console.error(error);
        const message = error.name === "AbortError"
            ? "The news request took too long. Please try again."
            : error.message?.includes("not configured")
                ? "News service is being set up. Please try again later."
                : error instanceof TypeError
                    ? "ThePulse server could not be reached. Run npm start and open http://localhost:3000."
                    : error.message || "News is temporarily unavailable. Please try again shortly.";
        setNewsMessage(message, { feedbackMessage: "Please retry or choose a category above." });
    } finally {
        window.clearTimeout(timeoutId);
        if (requestId === activeRequestId && mainContent) mainContent.removeAttribute("aria-busy");
    }
}

function fetchNews(category = "general") {
    lastNewsRequest = { type: "category", category };
    if (searchInput) searchInput.value = "";
    const categoryLabel = categoryLinks.find((link) => link.dataset.category === category)?.textContent.trim();
    const loadingMessage = category === "general"
        ? "Loading latest headlines…"
        : `Loading ${categoryLabel || category} headlines…`;
    const params = new URLSearchParams({ category });
    return loadNews(`/api/news/headlines?${params}`, loadingMessage);
}

async function searchNews(query) {
    lastNewsRequest = { type: "search", query };
    setActiveCategory(null);
    showSearchMode(query);
    const params = new URLSearchParams({ q: query });
    const searchForm = document.getElementById("news-search-form");
    const indicatorId = ++activeSearchIndicatorId;
    const indicatorStartedAt = Date.now();
    searchForm?.classList.add("is-searching");
    searchForm?.querySelector(".search-submit")?.setAttribute("aria-label", `Searching for ${query}`);
    try {
        await loadNews(`/api/news/search?${params}`, `Searching for “${query}”…`);
    } finally {
        const remainingVisibleTime = Math.max(0, 450 - (Date.now() - indicatorStartedAt));
        if (remainingVisibleTime) await new Promise((resolve) => window.setTimeout(resolve, remainingVisibleTime));
        if (indicatorId === activeSearchIndicatorId) {
            searchForm?.classList.remove("is-searching");
            searchForm?.querySelector(".search-submit")?.setAttribute("aria-label", "Search headlines");
        }
    }
}

searchModeIndicator?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    setActiveCategory("general");
    fetchNews("general");
});

categoryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveCategory(link.dataset.category);
        fetchNews(link.dataset.category);
    });
});

document.querySelectorAll("[data-news-category]").forEach((link) => {
    if (link.closest(".category-nav")) return;
    link.addEventListener("click", (event) => {
        event.preventDefault();
        fetchNews(link.dataset.newsCategory);
        setActiveCategory(link.dataset.newsCategory);
        document.getElementById("latest-news")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

document.getElementById("news-search-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput?.value.trim();
    if (query) searchNews(query);
});

fetchNews();
