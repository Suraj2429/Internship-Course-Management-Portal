const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect student page
if (!token || role !== "student") {

    window.location.href = "/login";

}


// Store submitted task IDs
let submittedTaskIds = [];


// Start page
async function initializePage() {

    await loadSubmissions();

    await loadTasks();

}



// Load assigned tasks
async function loadTasks() {

    try {

        const response = await fetch(
            "/tasks/my",
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


        const tasks = await response.json();


        const container =
            document.getElementById(
                "taskContainer"
            );


        container.innerHTML = "";


        if (!response.ok) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load tasks.

                    </div>

                </div>

            `;

            return;
        }


        if (tasks.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-info">

                        No tasks are assigned to you right now.

                        Your internship application may still be pending.

                    </div>

                </div>

            `;

            return;
        }


        tasks.forEach(function (task) {


            const alreadySubmitted =
                submittedTaskIds.includes(
                    task.task_id
                );


            let actionButton;


            if (alreadySubmitted) {

                actionButton = `

                    <button
                        class="btn btn-secondary"
                        disabled
                    >
                        Submitted
                    </button>

                `;

            } else {

                actionButton = `

                    <button
                        class="btn btn-portal"
                        onclick="openSubmissionModal(
                            ${task.task_id},
                            '${escapeText(task.title)}'
                        )"
                    >
                        Submit Task
                    </button>

                `;

            }


            let deadline = "-";


            if (task.deadline) {

                deadline =
                    new Date(
                        task.deadline
                    ).toLocaleString();

            }


            container.innerHTML += `

                <div class="col-md-6">

                    <div class="portal-card h-100 p-4">


                        <div class="mb-2">

                            <span class="badge bg-primary">

                                ${task.internship}

                            </span>

                        </div>


                        <h4>

                            ${task.title}

                        </h4>


                        <p class="text-muted mt-3">

                            ${task.description}

                        </p>


                        <p>

                            <strong>
                                Deadline:
                            </strong>

                            ${deadline}

                        </p>


                        ${actionButton}


                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.error(
            "Task loading error:",
            error
        );

    }

}



// Open submission modal
function openSubmissionModal(
    taskId,
    taskTitle
) {

    document.getElementById(
        "taskId"
    ).value = taskId;


    document.getElementById(
        "taskTitle"
    ).value = taskTitle;


    document.getElementById(
        "githubLink"
    ).value = "";


    document.getElementById(
        "remarks"
    ).value = "";


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "submissionModal"
            )
        );


    modal.show();

}



// Submit task
document.getElementById(
    "submissionForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const taskId =
            Number(
                document.getElementById(
                    "taskId"
                ).value
            );


        const githubLink =
            document.getElementById(
                "githubLink"
            ).value;


        const remarks =
            document.getElementById(
                "remarks"
            ).value;


        try {

            const response = await fetch(
                "/tasks/submit",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },


                    body: JSON.stringify({

                        task_id: taskId,

                        github_link:
                            githubLink,

                        remarks:
                            remarks

                    })

                }
            );


            const result =
                await response.json();


            if (response.ok) {


                const modalElement =
                    document.getElementById(
                        "submissionModal"
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
                    "Task submitted successfully.",
                    "success"
                );


                await loadSubmissions();

                await loadTasks();


            } else {


                showMessage(
                    result.detail ||
                    "Task submission failed.",
                    "danger"
                );

            }


        } catch (error) {


            console.error(
                "Submission error:",
                error
            );


            showMessage(
                "Unable to submit task.",
                "danger"
            );

        }

    }
);



// Load student's submissions
async function loadSubmissions() {

    try {

        const response = await fetch(
            "/tasks/submissions",
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

            window.location.href =
                "/login";

            return;
        }


        const submissions =
            await response.json();


        const table =
            document.getElementById(
                "submissionTable"
            );


        table.innerHTML = "";


        submittedTaskIds = [];


        if (!response.ok) {

            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        Unable to load submissions.

                    </td>

                </tr>

            `;

            return;
        }


        if (submissions.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        You have not submitted any tasks yet.

                    </td>

                </tr>

            `;

            return;
        }


        submissions.forEach(
            function (submission) {


                /*
                We need task_id in the response
                to disable the Submit button.
                */

                if (submission.task_id) {

                    submittedTaskIds.push(
                        submission.task_id
                    );

                }


                let badgeClass =
                    "bg-warning text-dark";


                if (
                    submission.status ===
                    "Approved"
                ) {

                    badgeClass =
                        "bg-success";

                } else if (
                    submission.status ===
                    "Rejected"
                ) {

                    badgeClass =
                        "bg-danger";

                }


                const marks =
                    submission.marks ?? 0;


                const feedback =
                    submission.feedback ||
                    "Not reviewed yet";


                table.innerHTML += `

                    <tr>


                        <td>

                            ${submission.task}

                        </td>


                        <td>

                            <a
                                href="${submission.github_link}"
                                target="_blank"
                                rel="noopener noreferrer"
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

                            ${feedback}

                        </td>


                    </tr>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Submission loading error:",
            error
        );

    }

}



// Prevent quote issues in button title
function escapeText(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}



// Show message
function showMessage(text, type) {

    const message =
        document.getElementById(
            "message"
        );


    message.className =
        `alert alert-${type}`;


    message.innerText =
        text;


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

    window.location.href =
        "/login";

}


// Initialize
initializePage();