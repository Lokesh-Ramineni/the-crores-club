async function fetchRoom() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/id/${roomId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load room");
        }

        console.log("Auction room:", data.room);

        roomData = data.room;

        updateRoomInformation(data.room);
        updateHostControls(data.room);
        
    } catch (error) {
        console.error("Failed to fetch auction room:", error);
    }
}
