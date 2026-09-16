const socket = io(API_BASE_URL);

socket.on("connect", () => {
    // console.log("Connected to auction:", socket.id);

    socket.emit("joinRoom", { roomId });
});

socket.on("auction:currentPlayer", data => {
    console.log("Current player:", data);

    hasPassed = false;
    passedUserIds = [];

    displayCurrentPlayer(data.player);
    displayCurrentBid(data.currentBid, data.currentBidder);
    startTimer(data.timerEndsAt, data.serverTime);

    if (data.round) {
        roundCurrent.textContent = data.round;
    }

    if (data.totalPlayers) {
        roundTotal.textContent = data.totalPlayers;
    }

    if (data.round && data.totalPlayers) {
        playersLeft.textContent = data.totalPlayers - data.round + 1;
    }
});

socket.on("auction:update", data => {
    // console.log("Auction update:", data);

    displayCurrentBid(data.currentBid, data.currentBidder);
    startTimer(data.timerEndsAt, data.serverTime);
});

socket.on("auction:passUpdate", data => {
    // console.log("Pass update:", data);

    passedUserIds = data.passedUserIds || [];
    renderOtherPlayers();
});

socket.on("bid:error", data => {
    // console.error("Bid error:", data.message);
    alert(data.message || "Unable to place bid");
});

socket.on("auction:error", data => {
    // console.error("Auction error:", data.message);
    alert(data.message || "Auction error");
});

socket.on("player:sold", data => {
    // console.log("Player sold:", data);

    if (data.player) {
        displayCurrentPlayer(data.player);
    }

    if (data.soldPrice) {
        currentBid.textContent = formatCrore(data.soldPrice);
    }

    if (data.buyerUserId) {
        currentBidder.textContent = getUsernameById(data.buyerUserId) || "Unknown player";
    }

});

socket.on("player:unsold", data => {
    // console.log("Player unsold:", data);
    currentBidder.textContent = "Unsold";
});

socket.on("auction:complete", data => {
    // console.log("Auction completed:", data);

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerValue.textContent = "00:00";

    alert("Auction completed!");
});

socket.on("room:updated", room => {
    // console.log("Room updated:", room);

    roomData = room;
    updateRoomInformation(room);
});
