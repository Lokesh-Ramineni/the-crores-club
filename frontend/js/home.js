const API_BASEURL ="https://the-crores-club.onrender.com";

async function getCurrentUser() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "./index.html";
        return;
    }


    const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data.user;
}

function displayUsername(user) {
    document.getElementById("userName").textContent = user.username;
    const avatar=user.username[0];
    document.getElementById("userAvatarInitial").textContent=avatar;
    document.getElementsByClassName("user-pill__avatar user-pill__avatar--lg")[0].textContent=avatar;  
    document.getElementById("userNameMenu").textContent =user.username;
    document.getElementById("userNameCard").textContent =user.username;
}
async function loadHomePage() {
    try {
        const user = await getCurrentUser();
        displayUsername(user);

    } catch (error) {
        console.log("Error:", error.message);

        localStorage.removeItem("token");
        window.location.href = "./index.html";
    }
}

function logout(){
    localStorage.removeItem('token');
    window.location.href = "./index.html";
}

loadHomePage();
