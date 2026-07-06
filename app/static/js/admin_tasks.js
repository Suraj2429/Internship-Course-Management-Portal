const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect admin page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Store data
let tasksData = [];
let internshipsData = [];



// Initialize page
async function initializePage() {

    await loadInternships();

    await loadTasks();

}



// Load internships
async function loadInternships() {

    try {

        const response = await fetch(
            "/internships/"
        );


        const internships =
            await response.json();


        if (!response.ok) {

            showMessage(
                "Unable to load internships.",
                "danger"
            );

            return;
        }


        internshipsData = internships;


        document.getElementById(
            "totalInternships"
        ).innerText = internships.length;


        const internshipSelect =
            document.getElementById(
                "internshipId"
            );


        const internshipFilter =
            document.getElementById(
                "internshipFilter"
            );


        internshipSelect.innerHTML = `

            <option value="">
                Select Internship
            </option>

        `;


        internshipFilter.innerHTML = `

            <option value="All">
                All Internships
            </option>

        `;


        internships.forEach(function (internship) {


            internshipSelect.innerHTML += `

                <option value="${internship.id}">

                    ${internship.title}

                </option>

            `;


            internshipFilter.innerHTML += `

                <option value="${internship.id}">

                    ${internship.title}

                </option>

            `;

        });


    } catch (error) {

        console.error(
            "Internship loading error:",
            error
        );

    }

}



// Load tasks
async function loadTasks() {

    try {

        const response = await fetch(
            "/tasks/"
        );


        const tasks =
            await response.json();


        if (!response.ok) {

            showMessage(
                "Unable to load tasks.",
                "danger"
            );

            return;
        }


        tasksData = tasks;


        updateStatistics();


        displayTasks(tasksData);


    } catch (error) {

        console.error(
            "Task loading error:",
            error
        );


        showMessage(
            "Unable to load tasks.",
            "danger"
        );

    }

}



// Display tasks
function displayTasks(tasks) {

    const table =
        document.getElementById(
            "taskTable"
        );


    table.innerHTML = "";


    if (tasks.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="6">

                    No tasks found.

                </td>

            </tr>

        `;

        return;
    }


    tasks.forEach(function (task) {


        let deadline = "-";


        if (task.deadline) {

            deadline =
                new Date(
                    task.deadline
                ).toLocaleString();

        }


        table.innerHTML += `

            <tr>


                <td>
                    ${task.id}
                </td>


                <td>
                    ${task.title}
                </td>


                <td>

                    <span class="badge bg-primary">

                        ${task.internship.title}

                    </span>

                </td>


                <td>
                    ${task.description}
                </td>


                <td>
                    ${deadline}
                </td>


                <td>

                    <button
                        class="btn btn-sm btn-primary me-2"
                        onclick="openEditModal(${task.id})"
                    >
                        Edit
                    </button>


                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteTask(${task.id})"
                    >
                        Delete
                    </button>

                </td>


            </tr>

        `;

    });

}



// Update statistics
function updateStatistics() {

    document.getElementById(
        "totalTasks"
    ).innerText =
        tasksData.length;


    const internshipIds =
        new Set(
            tasksData.map(
                task => task.internship.id
            )
        );


    document.getElementById(
        "internshipsWithTasks"
    ).innerText =
        internshipIds.size;

}



// Filter tasks
function filterTasks() {

    const selected =
        document.getElementById(
            "internshipFilter"
        ).value;


    if (selected === "All") {

        displayTasks(tasksData);

        return;
    }


    const internshipId =
        Number(selected);


    const filtered =
        tasksData.filter(
            task =>
                task.internship.id ===
                internshipId
        );


    displayTasks(filtered);

}



// Open create modal
function openCreateModal() {

    document.getElementById(
        "modalTitle"
    ).innerText =
        "Create Task";


    document.getElementById(
        "taskId"
    ).value = "";


    document.getElementById(
        "taskForm"
    ).reset();


    // Allow internship selection
    document.getElementById(
        "internshipId"
    ).disabled = false;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "taskModal"
            )
        );


    modal.show();

}



// Open edit modal
function openEditModal(taskId) {

    const task =
        tasksData.find(
            item => item.id === taskId
        );


    if (!task) {

        return;

    }


    document.getElementById(
        "modalTitle"
    ).innerText =
        "Update Task";


    document.getElementById(
        "taskId"
    ).value =
        task.id;


    document.getElementById(
        "internshipId"
    ).value =
        task.internship.id;


    document.getElementById(
        "title"
    ).value =
        task.title;


    document.getElementById(
        "description"
    ).value =
        task.description;


    if (task.deadline) {

        const date =
            new Date(task.deadline);


        const localDate =
            new Date(
                date.getTime() -
                date.getTimezoneOffset() * 60000
            )
            .toISOString()
            .slice(0, 16);


        document.getElementById(
            "deadline"
        ).value =
            localDate;

    }


    /*
    Internship is disabled during update because
    your TaskUpdate schema may not include
    internship_id.
    */

    document.getElementById(
        "internshipId"
    ).disabled = true;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "taskModal"
            )
        );


    modal.show();

}



// Create or update task
document.getElementById(
    "taskForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const taskId =
            document.getElementById(
                "taskId"
            ).value;


        let data;
        let url;
        let method;


        // Create task
        if (!taskId) {


            data = {

                internship_id:
                    Number(
                        document.getElementById(
                            "internshipId"
                        ).value
                    ),

                title:
                    document.getElementById(
                        "title"
                    ).value,

                description:
                    document.getElementById(
                        "description"
                    ).value,

                deadline:
                    document.getElementById(
                        "deadline"
                    ).value

            };


            url = "/tasks/";

            method = "POST";


        } else {


            // Update task
            data = {

                title:
                    document.getElementById(
                        "title"
                    ).value,

                description:
                    document.getElementById(
                        "description"
                    ).value,

                deadline:
                    document.getElementById(
                        "deadline"
                    ).value

            };


            url =
                `/tasks/${taskId}`;


            method = "PUT";

        }


        try {

            const response = await fetch(
                url,
                {

                    method: method,

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
                        "taskModal"
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
                    "Task saved successfully.",
                    "success"
                );


                await loadTasks();


            } else {


                showMessage(
                    getErrorMessage(result),
                    "danger"
                );

            }


        } catch (error) {


            console.error(
                "Task save error:",
                error
            );


            showMessage(
                "Unable to save task.",
                "danger"
            );

        }

    }
);



// Delete task
async function deleteTask(taskId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(
            `/tasks/${taskId}`,
            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        const result =
            await response.json();


        if (response.ok) {


            showMessage(
                result.message ||
                "Task deleted successfully.",
                "success"
            );


            await loadTasks();


        } else {


            showMessage(
                result.detail ||
                "Unable to delete task.",
                "danger"
            );

        }


    } catch (error) {


        console.error(
            "Task delete error:",
            error
        );


        showMessage(
            "Unable to delete task.",
            "danger"
        );

    }

}



// Handle FastAPI validation errors
function getErrorMessage(result) {

    if (typeof result.detail === "string") {

        return result.detail;

    }


    if (Array.isArray(result.detail)) {

        return result.detail
            .map(error => error.msg)
            .join(", ");

    }


    return "Unable to save task.";

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


// Start page
initializePage();