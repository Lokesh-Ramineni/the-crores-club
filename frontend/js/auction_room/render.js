function getUsernameById(id) {
    if (!id || !roomData || !roomData.participants) {
        return null;
    }

    const participant = roomData.participants.find(
        p => String(p.userId?._id || p.userId) === String(id)
    );

    return participant?.userId?.username || null;
}

function displayCurrentPlayer(player) {
    if (!player) {
        return;
    }

    currentPlayer = player;

    playerName.textContent = player.name || "Unknown Player";
    playerRole.textContent = player.role || "Unknown";
    playerBase.textContent = formatCrore(player.basePrice);
    playerAvatar.textContent = getInitials(player.name);

    playerTag.textContent = player.country || "Unknown";
}

function displayCurrentBid(bidAmount, bidderId) {
    currentBidAmount = bidAmount || 0;
    currentBid.textContent = formatCrore(currentBidAmount);
    currentBidderId = bidderId || null;

    refreshBidderNameDisplay();

    const isNowHighestBidder =
        currentBidderId && String(currentBidderId) === String(userId);

    if (wasHighestBidder && !isNowHighestBidder && currentBidderId) {
        outbidAlert.style.display = "flex";
    } else {
        outbidAlert.style.display = "none";
    }

    wasHighestBidder = isNowHighestBidder;

    updateBidButtons();
    renderOtherPlayers();
}

function refreshBidderNameDisplay() {
    if (!currentBidderId) {
        currentBidder.textContent = "No bids";
        return;
    }

    currentBidder.textContent = getUsernameById(currentBidderId) || "Unknown player";
}

function updateBidButtons() {
    const isCurrentHighestBidder =
        currentBidderId &&
        String(currentBidderId) === String(userId);

    const myParticipant = roomData?.participants?.find(
        p => String(p.userId?._id || p.userId) === String(userId)
    );

    const squadSize = myParticipant?.squad?.length || 0;
    const maxPlayers = 20;
    const squadFull = squadSize >= maxPlayers;

    bidButtons.forEach(button => {
        const incrementCrore = Number(button.dataset.increment);
        const increment = incrementCrore * 10000000;
        const nextBid = currentBidAmount + increment;

        button.title = `Bid ${formatCrore(nextBid)}`;

        button.disabled =
            hasPassed ||
            isCurrentHighestBidder ||
            squadFull;
    });

    if (passBtn) {
        // console.log("disabled")
        passBtn.disabled =
            hasPassed ||
            isCurrentHighestBidder ||
            squadFull;
    }
}


function updateRoomInformation(room) {
    if (!room || !room.participants) {
        return;
    }

    const participant = room.participants.find(
        p => String(p.userId?._id || p.userId) === String(userId)
    );

    if (!participant) {
        return;
    }

    yourPurse.textContent = formatCrore(participant.purseRemaining);

    const squadSize = participant.squad?.length || 0;
    // const maxPlayers = room.settings?.maxPlayers || 0;
    const maxPlayers=20 ;

    squadCount.textContent = `${squadSize} / ${maxPlayers}`;

    if (squadSize >= maxPlayers) {
        bidButtons.forEach(button => {
            button.disabled = true;
        });

        passBtn.disabled = true;
    }

    renderOtherPlayers();
    refreshBidderNameDisplay();
    renderMyPurchases();
}

function updateHostControls(room) {
    if (!room) {
        return;
    }

    const hostId = room.hostId?._id || room.hostId;

    isHost = String(hostId) === String(userId);

    if (hostControls) {
        hostControls.style.display = isHost ? "flex" : "none";
    }
}


function renderOtherPlayers() {
    if (!otherPlayersList || !roomData || !roomData.participants) {
        return;
    }

    // const maxPlayers = roomData.settings?.maxPlayers || 0;
    const maxPlayers=20;

    otherPlayersList.innerHTML = "";

    roomData.participants.forEach(participant => {
        const participantId = participant.userId?._id || participant.userId;

        if (String(participantId) === String(userId)) {
            return;
        }

        const name = participant.userId?.username || "Player";
        const squadFull = (participant.squad?.length || 0) >= maxPlayers;
        const isActiveBidder =
            currentBidderId && String(participantId) === String(currentBidderId);
        const participantPassed = passedUserIds.some(
            id => String(id) === String(participantId)
        );

        let chipClass = "player-chip";
        let value = formatCrore(participant.purseRemaining);

        if (isActiveBidder) {
            chipClass += " player-chip--active";
            value = formatCrore(currentBidAmount);
        } else if (squadFull) {
            chipClass += " player-chip--full";
            value = "squad full";
        } else if (participantPassed) {
            chipClass += " player-chip--passed";
            value = "passed";
        }

        const chip = document.createElement("div");
        chip.className = chipClass;
        chip.innerHTML = `
            <span class="player-chip__name">${name}</span>
            <span class="player-chip__value">${value}</span>
        `;

        otherPlayersList.appendChild(chip);
    });
}
