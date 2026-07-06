const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect page
if (!token || role !== "student") {

    window.location.href = "/login";

}


// Load student dashboard
async function loadDashboard() {

    try {

        const response = await fetch(
            "/dashboard/student",
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


        document.getElementById(
            "studentName"
        ).innerText =
            `Welcome, ${data.student.name}`;


        const stats = data.statistics;


        document.getElementById(
            "appliedInternships"
        ).innerText =
            stats.applied_internships;


        document.getElementById(
            "approvedInternships"
        ).innerText =
            stats.approved_internships;


        document.getElementById(
            "enrolledCourses"
        ).innerText =
            stats.enrolled_courses;


        document.getElementById(
            "assignedTasks"
        ).innerText =
            stats.assigned_tasks;


        document.getElementById(
            "completedTasks"
        ).innerText =
            stats.completed_tasks;


        document.getElementById(
            "overallProgress"
        ).innerText =
            stats.overall_progress;

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