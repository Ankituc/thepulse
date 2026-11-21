document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const status = form.querySelector(".newsletter-status") || form.parentElement.querySelector(".newsletter-status");
        const email = new FormData(form).get("email");
        button.disabled = true;
        if (status) status.textContent = "Submitting…";

        try {
            const response = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ email })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Subscription failed. Please try again.");
            if (status) status.textContent = result.message;
            form.reset();
        } catch (error) {
            if (status) status.textContent = error.message || "Subscription failed. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
});
