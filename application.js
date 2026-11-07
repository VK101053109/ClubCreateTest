(function () {
    "use strict";

    const tableName = "club_applications";

    // 1. Grab the global database connector from the browser window
    const supabase = window.supabase || window.supabaseClient;

    function readField(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function setMessage(text, type) {
        const target = document.getElementById("formMessage");
        if (!target) return;
        target.textContent = text;
        target.className = type ? "message-line " + type : "message-line";
    }

    async function getSessionUser() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        return user;
    }

    function buildApplication(user) {
        return {
            applicant_id: user.id,
            proposed_name: readField("proposed_name"),
            proposed_description: readField("proposed_description"),
            club_purpose: readField("club_purpose"),
            status: "pending"
        };
    }

    function validateApplication(application) {
        if (!application.proposed_name) {
            setMessage("Enter a name for your club.", "message-error");
            return false;
        }
        if (!application.club_purpose) {
            setMessage("Tell us what your club is for.", "message-error");
            return false;
        }
        if (!application.proposed_description) {
            setMessage("Describe your club idea.", "message-error");
            return false;
        }
        return true;
    }

    function submitApplication(form) {
        if (!supabase) {
            setMessage("Could not connect to the database. Please refresh the page.", "message-error");
            return;
        }
        setMessage("Submitting application...");
        getSessionUser()
            .then(function (user) {
                if (!user) {
                    setMessage("Please log in before submitting an application.", "message-error");
                    return;
                }
                const application = buildApplication(user);
                if (!validateApplication(application)) return;
                
                return supabase.from(tableName).insert(application).then(function (result) {
                    if (result.error) throw result.error;
                    form.reset();
                    setMessage("Application submitted! We will review it within 3-5 business days.", "message-success");
                });
            })
            .catch(function (error) {
                console.error("Could not submit application:", error);
                setMessage(error.message || JSON.stringify(error) || "Could not submit application. Please try again...", "message-error");
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("applicationForm");
        if (!form) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            submitApplication(form);
        });
    });
})();
