const token = localStorage.getItem("access_token");
const role = localStorage.getItem("user_role");


// Protect admin page
if (!token || role !== "admin") {

    window.location.href = "/login";

}


// Store loaded internships
let internshipsData = [];


// Load internships
async function loadInternships() {

    try {

        const response = await fetch(
            "/internships/"
        );


        const internships =
            await response.json();


        const table =
            document.getElementById(
                "internshipTable"
            );


        table.innerHTML = "";


        if (!response.ok) {

            table.innerHTML = `

                <tr>

                    <td colspan="6">

                        Unable to load internships.

                    </td>

                </tr>

            `;

            return;
        }


        internshipsData = internships;


        if (internships.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="6">

                        No internships found.

                    </td>

                </tr>

            `;

            return;
        }


        internships.forEach(function (internship) {

            table.innerHTML += `

                <tr>

                    <td>
                        ${internship.id}
                    </td>

                    <td>
                        ${internship.title}
                    </td>

                    <td>
                        ${internship.description}
                    </td>

                    <td>
                        ${internship.duration}
                    </td>

                    <td>
                        ${internship.vacancies}
                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-primary me-2"
                            onclick="openEditModal(${internship.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteInternship(${internship.id})"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `;

        });


    } catch (error) {

        console.error(
            "Internship loading error:",
            error
        );

    }

}



// Open create modal
function openCreateModal() {

    document.getElementById(
        "modalTitle"
    ).innerText = "Create Internship";


    document.getElementById(
        "internshipId"
    ).value = "";


    document.getElementById(
        "internshipForm"
    ).reset();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "internshipModal"
            )
        );


    modal.show();

}



// Open edit modal
function openEditModal(internshipId) {

    const internship =
        internshipsData.find(
            item => item.id === internshipId
        );


    if (!internship) {

        return;

    }


    document.getElementById(
        "modalTitle"
    ).innerText = "Update Internship";


    document.getElementById(
        "internshipId"
    ).value = internship.id;


    document.getElementById(
        "title"
    ).value = internship.title;


    document.getElementById(
        "description"
    ).value = internship.description;


    document.getElementById(
        "duration"
    ).value = internship.duration;


    document.getElementById(
        "vacancies"
    ).value = internship.vacancies;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "internshipModal"
            )
        );


    modal.show();

}



// Create or update internship
document.getElementById(
    "internshipForm"
).addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const internshipId =
            document.getElementById(
                "internshipId"
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

            vacancies:
                Number(
                    document.getElementById(
                        "vacancies"
                    ).value
                )

        };


        let url = "/internships/";

        let method = "POST";


        // Update mode
        if (internshipId) {

            url =
                `/internships/${internshipId}`;

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
                        "internshipModal"
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
                    "Internship saved successfully.",
                    "success"
                );


                await loadInternships();


            } else {


                showMessage(
                    result.detail ||
                    "Unable to save internship.",
                    "danger"
                );

            }


        } catch (error) {


            console.error(
                "Internship save error:",
                error
            );


            showMessage(
                "Unable to save internship.",
                "danger"
            );

        }

    }
);



// Delete internship
async function deleteInternship(internshipId) {

    const confirmed = confirm(
        "Are you sure you want to delete this internship?"
    );


    if (!confirmed) {

        return;

    }


    try {

        const response = await fetch(
            `/internships/${internshipId}`,
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
                "Internship deleted successfully.",
                "success"
            );


            await loadInternships();

        } else {

            showMessage(
                result.detail ||
                "Unable to delete internship.",
                "danger"
            );

        }


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showMessage(
            "Unable to delete internship.",
            "danger"
        );

    }

}



// Show alert message
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


// Load page data
loadInternships();