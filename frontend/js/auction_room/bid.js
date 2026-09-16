function placeBid(incrementCrore) {
    if (!roomId) {
        return;
    }

    if (!userId) {
        alert("You are not logged in");
        return;
    }

    if (hasPassed) {
        alert("You have passed this player");
        return;
    }

    const increment = Number(incrementCrore) * 10000000;
    const bidAmount = currentBidAmount + increment;

    // console.log("Placing bid:", bidAmount);

    socket.emit("bid:place", { roomId, userId, bidAmount });
}

bidButtons.forEach(button => {
    button.addEventListener("click", () => {
        const increment = Number(button.dataset.increment);
        placeBid(increment);
    });
});

passBtn?.addEventListener("click", () => {
    if (hasPassed) {
        return;
    }

    if (currentBidderId && String(currentBidderId) === String(userId)) {
        alert("You are already the highest bidder");
        return;
    }

    hasPassed = true;
    passBtn.disabled = true;
    passBtn.textContent = "Passed";

    updateBidButtons();

    socket.emit("bid:pass", { roomId, userId });
});
