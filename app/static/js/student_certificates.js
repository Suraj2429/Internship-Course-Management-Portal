const token =
    localStorage.getItem("access_token");

const role =
    localStorage.getItem("user_role");


// Protect student page
if (!token || role !== "student") {

    window.location.href = "/login";

}


let internshipsData = [];



// Initialize page
async function initializePage() {

    await loadInternships();

    await loadCertificates();

}



// Load internships for title mapping
async function loadInternships() {

    try {

        const response = await fetch(
            "/internships/"
        );


        if (response.ok) {

            internshipsData =
                await response.json();

        }


    } catch (error) {

        console.error(
            "Internship loading error:",
            error
        );

    }

}



// Load student certificates
async function loadCertificates() {

    try {

        const response = await fetch(
            "/certificates/my",
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


        const certificates =
            await response.json();


        const container =
            document.getElementById(
                "certificateContainer"
            );


        container.innerHTML = "";


        if (!response.ok) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-danger">

                        Unable to load certificates.

                    </div>

                </div>

            `;

            return;

        }


        if (certificates.length === 0) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="alert alert-info">

                        You do not have any certificates yet.

                    </div>

                </div>

            `;

            return;

        }


        certificates.forEach(
            function (certificate) {


                const internship =
                    internshipsData.find(
                        item =>
                            item.id ===
                            certificate.internship_id
                    );


                const internshipTitle =
                    internship
                        ? internship.title
                        : "Internship Program";


                container.innerHTML += `

                    <div class="col-md-6 col-lg-4">


                        <div class="portal-card h-100 p-4">


                            <div class="mb-3">

                                <span class="badge bg-success">

                                    Completed

                                </span>

                            </div>


                            <h4>

                                Certificate of Completion

                            </h4>


                            <p class="text-muted mt-3">

                                ${internshipTitle}

                            </p>


                            <p>

                                <strong>
                                    Certificate Number:
                                </strong>

                                <br>

                                ${certificate.certificate_number}

                            </p>


                            <button
                                class="btn btn-portal w-100"
                                onclick="downloadCertificate(
                                    ${certificate.id},
                                    '${certificate.certificate_number}'
                                )"
                            >

                                Download Certificate

                            </button>


                        </div>


                    </div>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Certificate loading error:",
            error
        );

    }

}



// Download certificate with Authorization header
async function downloadCertificate(
    certificateId,
    certificateNumber
) {

    try {

        const response = await fetch(
            `/certificates/download/${certificateId}`,
            {

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        if (!response.ok) {

            const result =
                await response.json();


            showMessage(
                result.detail ||
                "Unable to download certificate.",
                "danger"
            );

            return;

        }


        const blob =
            await response.blob();


        const fileUrl =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href = fileUrl;


        link.download =
            `${certificateNumber}.pdf`;


        document.body.appendChild(link);


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            fileUrl
        );


        showMessage(
            "Certificate downloaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Certificate download error:",
            error
        );


        showMessage(
            "Unable to download certificate.",
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


// Start page
initializePage();