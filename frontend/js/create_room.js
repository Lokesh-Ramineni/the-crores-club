const API_BASE_URL = "https://the-crores-club.onrender.com";

const form = document.getElementById("createRoomForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const roomType = document.querySelector(
    'input[name="room_type"]:checked'
  )?.value;


  const maxPlayers = Number(
    document.getElementById("maxPlayers").value
  );

  const startingPurseValue = document.querySelector(
    'input[name="starting_purse"]:checked'
  )?.value;

  const timerPerPlayer = Number(
    document.querySelector('input[name="timer_seconds"]:checked')?.value
  );

  const bidExtension = Number(
    document.querySelector('input[name="extension_seconds"]:checked')?.value
  );

  const purseInCrores = Number(
    startingPurseValue.replace(/cr/i, "")
  );

  const startingPurse = purseInCrores * 10000000;

  const allowSpectators = document.querySelector(
    'input[name="allow_spectators"]'
  )?.checked || false;

  const autoStart = document.querySelector(
    'input[name="auto_start"]'
  )?.checked || false;

  const roomData = {
    type: roomType,

    settings: {
      maxPlayers,
      startingPurse,
      timerPerPlayer,
      bidExtension,
      extensionThreshold: bidExtension,

    }
  };

  console.log("Creating room with:", roomData);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/rooms/createroom`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify(roomData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create room");
    }

    console.log("Room created:", data);

    const roomCode = data.room?.code || data.code;

    if (!roomCode) {
      throw new Error("Room created but no room code was returned.");
    }

    const lobbyUrl =`/room_lobby?code=${encodeURIComponent(roomCode)}`;

    console.log("Redirecting to:", lobbyUrl);

    window.location.href = lobbyUrl;

  } catch (error) {
    console.error("Create room error:", error);

    alert(error.message || "Something went wrong while creating the room.");
  }
});