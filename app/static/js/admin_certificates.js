const token =
    localStorage.getItem("access_token");

const role =
    localStorage.getItem("user_role");


// Protect admin page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Store approved applications
let approvedApplications = [];



// Load approved applications
async function loadApprovedApplications() {

    try {

        const response = await fetch(
            "/applications/",
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


        // Keep only approved applications
        approvedApplications =
            applications.filter(
                application =>
                    application.status ===
                    "Approved"
            );


        loadStudentOptions();

        displayApprovedApplications();


    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );


        showMessage(
            "Unable to load approved applications.",
            "danger"
        );

    }

}



// Load unique students
function loadStudentOptions() {

    const studentSelect =
        document.getElementById(
            "studentId"
        );


    studentSelect.innerHTML = `

        <option value="">
            Select Student
        </option>

    `;


    const uniqueStudents =
        new Map();


    approvedApplications.forEach(
        function (application) {

            uniqueStudents.set(
                application.student.id,
                application.student
            );

        }
    );


    uniqueStudents.forEach(
        function (student) {

            studentSelect.innerHTML += `

                <option value="${student.id}">

                    ${student.name}
                    (${student.email})

                </option>

            `;

        }
    );

}



// Load internships for selected student
function loadStudentInternships() {

    const studentId =
        Number(
            document.getElementById(
                "studentId"
            ).value
        );


    const internshipSelect =
        document.getElementById(
            "internshipId"
        );


    internshipSelect.innerHTML = `

        <option value="">
            Select Internship
        </option>

    `;


    if (!studentId) {

        return;

    }


    const studentApplications =
        approvedApplications.filter(
            application =>
                application.student.id ===
                studentId
        );


    studentApplications.forEach(
        function (application) {

            internshipSelect.innerHTML += `

                <option
                    value="${application.internship.id}"
                >

                    ${application.internship.title}

                </option>

            `;

        }
    );

}



// Display approved applications
function displayApprovedApplications() {

    const table =
        document.getElementById(
            "eligibleTable"
        );


    table.innerHTML = "";


    if (approvedApplications.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="3">

                    No approved internship applications found.

                </td>

            </tr>

        `;

        return;

    }


    approvedApplications.forEach(
        function (application) {

            table.innerHTML += `

                <tr>


                    <td>

                        <strong>
                            ${application.student.name}
                        </strong>

                        <br>

                        <small class="text-muted">

                            ${application.student.email}

                        </small>

                    </td>


                    <td>

                        ${application.internship.title}

                    </td>


                    <td>

                        <span class="badge bg-success">

                            Approved

                        </span>

                    </td>


                </tr>

            `;

        }
    );

}



// Generate certificate
document.getElementById(
    "certificateForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const studentId =
            Number(
                document.getElementById(
                    "studentId"
                ).value
            );


        const internshipId =
            Number(
                document.getElementById(
                    "internshipId"
                ).value
            );


        const data = {

            student_id: studentId,

            internship_id: internshipId

        };


        try {

            const response = await fetch(
                "/certificates/generate",
                {

                    method: "POST",

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

                showMessage(
                    `${result.message}. Certificate Number: ${result.certificate.certificate_number}`,
                    "success"
                );


                document.getElementById(
                    "certificateForm"
                ).reset();


                document.getElementById(
                    "internshipId"
                ).innerHTML = `

                    <option value="">
                        Select Internship
                    </option>

                `;


            } else {

                showMessage(
                    getErrorMessage(result),
                    "danger"
                );

            }


        } catch (error) {

            console.error(
                "Certificate generation error:",
                error
            );


            showMessage(
                "Unable to generate certificate.",
                "danger"
            );

        }

    }
);



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


    return "Unable to generate certificate.";

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

    }, 5000);

}



// Logout
function logout() {

    localStorage.clear();

    window.location.href = "/login";

}


// Start page
loadApprovedApplications();