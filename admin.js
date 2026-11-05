(function () {
    "use strict";

    const tableName = "club_applications";
    let allApplications = [];

    function id(name) {
        return document.getElementById(name);
    }

    function loadApplications() {
        setStatus("Loading applications...");
        supabaseClient
            .from(tableName)
            .select("*")
            .order("created_at", { ascending: false })
            .then(function (result) {
                if (result.error) throw result.error;
                allApplications = result.data || [];
                renderApplications();
                setStatus("Applications loaded", "message-success");
            })
            .catch(function (error) {
                console.error("Could not load applications:", error);
                setStatus("Failed loading applications", "message-error");
            });
    }

    function setStatus(text, type) {
        const element = id("databaseStatus");
        if (!element) return;
        element.textContent = text;
        element.className = type ? "admin-meta-item " + type : "admin-meta-item";
    }

    function escape(text) {
        return String(text || "")
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

    function renderApplications() {
        const list = id("adminApplicationsList");
        const search = (id("applicationSearch").value || "").toLowerCase();
        const filtered = allApplications.filter(function (application) {
            const text = [
                application.proposed_name,
                application.proposed_description,
                application.club_purpose,
                application.status,
                application.applicant_id
            ].join(" ").toLowerCase();
            return text.includes(search);
        });

        let pending = 0;
        let approved = 0;
        allApplications.forEach(function (application) {
            if (application.status === "pending") pending++;
            if (application.status === "approved") approved++;
        });

        id("totalApplications").textContent = allApplications.length;
        id("pendingApplications").textContent = pending;
        id("approvedApplications").textContent = approved;
        id("visibleCount").textContent = "Showing " + filtered.length + " applications";

        if (filtered.length === 0) {
            list.innerHTML = '<div class="empty-state">No applications found</div>';
            return;
        }

        list.innerHTML = filtered.map(function (application) {
            return `
            <article class="application-card">
                <div class="application-card-header">
                    <div>
                        <p class="application-card-kicker">Club Application</p>
                        <h3>${escape(application.proposed_name)}</h3>
                        <div class="application-entry-time">${escape(formatDate(application.created_at))}</div>
                    </div>
                    <span class="${statusClass(application.status)}">${escape(formatStatus(application.status))}</span>
                </div>
                <div class="application-card-body">
                    <p><b>Purpose:</b> ${escape(application.club_purpose)}</p>
                    <p><b>Description:</b> ${escape(application.proposed_description)}</p>
                    <p><b>Applicant ID:</b> ${escape(application.applicant_id)}</p>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-accent approveApplication" data-id="${application.id}">Approve</button>
                    <button class="btn btn-outline-accent rejectApplication" data-id="${application.id}">Reject</button>
                    <button class="btn btn-danger deleteApplication" data-id="${application.id}">Delete</button>
                </div>
            </article>`;
        }).join("");
    }

    function updateStatus(applicationId, status) {
        supabaseClient
            .from(tableName)
            .update({ status: status })
            .eq("id", applicationId)
            .then(function (result) {
                if (result.error) throw result.error;
                loadApplications();
            })
            .catch(function (error) {
                console.error("Could not update application:", error);
            });
    }

    function deleteApplication(applicationId) {
        if (!confirm("Delete this application?")) return;
        supabaseClient
            .from(tableName)
            .delete()
            .eq("id", applicationId)
            .then(function (result) {
                if (result.error) throw result.error;
                loadApplications();
            })
            .catch(function (error) {
                console.error("Could not delete application:", error);
            });
    }

    function clearApplications() {
        if (!confirm("Delete ALL applications?")) return;
        supabaseClient
            .from(tableName)
            .delete()
            .not("id", "is", null)
            .then(function (result) {
                if (result.error) throw result.error;
                loadApplications();
            })
            .catch(function (error) {
                console.error("Could not clear applications:", error);
            });
    }

    function logout() {
        supabaseClient.auth.signOut().then(function () {
            window.location.href = "login.html";
        });
    }

    function protectPage() {
        supabaseClient.auth
            .getSession()
            .then(function (result) {
                if (result.error) throw result.error;
                if (!result.data.session) {
                    window.location.href = "login.html";
                    return;
                }
                loadApplications();
            })
            .catch(function (error) {
                console.error(error);
                window.location.href = "login.html";
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        protectPage();
        id("refreshApplicationsButton").onclick = loadApplications;
        id("clearApplicationsButton").onclick = clearApplications;
        id("applicationSearch").oninput = renderApplications;
        id("logoutButton").onclick = logout;
        id("adminApplicationsList").onclick = function (event) {
            if (event.target.classList.contains("deleteApplication")) {
                deleteApplication(event.target.dataset.id);
            }
            if (event.target.classList.contains("approveApplication")) {
                updateStatus(event.target.dataset.id, "approved");
            }
            if (event.target.classList.contains("rejectApplication")) {
                updateStatus(event.target.dataset.id, "rejected");
            }
        };
    });
})();
