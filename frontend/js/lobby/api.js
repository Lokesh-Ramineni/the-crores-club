async function fetchRoom() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/rooms/${encodeURIComponent(roomCode)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to load room");
        }
        console.log("Room data:", data);

        roomId = data.room._id;
        renderRoom(data.room);

        socket.emit("joinRoom", { roomId: roomId });
    } catch (error) {
        window.location.href = "home.html"
        console.error("Lobby error:", error);
    }
}

async function leaveRoomRequest() {
    const response = await fetch(
        `${API_BASE_URL}/api/rooms/${encodeURIComponent(roomCode)}/leave`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to leave room");
    }

    return data;
}
