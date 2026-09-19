const loginForm = document.getElementById("login-form");
const signupForm=document.getElementById("signup-form");
const passwordInput = document.getElementById("signup-password");
const passwordHint = document.getElementById("password-hint");

const signupPanel = document.querySelector(".panel--signup");
const otpPanel = document.getElementById("otpPanel");
const otpForm = document.getElementById("otp-form");
const otpCodeInput = document.getElementById("otp-code");
const otpError = document.getElementById("otp-error");
const otpEmailDisplay = document.getElementById("otpEmailDisplay");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const backToSignupBtn = document.getElementById("backToSignupBtn");

let pendingSignup = null;

function showOtpPanel(email) {
    otpEmailDisplay.textContent = email;
    otpError.textContent = "";
    otpCodeInput.value = "";
    signupPanel.style.display = "none";
    otpPanel.style.display = "block";
    otpCodeInput.focus();
}

function showSignupPanel() {
    otpPanel.style.display = "none";
    signupPanel.style.display = ""; 
    pendingSignup = null;
}


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

        await requestSignupOtp(username, email, password);

        pendingSignup = { username, email, password };

        showOtpPanel(email);

    } catch (error) {

        console.log(error.message);

        if (error.message === "Username already exists.") {
            userError.textContent = error.message;
        }
        else if (error.message === "Email already exists.") {
            emailError.textContent = error.message;
        }
        else if (error.message === "Passwords do not match.") {
            passwordError.textContent = error.message;
        }
        else {
            emailError.textContent = error.message;
        }
    }
});

otpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    otpError.textContent = "";

    if (!pendingSignup) {
        showSignupPanel();
        return;
    }

    try {
        await verifySignupOtp(pendingSignup.email, otpCodeInput.value.trim());

        console.log("Signup successful");

        window.location.href = "./home.html";

    } catch (error) {
        console.log(error.message);
        otpError.textContent = error.message;
    }
});

resendOtpBtn.addEventListener("click", async () => {
    if (!pendingSignup) {
        return;
    }

    otpError.textContent = "";
    resendOtpBtn.disabled = true;
    const originalText = resendOtpBtn.textContent;
    resendOtpBtn.textContent = "Sending...";

    try {
        await requestSignupOtp(pendingSignup.username, pendingSignup.email, pendingSignup.password);
        otpError.textContent = "A new code has been sent.";
        otpError.classList.remove("password-error");
    } catch (error) {
        otpError.textContent = error.message;
    } finally {
        resendOtpBtn.disabled = false;
        resendOtpBtn.textContent = originalText;
    }
});

backToSignupBtn.addEventListener("click", () => {
    showSignupPanel();
});