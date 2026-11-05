(function () {
    "use strict";

    const tableName = "club_applications";

    function id(name) {
        return document.getElementById(name);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatDate(value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) return "Unknown date";
        return date.toLocaleString([], { year: "numeric", month: "short", day: "numeric" });
    }

    function formatStatus(value) {
        const status = String(value || "pending");
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function statusClass(value) {
        const status = String(value || "pending").toLowerCase().replace(/[^a-z0-9-]/g, "");
        return "application-status status-" + status;
    }

    function getSessionUser() {
        return supabaseClient.auth.getSession().then(function (result) {
            if (result.error) throw result.error;
            return result.data.session ? result.data.session.user : null;
        });
    }

    function renderSummary(applications) {
        const summary = id("applicationSummary");
        if (!summary) return;
        if (applications.length === 0) {
            summary.innerHTML = "<h3>Latest Application</h3><p class='form-help'>No applications yet. Start one from the application page.</p>";
            return;
        }
        const latest = applications[0];
        summary.innerHTML = [
            "<h3>Latest Application</h3>",
            "<p class='form-help'>" + escapeHtml(latest.proposed_name) + "</p>",
            "<div class='summary-list'>",
            "<div class='summary-item'><span class='summary-label'>Status</span><span class='summary-value'>" + escapeHtml(formatStatus(latest.status)) + "</span></div>",
            "<div class='summary-item'><span class='summary-label'>Purpose</span><span class='summary-value'>" + escapeHtml(latest.club_purpose) + "</span></div>",
            "<div class='summary-item'><span class='summary-label'>Submitted</span><span class='summary-value'>" + escapeHtml(formatDate(latest.created_at)) + "</span></div>",
            "</div>"
        ].join("");
    }

    function renderApplications(applications) {
        const list = id("applicationsList");
        const count = id("applicationCount");
        if (!list) return;
        if (count) count.textContent = String(applications.length);
        if (applications.length === 0) {
            list.innerHTML = "<div class='empty-state'>No applications yet. Start one from the application page.</div>";
            return;
        }
        list.innerHTML = applications.map(function (application) {
            return [
                "<article class='application-entry'>",
                "<div class='application-entry-header'>",
                "<div>",
                "<h3 class='application-entry-title'>" + escapeHtml(application.proposed_name) + "</h3>",
                "<div class='application-entry-time'>" + escapeHtml(formatDate(application.created_at)) + "</div>",
                "</div>",
                "<span class='" + statusClass(application.status) + "'>" + escapeHtml(formatStatus(application.status)) + "</span>",
                "</div>",
                "<div class='summary-list'>",
                "<div class='summary-item'><span class='summary-label'>Purpose</span><span class='summary-value'>" + escapeHtml(application.club_purpose) + "</span></div>",
                "<div class='summary-item'><span class='summary-label'>Idea</span><span class='summary-value'>" + escapeHtml(application.proposed_description) + "</span></div>",
                "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    function loadApplications() {
        const list = id("applicationsList");
        if (!list) return;
        list.innerHTML = "<div class='empty-state'>Loading applications...</div>";
        getSessionUser()
            .then(function (user) {
                if (!user) {
                    window.location.href = "userlogin.html";
                    return null;
                }
                return supabaseClient
                    .from(tableName)
                    .select("*")
                    .eq("applicant_id", user.id)
                    .order("created_at", { ascending: false });
            })
            .then(function (result) {
                if (!result) return;
                if (result.error) throw result.error;
                const applications = result.data || [];
                renderSummary(applications);
                renderApplications(applications);
            })
            .catch(function (error) {
                console.error("Could not load applications:", error);
                list.innerHTML = "<div class='empty-state'>Could not load applications.</div>";
            });
    }

    function clearApplications() {
        if (!confirm("Delete all your applications?")) return;
        getSessionUser()
            .then(function (user) {
                if (!user) {
                    window.location.href = "userlogin.html";
                    return null;
                }
                return supabaseClient.from(tableName).delete().eq("applicant_id", user.id);
            })
            .then(function (result) {
                if (!result) return;
                if (result.error) throw result.error;
                loadApplications();
            })
            .catch(function (error) {
                console.error("Could not delete applications:", error);
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const clearButton = id("clearApplicationsButton");
        if (clearButton) clearButton.onclick = clearApplications;
        loadApplications();
    });
})();
