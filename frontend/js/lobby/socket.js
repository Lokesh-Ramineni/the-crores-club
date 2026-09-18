const socket = io(API_BASE_URL);

socket.on("room:updated", (room) => {
    console.log("Room updated:", room);
    renderRoom(room);
});

socket.on("auction:currentPlayer", (data) => {
    console.log("Auction started:", data);
    console.log("Player:", data.player.name);
    console.log("Base price:", data.player.basePrice);
    console.log("Timer ends:", data.timerEndsAt);

    window.location.href = `/auction_room?roomId=${encodeURIComponent(roomId)}`;
});

socket.on("auction:error", (data) => {
    console.error("Auction error:", data.message);

    alert(data.message || "Failed to start auction");

    startAuctionBtn.disabled = false;
    startAuctionBtn.textContent = "Start Auction";
});
