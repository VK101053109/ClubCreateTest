(function () {
    "use strict";

    function showMessage(text) {
        document.getElementById("message").textContent = text;
    }

    // Best effort: a failed profile row should not block login or signup.
    function saveProfile(user) {
        const userName = user.user_metadata ? user.user_metadata.username : "";
        if (!userName) return Promise.resolve();
        return supabaseClient
            .from("profiles")
            .insert({ id: user.id, username: userName })
            .then(function (result) {
                if (result.error && result.error.code !== "23505") {
                    console.warn("Profile not saved:", result.error.message);
                }
            });
    }

    function goToDashboard(text) {
        showMessage(text);
        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1000);
    }

    document.getElementById("loginButton").addEventListener("click", function () {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        if (!email || !password) return showMessage("Enter email and password");
        showMessage("Signing in...");
        supabaseClient.auth
            .signInWithPassword({ email: email, password: password })
            .then(function (result) {
                if (result.error) throw result.error;
                return saveProfile(result.data.user).then(function () {
                    goToDashboard("Login successful");
                });
            })
            .catch(function (error) {
                showMessage(error.message);
            });
    });

    document.getElementById("signupButton").addEventListener("click", function () {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const userName = document.getElementById("username").value.trim();
        if (!email || !password || !userName) {
            return showMessage("Enter username, email, and password");
        }
        showMessage("Creating account...");
        supabaseClient.auth
            .signUp({
                email: email,
                password: password,
                options: { data: { username: userName } }
            })
            .then(function (result) {
                if (result.error) throw result.error;
                if (!result.data.session) {
                    showMessage("Account created. Check your email to confirm it.");
                    return;
                }
                return saveProfile(result.data.user).then(function () {
                    goToDashboard("Account created");
                });
            })
            .catch(function (error) {
                showMessage(error.message);
            });
    });
})();
