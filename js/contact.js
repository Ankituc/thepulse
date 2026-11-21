const contactForm = document.getElementById("contactForm");

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    const status = contactForm.querySelector(".form-status");
    button.disabled = true;
    status.textContent = "Saving your message…";

    try {
        const payload = Object.fromEntries(new FormData(contactForm).entries());
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Your message could not be saved. Please try again.");
        status.textContent = result.message;
        contactForm.reset();
    } catch (error) {
        status.textContent = error.message || "Your message could not be saved. Please try again.";
    } finally {
        button.disabled = false;
    }
});
