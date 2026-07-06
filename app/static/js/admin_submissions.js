const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect admin page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Store submissions
let submissionsData = [];



// Load all submissions
async function loadSubmissions() {

    try {

        const response = await fetch(
            "/tasks/admin/submissions",
            {

                headers: {

                    "Authorization":
                        `Bearer ${token}`

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


        const submissions =
            await response.json();


        if (!response.ok) {

            showMessage(
                submissions.detail ||
                "Unable to load submissions.",
                "danger"
            );

            return;
        }


        submissionsData = submissions;


        updateStatistics();


        displaySubmissions(
            submissionsData
        );


    } catch (error) {


        console.error(
            "Submission loading error:",
            error
        );


        showMessage(
            "Unable to load submissions.",
            "danger"
        );

    }

}



// Display submissions
function displaySubmissions(submissions) {

    const table =
        document.getElementById(
            "submissionTable"
        );


    table.innerHTML = "";


    if (submissions.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7">
                    No submissions found.
                </td>

            </tr>

        `;

        return;
    }


    submissions.forEach(function (submission) {


        let badgeClass =
            "bg-warning text-dark";


        if (submission.status === "Approved") {

            badgeClass = "bg-success";

        } else if (
            submission.status === "Rejected"
        ) {

            badgeClass = "bg-danger";

        }


        const marks =
            submission.marks ?? "-";


        table.innerHTML += `

            <tr>


                <td>
                    ${submission.submission_id}
                </td>


                <td>

                    <strong>
                        ${submission.student.name}
                    </strong>

                    <br>

                    <small class="text-muted">
                        ${submission.student.email}
                    </small>

                </td>


                <td>
                    ${submission.task.title}
                </td>


                <td>

                    <a
                        href="${submission.github_link}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-sm btn-outline-primary"
                    >
                        View Repository
                    </a>

                </td>


                <td>

                    <span
                        class="badge ${badgeClass}"
                    >
                        ${submission.status}
                    </span>

                </td>


                <td>
                    ${marks}
                </td>


                <td>

                    <button
                        class="btn btn-sm btn-primary"
                        onclick="openReviewModal(
                            ${submission.submission_id}
                        )"
                    >
                        ${
                            submission.status === "Pending"
                                ? "Review"
                                : "Update Review"
                        }
                    </button>

                </td>


            </tr>

        `;

    });

}



// Open review modal
function openReviewModal(submissionId) {

    const submission =
        submissionsData.find(
            item =>
                item.submission_id ===
                submissionId
        );


    if (!submission) {

        return;

    }


    document.getElementById(
        "submissionId"
    ).value =
        submission.submission_id;


    document.getElementById(
        "studentName"
    ).value =
        `${submission.student.name} (${submission.student.email})`;


    document.getElementById(
        "taskTitle"
    ).value =
        submission.task.title;


    document.getElementById(
        "studentRemarks"
    ).value =
        submission.remarks || "";


    document.getElementById(
        "repositoryLink"
    ).href =
        submission.github_link;


    // Existing review data
    document.getElementById(
        "reviewStatus"
    ).value =
        submission.status === "Pending"
            ? ""
            : submission.status;


    document.getElementById(
        "marks"
    ).value =
        submission.marks ?? "";


    document.getElementById(
        "feedback"
    ).value =
        submission.feedback || "";


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "reviewModal"
            )
        );


    modal.show();

}



// Submit review
document.getElementById(
    "reviewForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const submissionId =
            document.getElementById(
                "submissionId"
            ).value;


        const data = {

            status:
                document.getElementById(
                    "reviewStatus"
                ).value,

            feedback:
                document.getElementById(
                    "feedback"
                ).value,

            marks:
                Number(
                    document.getElementById(
                        "marks"
                    ).value
                )

        };


        try {

            const response = await fetch(
                `/tasks/review/${submissionId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(data)

                }
            );


            const result =
                await response.json();


            if (response.ok) {


                const modalElement =
                    document.getElementById(
                        "reviewModal"
                    );


                const modal =
                    bootstrap.Modal.getInstance(
                        modalElement
                    );


                if (modal) {

                    modal.hide();

                }


                showMessage(
                    result.message ||
                    "Submission reviewed successfully.",
                    "success"
                );


                await loadSubmissions();


            } else {


                showMessage(
                    getErrorMessage(result),
                    "danger"
                );

            }


        } catch (error) {


            console.error(
                "Review error:",
                error
            );


            showMessage(
                "Unable to review submission.",
                "danger"
            );

        }

    }
);



// Update statistics
function updateStatistics() {

    document.getElementById(
        "totalSubmissions"
    ).innerText =
        submissionsData.length;


    document.getElementById(
        "pendingSubmissions"
    ).innerText =
        submissionsData.filter(
            item =>
                item.status === "Pending"
        ).length;


    document.getElementById(
        "approvedSubmissions"
    ).innerText =
        submissionsData.filter(
            item =>
                item.status === "Approved"
        ).length;


    document.getElementById(
        "rejectedSubmissions"
    ).innerText =
        submissionsData.filter(
            item =>
                item.status === "Rejected"
        ).length;

}



// Filter submissions
function filterSubmissions() {

    const selectedStatus =
        document.getElementById(
            "statusFilter"
        ).value;


    if (selectedStatus === "All") {

        displaySubmissions(
            submissionsData
        );

        return;
    }


    const filtered =
        submissionsData.filter(
            submission =>
                submission.status ===
                selectedStatus
        );


    displaySubmissions(filtered);

}



// FastAPI error handler
function getErrorMessage(result) {

    if (typeof result.detail === "string") {

        return result.detail;

    }


    if (Array.isArray(result.detail)) {

        return result.detail
            .map(error => error.msg)
            .join(", ");

    }


    return "Unable to review submission.";

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
loadSubmissions();