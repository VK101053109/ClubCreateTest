(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const button = document.getElementById("loginButton");
        const message = document.getElementById("message");

        // If logged in, go straight to admin dashboard :D
        supabaseClient.auth.getSession().then(function (result) {
            if (result.data.session) {
                window.location.href = "admin.html";
            }
        });

        button.onclick = function () {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                message.textContent = "Enter email and password";
                return;
            }
            message.textContent = "Signing in...";
            supabaseClient.auth
                .signInWithPassword({ email: email, password: password })
                .then(function (result) {
                    if (result.error) throw result.error;
                    message.textContent = "Success! Loading...";
                    window.location.href = "admin.html";
                })
                .catch(function (error) {
                    console.error(error);
                    message.textContent = error.message;
                });
        };

        passwordInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") button.click();
        });
    });
})();
