async function submitAuthForm(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.error || "Request failed. Please try again.");
    }
    return result;
}

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.togglePassword);
        if (input) input.type = input.type === "password" ? "text" : "password";
    });
});

const signupPassword = document.getElementById("password");
const strengthText = document.getElementById("strengthText");
const confirmPasswordInput = document.getElementById("confirmPassword");
const matchText = document.getElementById("matchText");

if (signupPassword && strengthText) {
    signupPassword.addEventListener("input", () => {
        const length = signupPassword.value.length;
        strengthText.textContent = length === 0 ? ""
            : length < 8 ? "🔴 Weak Password"
            : length < 10 ? "🟠 Medium Password"
            : "🟢 Strong Password";
    });
}

if (signupPassword && confirmPasswordInput && matchText) {
    const updatePasswordMatch = () => {
        const confirmation = confirmPasswordInput.value;
        matchText.textContent = confirmation.length === 0 ? ""
            : confirmation === signupPassword.value ? "✓ Passwords match"
            : "✗ Passwords do not match";
    };
    confirmPasswordInput.addEventListener("input", updatePasswordMatch);
    signupPassword.addEventListener("input", updatePasswordMatch);
}

// SIGNUP

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value.toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        const submitButton = signupForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const result = await submitAuthForm("/api/auth/signup", {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                termsAccepted: document.getElementById("terms").checked
            });
            alert(result.message || "Account created successfully!");
            window.location.href = "login.html";
        } catch (error) {
            alert(error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
}


// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const email = document.getElementById("email").value.toLowerCase();
        const password = document.getElementById("pwdInput").value;

        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            await submitAuthForm("/api/auth/login", {
                email,
                password,
                rememberMe: document.getElementById("rememberMe")?.checked === true
            });
            alert("Login successful!");
            window.location.href = "../";
        } catch (error) {
            alert(error.message);
        } finally {
            submitButton.disabled = false;
        }
    });
}
