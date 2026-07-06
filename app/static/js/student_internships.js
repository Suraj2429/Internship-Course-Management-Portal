const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect page
if (!token || role !== "student") {

    window.location.href = "/login";

}


// Store application information
let appliedInternshipIds = [];


// Load page data
async function initializePage() {

    await loadMyApplications();

    await loadInternships();

}


// Load all internships
async function loadInternships() {

    try {

        const response = await fetch("/internships/");

        const internships = await response.json();

        const container =
            document.getElementById("internshipContainer");


        container.innerHTML = "";


        if (!response.ok) {

            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Unable to load internships.
                    </div>
                </div>
            `;

            return;
        }


        if (internships.length === 0) {

            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        No internships are available right now.
                    </div>
                </div>
            `;

            return;
        }


        internships.forEach(function (internship) {

            const alreadyApplied =
                appliedInternshipIds.includes(internship.id);


            const button = alreadyApplied

                ? `
                    <button
                        class="btn btn-secondary"
                        disabled
                    >
                        Already Applied
                    </button>
                `

                : `
                    <button
                        class="btn btn-portal"
                        onclick="applyInternship(${internship.id})"
                    >
                        Apply Now
                    </button>
                `;


            container.innerHTML += `

                <div class="col-md-6 col-lg-4">

                    <div class="portal-card h-100 p-4">

                        <h4>
                            ${internship.title}
                        </h4>

                        <p class="text-muted mt-3">
                            ${internship.description}
                        </p>

                        <div class="mb-2">

                            <strong>
                                Duration:
                            </strong>

                            ${internship.duration}

                        </div>


                        <div class="mb-4">

                            <strong>
                                Vacancies:
                            </strong>

                            ${internship.vacancies}

                        </div>


                        ${button}

                    </div>

                </div>

            `;

        });

    } catch (error) {

        console.error(
            "Internship loading error:",
            error
        );

    }

}


// Apply for internship
// Apply for internship
async function applyInternship(internshipId) {

    try {

        const response = await fetch(
            `/applications/${internshipId}`,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const result = await response.json();


        if (response.ok) {

            showMessage(
                result.message ||
                "Application submitted successfully.",
                "success"
            );


            await loadMyApplications();

            await loadInternships();

        } else {

            showMessage(
                result.detail ||
                "Application failed.",
                "danger"
            );

        }

    } catch (error) {

        console.error(
            "Application error:",
            error
        );


        showMessage(
            "Unable to submit application.",
            "danger"
        );

    }

}


// Load student's applications
async function loadMyApplications() {

    try {

        const response = await fetch(
            "/applications/my",
            {
                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


        if (response.status === 401 ||
            response.status === 403) {

            localStorage.clear();

            window.location.href = "/login";

            return;
        }


        const applications = await response.json();

        const table =
            document.getElementById("applicationTable");


        table.innerHTML = "";

        appliedInternshipIds = [];


        if (!response.ok) {

            table.innerHTML = `

                <tr>

                    <td colspan="3">
                        Unable to load applications.
                    </td>

                </tr>

            `;

            return;
        }


        if (applications.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="3">
                        You have not applied for any internship.
                    </td>

                </tr>

            `;

            return;
        }


        applications.forEach(function (application) {

            /*
            Expected backend response:

            {
                application_id: 1,

                internship: {
                    id: 1,
                    title: "Python Internship"
                },

                status: "Pending"
            }
            */


            appliedInternshipIds.push(
                application.internship.id
            );


            let badgeClass = "bg-warning text-dark";


            if (application.status === "Approved") {

                badgeClass = "bg-success";

            } else if (
                application.status === "Rejected"
            ) {

                badgeClass = "bg-danger";

            }


            table.innerHTML += `

                <tr>

                    <td>
                        ${application.application_id}
                    </td>

                    <td>
                        ${application.internship.title}
                    </td>

                    <td>

                        <span class="badge ${badgeClass}">

                            ${application.status}

                        </span>

                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(
            "Application loading error:",
            error
        );

    }

}


// Show success or error message
function showMessage(text, type) {

    const message =
        document.getElementById("message");


    message.className =
        `alert alert-${type}`;


    message.innerText = text;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    setTimeout(function () {

        message.classList.add("d-none");

    }, 3000);

}


// Logout
function logout() {

    localStorage.clear();

    window.location.href = "/login";

}


// Start page
initializePage();