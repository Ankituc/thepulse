const savedStoriesList = document.getElementById("saved-stories");
const savedStoriesStorageKey = "thepulse.savedStories";
let savedStoriesAreSynced = false;

function getSavedStories() {
    try {
        const stories = JSON.parse(localStorage.getItem(savedStoriesStorageKey) || "[]");
        return Array.isArray(stories)
            ? stories.filter((story) => story && typeof story.title === "string" && isSafeStoryUrl(story.url))
            : [];
    } catch {
        return [];
    }
}

function isSafeStoryUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

function renderSavedStories() {
    const stories = window.accountSavedStories || getSavedStories();
    savedStoriesList.setAttribute("aria-busy", "false");
    savedStoriesList.replaceChildren();

    if (!stories.length) {
        const empty = document.createElement("div");
        empty.className = "saved-empty";
        const message = document.createElement("p");
        message.textContent = "You haven’t saved any stories yet.";
        const browse = document.createElement("a");
        browse.className = "info-action";
        browse.href = "../index.html";
        browse.textContent = "Browse the latest stories";
        empty.append(message, browse);
        savedStoriesList.append(empty);
        return;
    }

    stories.forEach((story) => {
        const item = document.createElement("article");
        item.className = "saved-story";
        const details = document.createElement("div");
        details.className = "saved-story-details";
        const link = document.createElement("a");
        link.className = "saved-story-title";
        link.href = new URL(story.url).href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = story.title;
        const savedAt = document.createElement("p");
        savedAt.className = "saved-story-date";
        const date = new Date(story.savedAt);
        savedAt.textContent = Number.isNaN(date.getTime()) ? "Saved story" : `Saved ${date.toLocaleDateString()}`;
        details.append(link, savedAt);

        const remove = document.createElement("button");
        remove.className = "saved-story-remove";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove saved story: ${story.title}`);
        remove.addEventListener("click", () => {
            if (savedStoriesAreSynced) {
                fetch("/api/saved-stories", {
                    method: "DELETE", headers: { "Content-Type": "application/json" },
                    credentials: "same-origin", body: JSON.stringify({ url: story.url })
                }).then((response) => {
                    if (!response.ok) throw new Error("Could not remove this story.");
                    window.accountSavedStories = window.accountSavedStories.filter((saved) => saved.url !== story.url);
                    renderSavedStories();
                }).catch(() => { savedStoriesList.setAttribute("aria-label", "Could not remove story. Please reload and try again."); });
                return;
            }
            const updated = getSavedStories().filter((savedStory) => savedStory.url !== story.url);
            localStorage.setItem(savedStoriesStorageKey, JSON.stringify(updated));
            renderSavedStories();
        });

        item.append(details, remove);
        savedStoriesList.append(item);
    });
}

window.addEventListener("storage", (event) => {
    if (event.key === savedStoriesStorageKey || event.key === null) renderSavedStories();
});

async function loadSavedStories() {
    try {
        const me = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (me.ok) {
            const response = await fetch("/api/saved-stories", { credentials: "same-origin" });
            const data = await response.json();
            window.accountSavedStories = data.stories || [];
            savedStoriesAreSynced = true;
            const localStories = getSavedStories();
            for (const story of localStories) {
                await fetch("/api/saved-stories", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    credentials: "same-origin", body: JSON.stringify({ url: story.url, title: story.title })
                });
            }
            if (localStories.length) {
                localStorage.removeItem(savedStoriesStorageKey);
                const refreshed = await fetch("/api/saved-stories", { credentials: "same-origin" });
                window.accountSavedStories = (await refreshed.json()).stories || [];
            }
            document.querySelector(".info-intro").textContent = "Your saved stories sync with your account.";
        }
    } catch {
        document.querySelector(".info-intro").textContent = "Could not load your account reading list. Try reloading the page.";
    }
    renderSavedStories();
}

loadSavedStories();
