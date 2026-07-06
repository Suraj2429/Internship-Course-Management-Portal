const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect admin page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Store courses
let coursesData = [];



// Load all courses
async function loadCourses() {

    try {

        const response = await fetch(
            "/courses/"
        );


        const courses =
            await response.json();


        const table =
            document.getElementById(
                "courseTable"
            );


        table.innerHTML = "";


        if (!response.ok) {

            table.innerHTML = `

                <tr>

                    <td colspan="6">

                        Unable to load courses.

                    </td>

                </tr>

            `;

            return;
        }


        coursesData = courses;


        if (courses.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="6">

                        No courses found.

                    </td>

                </tr>

            `;

            return;
        }


        courses.forEach(function (course) {


            table.innerHTML += `

                <tr>


                    <td>

                        ${course.id}

                    </td>


                    <td>

                        ${course.title}

                    </td>


                    <td>

                        ${course.description}

                    </td>


                    <td>

                        ${course.duration}

                    </td>


                    <td>

                        <span class="badge bg-primary">

                            ${course.level}

                        </span>

                    </td>


                    <td>

                        <button
                            class="btn btn-sm btn-primary me-2"
                            onclick="openEditModal(${course.id})"
                        >
                            Edit
                        </button>


                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteCourse(${course.id})"
                        >
                            Delete
                        </button>

                    </td>


                </tr>

            `;

        });


    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );

    }

}



// Open create modal
function openCreateModal() {

    document.getElementById(
        "modalTitle"
    ).innerText =
        "Create Course";


    document.getElementById(
        "courseId"
    ).value = "";


    document.getElementById(
        "courseForm"
    ).reset();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "courseModal"
            )
        );


    modal.show();

}



// Open edit modal
function openEditModal(courseId) {

    const course =
        coursesData.find(
            item => item.id === courseId
        );


    if (!course) {

        return;

    }


    document.getElementById(
        "modalTitle"
    ).innerText =
        "Update Course";


    document.getElementById(
        "courseId"
    ).value =
        course.id;


    document.getElementById(
        "title"
    ).value =
        course.title;


    document.getElementById(
        "description"
    ).value =
        course.description;


    document.getElementById(
        "duration"
    ).value =
        course.duration;


    document.getElementById(
        "level"
    ).value =
        course.level;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "courseModal"
            )
        );


    modal.show();

}



// Create or update course
document.getElementById(
    "courseForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const courseId =
            document.getElementById(
                "courseId"
            ).value;


        const data = {

            title:
                document.getElementById(
                    "title"
                ).value,

            description:
                document.getElementById(
                    "description"
                ).value,

            duration:
                document.getElementById(
                    "duration"
                ).value,

            level:
                document.getElementById(
                    "level"
                ).value

        };


        let url =
            "/courses/";

        let method =
            "POST";


        // Update mode
        if (courseId) {

            url =
                `/courses/${courseId}`;

            method =
                "PUT";

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
                        "courseModal"
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
                    "Course saved successfully.",
                    "success"
                );


                await loadCourses();


            } else {


                showMessage(
                    result.detail ||
                    "Unable to save course.",
                    "danger"
                );

            }


        } catch (error) {


            console.error(
                "Course save error:",
                error
            );


            showMessage(
                "Unable to save course.",
                "danger"
            );

        }

    }
);



// Delete course
async function deleteCourse(courseId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this course?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(
            `/courses/${courseId}`,
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
                "Course deleted successfully.",
                "success"
            );


            await loadCourses();

        } else {

            showMessage(
                result.detail ||
                "Unable to delete course.",
                "danger"
            );

        }


    } catch (error) {


        console.error(
            "Course delete error:",
            error
        );


        showMessage(
            "Unable to delete course.",
            "danger"
        );

    }

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


// Load courses
loadCourses();