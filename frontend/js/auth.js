const API_BASE_URL = "https://the-crores-club.onrender.com";

async function login(email, password) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const text = await response.text();

    console.log("Response:", text);

    const data = JSON.parse(text);

    if (!response.ok) {
        throw new Error(data.message);
    }

    localStorage.setItem("token", data.token);

    return data;
}

async function requestSignupOtp(username, email, password) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/signup/request-otp`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    );

    const text = await response.text();
    const data = JSON.parse(text);

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}

async function verifySignupOtp(email, otp) {
    const response = await fetch(
        `${API_BASE_URL}/api/auth/signup/verify-otp`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                otp
            })
        }
    );

    const text = await response.text();
    const data = JSON.parse(text);

    if (!response.ok) {
        throw new Error(data.message);
    }

    localStorage.setItem("token", data.token);

    return data;
}
