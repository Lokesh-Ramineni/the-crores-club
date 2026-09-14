// const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = "http://10.151.73.123:3000";

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

    console.log("Status:", response.status);
    console.log("URL:", response.url);

    const text = await response.text();

    console.log("Response:", text);

    const data = JSON.parse(text);

    if (!response.ok) {
        throw new Error(data.message);
    }

    localStorage.setItem("token", data.token);

    return data;
}

async function signup(username,email,password) {
    const response=await fetch(
        `${API_BASE_URL}/api/auth/signup`,
        {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    )

    const text = await response.text();

    const data = JSON.parse(text);

    if (!response.ok) {
        throw new Error(data.message);
    }

    localStorage.setItem("token", data.token);

    return data;
}
