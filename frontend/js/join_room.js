const API_BASE_URL = "https://the-crores-club.onrender.com";

const form = document.getElementById("joinRoomForm");
const roomCodeInput = document.getElementById("roomCodeInput");
const codeError = document.getElementById("codeError");

codeError.style.display = "none";

const params = new URLSearchParams(window.location.search);
const urlCode = params.get("code");

if (urlCode) {
    roomCodeInput.value = urlCode.toUpperCase();
}
console.log("started")

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}



form.addEventListener("submit", async (event) => {
    event.preventDefault();

    codeError.style.display = "none";

    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
    }

    const roomCode =
        roomCodeInput.value.trim().toUpperCase();

    if (!roomCode) {
        showError("Please enter a room code.");
        return;
    }

    if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
        showError("Room code must be 6 letters and numbers.");
        return;
    }

    const submitButton =
        form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Joining...";


    try {

        console.log("Joining room:", roomCode);


        const response = await fetch(
            `${API_BASE_URL}/api/rooms/join`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    code: roomCode
                })
            }
        );


        const data = await response.json();

        console.log("Join response:", data);


        if (!response.ok) {
            throw new Error(
                data.message || "Failed to join room"
            );
        }


        console.log(
            "Successfully joined room:",
            data.code
        );

        window.location.href =
            `/room_lobby?code=${encodeURIComponent(data.code)}`;

    } catch (error) {

        console.error("Join room error:", error);

        showError(error.message);

        submitButton.disabled = false;
        submitButton.textContent = "Join Room";
    }
});

function showError(message) {

    codeError.textContent = message;

    codeError.style.display = "block";

    roomCodeInput.focus();
}