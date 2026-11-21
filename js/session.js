const authActions = document.getElementById("auth-actions");

async function showLoggedInUser() {
    if (!authActions) return;

    try {
        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        if (!response.ok) return;

        const { user } = await response.json();
        if (!user) return;

        const greeting = document.createElement("span");
        greeting.className = "logged-in-user";
        greeting.textContent = `Hi, ${user.firstName}`;

        const logoutButton = document.createElement("button");
        logoutButton.className = "btn-nav-outline";
        logoutButton.type = "button";
        logoutButton.textContent = "Log out";
        logoutButton.addEventListener("click", async () => {
            logoutButton.disabled = true;
            try {
                const logoutResponse = await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({})
                });
                if (!logoutResponse.ok) {
                    throw new Error("Could not log out. Please try again.");
                }
                window.location.reload();
            } catch (error) {
                alert(error.message);
                logoutButton.disabled = false;
            }
        });

        authActions.replaceChildren(greeting, logoutButton);
    } catch (error) {
        console.error("Could not check the login session:", error);
    }
}

showLoggedInUser();
