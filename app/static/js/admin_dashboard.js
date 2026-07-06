const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Load admin dashboard
async function loadDashboard() {

    try {

        const response = await fetch(
            "/dashboard/admin",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (response.status === 401 || response.status === 403) {

            localStorage.clear();

            window.location.href = "/login";

            return;
        }


        const data = await response.json();


        if (!response.ok) {

            console.error(data);

            return;
        }


        document.getElementById("students").innerText =
            data.students;

        document.getElementById("internships").innerText =
            data.internships;

        document.getElementById("courses").innerText =
            data.courses;

        document.getElementById("applications").innerText =
            data.applications;

        document.getElementById("tasks").innerText =
            data.tasks;

        document.getElementById("submissions").innerText =
            data.submissions;

        document.getElementById(
            "pendingApplications"
        ).innerText =
            data.pending_applications;

        document.getElementById(
            "pendingSubmissions"
        ).innerText =
            data.pending_submissions;

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// Logout
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");

    window.location.href = "/login";

}


loadDashboard();