function renderRoom(room) {
    roomCodeElement.textContent = room.code;
    playerMax.textContent = room.settings.maxPlayers;
    playerCount.textContent = room.participants.length;

    const purseInCrores = room.settings.startingPurse / 10000000;

    lobbySummary.innerHTML = `
        <span class="lobby-summary__chip">
            ₹${purseInCrores} Cr
        </span>

        <span class="lobby-summary__chip">
            ${room.settings.timerPerPlayer}s Timer
        </span>

        <span class="lobby-summary__chip">
            +${room.settings.bidExtension}s Extension
        </span>
    `;

    renderPlayers(room);

    const currentUserId = getCurrentUserId();
    const hostId = room.hostId._id || room.hostId;
    const isHost = String(currentUserId) === String(hostId);

    if (isHost) {
        startAuctionBtn.style.display = "block";

        if (room.participants.length >= 2) {
            startAuctionBtn.disabled = false;
            startHint.textContent = "Everyone is ready. Start the auction!";
        } else {
            startAuctionBtn.disabled = true;
            startHint.textContent = "Waiting for at least 2 players to begin";
        }
    } else {
        startAuctionBtn.style.display = "none";
        startHint.textContent = "Waiting for the host to start the auction";
    }
}

function renderPlayers(room) {
    playerList.innerHTML = "";

    room.participants.forEach((participant) => {
        const username = participant.userId.username;
        const firstLetter = username.charAt(0).toUpperCase();
        const userId = participant.userId._id;
        const hostId = room.hostId._id || room.hostId;
        const isHost = String(userId) === String(hostId);

        const li = document.createElement("li");
        li.className = "player-row";

        li.innerHTML = `
            <span class="player-row__avatar">
                ${firstLetter}
            </span>

            <span class="player-row__name">
                ${username}
            </span>

            ${
                isHost
                    ? `<span class="player-row__badge">Host</span>`
                    : ""
            }
        `;

        playerList.appendChild(li);
    });

    if (room.participants.length < room.settings.maxPlayers) {
        const waitingRow = document.createElement("li");
        waitingRow.className = "player-row player-row--empty";

        waitingRow.innerHTML = `
            <span class="player-row__avatar player-row__avatar--empty">
                ...
            </span>

            <span class="player-row__name player-row__name--muted">
                Waiting for players
                <span class="waiting-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </span>
        `;

        playerList.appendChild(waitingRow);
    }
}

function getCurrentUserId() {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
    } catch (error) {
        console.error("Could not read user from token", error);
        return null;
    }
}
