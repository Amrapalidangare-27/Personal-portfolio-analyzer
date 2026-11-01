document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            try {

                const response = await fetch("/auth/login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })

                });

                const data = await response.json();

                if (data.success) {

                    // Save logged-in user
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                    localStorage.setItem("userId", String(data.user.id));
                    localStorage.setItem("userName", data.user.name || "User");
                    localStorage.setItem("userEmail", data.user.email || "");

                    alert("Login successful! 🎉");

                    // Go to dashboard
                    window.location.href = "/dashboard.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                console.error("Login error:", error);

                alert(
                    "Server se connection nahi ho raha."
                );

            }

        });

    }

});

// =====================================================
// REGISTER + PASSWORD SHOW/HIDE   (register.html aur index.html)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {

    // Eye button: password dikhao / chhupao
    document.querySelectorAll("button[id^='toggle']").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const wrap = btn.closest(".input-wrapper") || btn.parentElement;
            const input = wrap ? wrap.querySelector("input") : null;
            if (input) {
                input.type = input.type === "password" ? "text" : "password";
            }
        });
    });

    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const terms = document.getElementById("terms");

        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill all fields.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Password and Confirm password do not match.");
            return;
        }
        if (terms && !terms.checked) {
            alert("Please accept the Terms & Privacy Policy.");
            return;
        }

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();

            if (data.success) {
                alert("Registration successful! Please sign in.");
                window.location.href = "/index.html";   // sign-in page
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Register error:", error);
            alert("Server se connection nahi ho raha.");
        }
    });
});
