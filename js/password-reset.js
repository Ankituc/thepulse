const requestForm = document.getElementById("resetRequestForm");
const completeForm = document.getElementById("resetCompleteForm");
const statusText = document.getElementById("resetStatus");
const resetToken = new URLSearchParams(window.location.search).get("token");

if (resetToken) {
    requestForm.hidden = true;
    completeForm.hidden = false;
}

async function submitReset(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Request failed. Please try again.");
    return result;
}

requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = requestForm.querySelector("button");
    button.disabled = true;
    statusText.textContent = "Sending…";
    try {
        const result = await submitReset("/api/auth/password-reset/request", {
            email: document.getElementById("resetEmail").value
        });
        statusText.textContent = result.message;
    } catch (error) {
        statusText.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

completeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = completeForm.querySelector("button");
    button.disabled = true;
    statusText.textContent = "Updating password…";
    try {
        const result = await submitReset("/api/auth/password-reset/complete", {
            token: resetToken,
            password: document.getElementById("newPassword").value
        });
        statusText.textContent = result.message;
        completeForm.reset();
        window.history.replaceState({}, "", window.location.pathname);
        window.setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (error) {
        statusText.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});
