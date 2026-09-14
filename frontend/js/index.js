const loginForm = document.getElementById("login-form");
const signupForm=document.getElementById("signup-form");
const passwordInput = document.getElementById("signup-password");
const passwordHint = document.getElementById("password-hint");


loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginError = document.getElementById("login-error");

    loginError.textContent = "";

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const data = await login(email, password);

        console.log("Login successful");
        console.log(data);

        window.location.href = "./home.html";

    }catch (error) {
        console.log(error.message);
        loginError.textContent = error.message;
    }
});

passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;

    const isValid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /\d/.test(value);

    if (isValid) {
        passwordHint.textContent = "Strong password ✓";
        passwordHint.classList.add("valid");
    } else {
        passwordHint.textContent =
            "Password must contain at least 8 characters, one uppercase letter, and one number.";
        passwordHint.classList.remove("valid");
    }
});
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userError = document.getElementById("username-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    userError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";

    const username = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmpassword = document.getElementById("signup-confirm").value;

    try {

        if (password !== confirmpassword) {
            throw new Error("Passwords do not match.");
        }

        const data = await signup(username, email, password);

        console.log("Signup successful");

        window.location.href = "./home.html";

    } catch (error) {

        console.log(error.message);

        if (error.message === "Username alredy exists.") {
            userError.textContent = error.message;
        }
        else if (error.message === "Email already exists.") {
            emailError.textContent = error.message;
        }
        else if (error.message === "Passwords do not match.") {
            passwordError.textContent = error.message;
        }
    }
});