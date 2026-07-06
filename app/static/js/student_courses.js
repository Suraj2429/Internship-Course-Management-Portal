const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect student page
if (!token || role !== "student") {

    window.location.href = "/login";

}


// Store IDs of enrolled courses
let enrolledCourseIds = [];


// Initialize page
async function initializePage() {

    await loadMyCourses();

    await loadCourses();

}



// Load all available courses
async function loadCourses() {

    try {

        const response = await fetch(
            "/courses/"
        );


        const courses = await response.json();


        const container =
            document.getElementById(
                "courseContainer"
            );


        container.innerHTML = "";


        if (!response.ok) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load courses.

                    </div>

                </div>

            `;

            return;
        }


        if (courses.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-info">

                        No courses are available right now.

                    </div>

                </div>

            `;

            return;
        }


        courses.forEach(function (course) {


            const alreadyEnrolled =
                enrolledCourseIds.includes(
                    course.id
                );


            let button;


            if (alreadyEnrolled) {

                button = `

                    <button
                        class="btn btn-secondary"
                        disabled
                    >
                        Enrolled
                    </button>

                `;

            } else {

                button = `

                    <button
                        class="btn btn-portal"
                        onclick="enrollCourse(${course.id})"
                    >
                        Enroll Now
                    </button>

                `;

            }


            container.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="portal-card h-100 p-4">


                        <h4>
                            ${course.title}
                        </h4>


                        <p class="text-muted mt-3">

                            ${course.description}

                        </p>


                        <div class="mb-2">

                            <strong>
                                Duration:
                            </strong>

                            ${course.duration}

                        </div>


                        <div class="mb-4">

                            <strong>
                                Level:
                            </strong>

                            ${course.level}

                        </div>


                        ${button}


                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );

    }

}



// Enroll in course
async function enrollCourse(courseId) {

    try {

        const response = await fetch(
            "/courses/enroll",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },


                body: JSON.stringify({

                    course_id: courseId

                })

            }
        );


        const result =
            await response.json();


        if (response.ok) {

            showMessage(
                result.message ||
                "Course enrollment successful.",
                "success"
            );


            await loadMyCourses();

            await loadCourses();

        } else {

            showMessage(
                result.detail ||
                "Enrollment failed.",
                "danger"
            );

        }


    } catch (error) {

        console.error(
            "Enrollment error:",
            error
        );


        showMessage(
            "Unable to enroll in course.",
            "danger"
        );

    }

}



// Load enrolled courses
async function loadMyCourses() {

    try {

        const response = await fetch(
            "/courses/my",
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


        const enrollments =
            await response.json();


        const table =
            document.getElementById(
                "enrollmentTable"
            );


        table.innerHTML = "";


        enrolledCourseIds = [];


        if (!response.ok) {

            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        Unable to load enrolled courses.

                    </td>

                </tr>

            `;

            return;
        }


        if (enrollments.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        You have not enrolled in any course.

                    </td>

                </tr>

            `;

            return;
        }


        enrollments.forEach(
            function (enrollment) {


                enrolledCourseIds.push(
                    enrollment.course.id
                );


                let enrolledDate = "-";


                if (enrollment.enrolled_at) {

                    enrolledDate =
                        new Date(
                            enrollment.enrolled_at
                        ).toLocaleDateString();

                }


                table.innerHTML += `

                    <tr>


                        <td>

                            ${enrollment.enrollment_id}

                        </td>


                        <td>

                            ${enrollment.course.title}

                        </td>


                        <td>

                            ${enrollment.course.duration}

                        </td>


                        <td>

                            <span class="badge bg-primary">

                                ${enrollment.course.level}

                            </span>

                        </td>


                        <td>

                            ${enrolledDate}

                        </td>


                    </tr>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Enrolled course loading error:",
            error
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


// Start page
initializePage();