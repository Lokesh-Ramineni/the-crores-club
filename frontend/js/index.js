const GOOGLE_CLIENT_ID = "891181614976-uok5j7kdhu6bodbf34c9beg8td3rss9a.apps.googleusercontent.com";

const loginForm = document.getElementById("login-form");

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

async function handleGoogleCredential(response) {
    const errorEl = document.getElementById("google-error-login");

    errorEl.textContent = "";

    try {
        await googleLogin(response.credential);

        console.log("Google sign-in successful");

        window.location.href = "./home.html";

    } catch (error) {
        console.log(error.message);
        errorEl.textContent = error.message;
    }
}

function initGoogleSignIn() {
    if (typeof google === "undefined" || !google.accounts) {
        setTimeout(initGoogleSignIn, 200);
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential
    });

    google.accounts.id.renderButton(
        document.getElementById("googleSignInLogin"),
        { theme: "outline", size: "large", width: 280 }
    );
}

initGoogleSignIn();
