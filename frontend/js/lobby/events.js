startAuctionBtn?.addEventListener("click", () => {
    if (!roomId) {
        alert("Room ID missing");
        return;
    }

    const userId = getCurrentUserId();

    if (!userId) {
        alert("User ID not found");
        return;
    }

    startAuctionBtn.disabled = true;
    startAuctionBtn.textContent = "Starting...";

    socket.emit("auction:start", { roomId, userId });
});

leaveRoomBtn?.addEventListener("click", async () => {
    try {
        leaveRoomBtn.disabled = true;
        leaveRoomBtn.textContent = "Leaving...";

        const data = await leaveRoomRequest();

        console.log("Left room:", data);
        window.location.href = "/join_room";
    } catch (error) {
        console.error("Leave room error:", error);

        alert(error.message || "Failed to leave room");

        leaveRoomBtn.disabled = false;
        leaveRoomBtn.textContent = "Leave Room";
    }
});

copyCodeBtn?.addEventListener("click", copyRoomCode);
copyCodeIcon?.addEventListener("click", copyRoomCode);
shareLinkBtn?.addEventListener("click", shareRoomLink);

fetchRoom();
