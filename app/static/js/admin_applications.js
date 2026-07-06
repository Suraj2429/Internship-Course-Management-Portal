const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect admin page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Store applications
let applicationsData = [];


// Load all applications
async function loadApplications() {

    try {

        const response = await fetch(
            "/applications/",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.clear();

            window.location.href = "/login";

            return;
        }


        const applications =
            await response.json();


        if (!response.ok) {

            showMessage(
                applications.detail ||
                "Unable to load applications.",
                "danger"
            );

            return;
        }


        applicationsData = applications;


        updateStatistics();


        displayApplications(
            applicationsData
        );


    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );


        showMessage(
            "Unable to load applications.",
            "danger"
        );

    }

}


// Display applications
function displayApplications(applications) {

    const table =
        document.getElementById(
            "applicationTable"
        );


    table.innerHTML = "";


    if (applications.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7">

                    No applications found.

                </td>

            </tr>

        `;

        return;
    }


    applications.forEach(
        function (application) {


            let badgeClass =
                "bg-warning text-dark";


            if (
                application.status === "Approved"
            ) {

                badgeClass = "bg-success";

            } else if (
                application.status === "Rejected"
            ) {

                badgeClass = "bg-danger";

            }


            let actions = "-";


            if (
                application.status === "Pending"
            ) {

                actions = `

                    <button
                        class="btn btn-sm btn-success me-2"
                        onclick="approveApplication(
                            ${application.application_id}
                        )"
                    >
                        Approve
                    </button>


                    <button
                        class="btn btn-sm btn-danger"
                        onclick="rejectApplication(
                            ${application.application_id}
                        )"
                    >
                        Reject
                    </button>

                `;

            }


            table.innerHTML += `

                <tr>

                    <td>
                        ${application.application_id}
                    </td>


                    <td>
                        ${application.student.name}
                    </td>


                    <td>
                        ${application.student.email}
                    </td>


                    <td>
                        ${application.internship.title}
                    </td>


                    <td>
                        ${application.internship.duration}
                    </td>


                    <td>

                        <span
                            class="badge ${badgeClass}"
                        >
                            ${application.status}
                        </span>

                    </td>


                    <td>
                        ${actions}
                    </td>

                </tr>

            `;

        }
    );

}


// Approve application
async function approveApplication(applicationId) {

    const confirmed = confirm(
        "Approve this internship application?"
    );


    if (!confirmed) {

        return;

    }


    await updateApplicationStatus(
        applicationId,
        "approve"
    );

}


// Reject application
async function rejectApplication(applicationId) {

    const confirmed = confirm(
        "Reject this internship application?"
    );


    if (!confirmed) {

        return;

    }


    await updateApplicationStatus(
        applicationId,
        "reject"
    );

}


// Send approve or reject request
async function updateApplicationStatus(
    applicationId,
    action
) {

    try {

        const response = await fetch(
            `/applications/${applicationId}/${action}`,
            {
                method: "PUT",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const result =
            await response.json();


        if (response.ok) {

            showMessage(
                result.message ||
                `Application ${action}d successfully.`,
                "success"
            );


            await loadApplications();

        } else {

            showMessage(
                result.detail ||
                "Unable to update application.",
                "danger"
            );

        }


    } catch (error) {

        console.error(
            "Application update error:",
            error
        );


        showMessage(
            "Unable to update application.",
            "danger"
        );

    }

}


// Update statistics
function updateStatistics() {

    const total =
        applicationsData.length;


    const pending =
        applicationsData.filter(
            item => item.status === "Pending"
        ).length;


    const approved =
        applicationsData.filter(
            item => item.status === "Approved"
        ).length;


    const rejected =
        applicationsData.filter(
            item => item.status === "Rejected"
        ).length;


    document.getElementById(
        "totalApplications"
    ).innerText = total;


    document.getElementById(
        "pendingApplications"
    ).innerText = pending;


    document.getElementById(
        "approvedApplications"
    ).innerText = approved;


    document.getElementById(
        "rejectedApplications"
    ).innerText = rejected;

}


// Filter applications
function filterApplications() {

    const selectedStatus =
        document.getElementById(
            "statusFilter"
        ).value;


    if (selectedStatus === "All") {

        displayApplications(
            applicationsData
        );

        return;
    }


    const filtered =
        applicationsData.filter(
            application =>
                application.status ===
                selectedStatus
        );


    displayApplications(filtered);

}


// Show message
function showMessage(text, type) {

    const message =
        document.getElementById(
            "message"
        );


    message.className =
        `alert alert-${type}`;


    message.innerText = text;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    setTimeout(function () {

        message.classList.add(
            "d-none"
        );

    }, 3000);

}


// Logout
function logout() {

    localStorage.clear();

    window.location.href = "/login";

}


// Start page
loadApplications();