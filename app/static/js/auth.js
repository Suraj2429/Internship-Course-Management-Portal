// ========================================
// Registration Form
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const data = {

            full_name:
                document.getElementById("full_name").value,

            email:
                document.getElementById("email").value,

            password:
                document.getElementById("password").value
        };


        try {

            const response = await fetch("/auth/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            });


            const result = await response.json();

            const message =
                document.getElementById("message");


            message.classList.remove(
                "d-none",
                "alert-success",
                "alert-danger"
            );


            if (response.ok) {

                message.classList.add(
                    "alert-success"
                );

                message.innerText =
                    "Registration successful. Redirecting to login...";


                setTimeout(function () {

                    window.location.href = "/login";

                }, 1500);


            } else {

                message.classList.add(
                    "alert-danger"
                );

                message.innerText =
                    result.detail ||
                    result.message ||
                    "Registration failed";
            }


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            const message =
                document.getElementById("message");

            message.classList.remove("d-none");

            message.classList.add("alert-danger");

            message.innerText =
                "Unable to connect to the server.";
        }

    });

}



// ========================================
// Login Form
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const formData = new URLSearchParams();


        formData.append(
            "username",
            document.getElementById("email").value
        );


        formData.append(
            "password",
            document.getElementById("password").value
        );


        try {

            const response = await fetch("/auth/login", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            });


            const result = await response.json();


            const message =
                document.getElementById("message");


            message.classList.remove(
                "d-none",
                "alert-success",
                "alert-danger"
            );


            if (response.ok) {


                // Save access token
                localStorage.setItem(
                    "access_token",
                    result.access_token
                );


                // Save user role
                localStorage.setItem(
                    "user_role",
                    result.role
                );


                message.classList.add(
                    "alert-success"
                );


                message.innerText =
                    "Login successful. Redirecting...";


                setTimeout(function () {


                    if (result.role === "admin") {

                        window.location.href =
                            "/admin/dashboard";

                    } else {

                        window.location.href =
                            "/student/dashboard";

                    }


                }, 1000);


            } else {

                message.classList.add(
                    "alert-danger"
                );


                message.innerText =
                    result.detail ||
                    "Login failed";
            }


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            const message =
                document.getElementById("message");


            message.classList.remove(
                "d-none"
            );


            message.classList.add(
                "alert-danger"
            );


            message.innerText =
                "Unable to connect to the server.";
        }

    });

}



// ========================================
// Show / Hide Password
// ========================================

function togglePassword() {

    const passwordInput =
        document.getElementById("password");


    const eyeIcon =
        document.getElementById("eyeIcon");


    if (!passwordInput || !eyeIcon) {

        return;
    }


    // Show password
    if (passwordInput.type === "password") {

        passwordInput.type = "text";


        eyeIcon.classList.remove(
            "bi-eye"
        );


        eyeIcon.classList.add(
            "bi-eye-slash"
        );


    } else {


        // Hide password
        passwordInput.type = "password";


        eyeIcon.classList.remove(
            "bi-eye-slash"
        );


        eyeIcon.classList.add(
            "bi-eye"
        );

    }

}