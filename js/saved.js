const savedStoriesList = document.getElementById("saved-stories");
const savedStoriesStorageKey = "thepulse.savedStories";

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
    const stories = getSavedStories();
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

renderSavedStories();
