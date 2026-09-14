const API_BASE_URL = "http://10.151.73.123:3000";

const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);

const roomCode = params.get("code");

const leaveRoomBtn = document.getElementById("leaveRoomBtn");

console.log("Room code:", roomCode);


if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

if (!roomCode) {
    alert("No room code found.");
    window.location.href = "home.html";
}

const roomCodeElement =
    document.getElementById("roomCode");

const lobbySummary =
    document.getElementById("lobbySummary");

const playerList =
    document.getElementById("playerList");

const playerCount =
    document.getElementById("playerCount");

const playerMax =
    document.getElementById("playerMax");

const startAuctionBtn =
    document.getElementById("startAuctionBtn");

const startHint =
    document.querySelector(".start-hint");

const copyCodeBtn =
    document.getElementById("copyCodeBtn");

const copyCodeIcon =
    document.getElementById("copyCodeIcon");

const shareLinkBtn =
    document.getElementById("shareLinkBtn");


// ------------------------------------
// Fetch room
// ------------------------------------

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

            throw new Error(
                data.message || "Failed to load room"
            );

        }


        console.log("Room data:", data);


        renderRoom(data.room);


    } catch (error) {
        window.location.href=". /home.hmtl"
        console.error("Lobby error:", error);

    }

}

function renderRoom(room) {

    // Room code

    roomCodeElement.textContent =
        room.code;


    // Maximum players

    playerMax.textContent =
        room.settings.maxPlayers;


    // Player count

    playerCount.textContent =
        room.participants.length;


    // Settings

    const purseInCrores =
        room.settings.startingPurse / 10000000;


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


    // Players

    renderPlayers(room);


    // Host controls

    const currentUserId =
        getCurrentUserId();


    const hostId =
        room.hostId._id || room.hostId;


    const isHost =
        String(currentUserId) === String(hostId);


    if (isHost) {

        startAuctionBtn.style.display =
            "block";


        if (room.participants.length >= 2) {

            startAuctionBtn.disabled = false;

            startHint.textContent =
                "Everyone is ready. Start the auction!";

        } else {

            startAuctionBtn.disabled = true;

            startHint.textContent =
                "Waiting for at least 2 players to begin";

        }

    } else {

        startAuctionBtn.style.display =
            "none";

        startHint.textContent =
            "Waiting for the host to start the auction";

    }

}


// ------------------------------------
// Render players
// ------------------------------------

function renderPlayers(room) {

    playerList.innerHTML = "";


    room.participants.forEach((participant) => {

        const username =
            participant.userId.username;


        const firstLetter =
            username.charAt(0).toUpperCase();


        const userId =
            participant.userId._id;


        const hostId =
            room.hostId._id || room.hostId;


        const isHost =
            String(userId) === String(hostId);


        const li =
            document.createElement("li");


        li.className =
            "player-row";


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


    // Waiting row

    if (
        room.participants.length <
        room.settings.maxPlayers
    ) {

        const waitingRow =
            document.createElement("li");


        waitingRow.className =
            "player-row player-row--empty";


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


// ------------------------------------
// Get current logged-in user ID
// ------------------------------------

function getCurrentUserId() {

    try {

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
                )
            );


        return payload.userId;

    } catch (error) {

        console.error(
            "Could not read user from token",
            error
        );

        return null;

    }

}


// ------------------------------------
// Copy room code
// ------------------------------------

async function copyRoomCode() {

    try {

        await navigator.clipboard.writeText(
            roomCode
        );

        alert("Room code copied!");

    } catch (error) {

        console.error(error);

    }

}


copyCodeBtn?.addEventListener(
    "click",
    copyRoomCode
);


copyCodeIcon?.addEventListener(
    "click",
    copyRoomCode
);


// ------------------------------------
// Share room
// ------------------------------------

shareLinkBtn?.addEventListener(
    "click",
    async () => {

        const shareUrl =
            window.location.href;


        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Join my IPL Auction",
                    text: `Join my auction room: ${roomCode}`,
                    url: shareUrl
                });

            } catch (error) {

                console.log(
                    "Share cancelled"
                );

            }

        } else {

            await navigator.clipboard.writeText(
                shareUrl
            );

            alert("Room link copied!");

        }

    }
);


leaveRoomBtn?.addEventListener("click", async () => {
    // const confirmed = confirm(
    //     "Are you sure you want to leave this room?"
    // );

    // if (!confirmed) {
    //     return;
    // }

    try {
        leaveRoomBtn.disabled = true;
        leaveRoomBtn.textContent = "Leaving...";

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
            throw new Error(
                data.message || "Failed to leave room"
            );
        }

        console.log("Left room:", data);

        // Go back to join page
        window.location.href = "/join_room";

    } catch (error) {
        console.error("Leave room error:", error);

        alert(error.message || "Failed to leave room");

        leaveRoomBtn.disabled = false;
        leaveRoomBtn.textContent = "Leave Room";
    }
});





// ===============================
// COPY ROOM CODE
// ===============================

async function copyRoomCode() {
    try {
        await navigator.clipboard.writeText(roomCode);

        // Change button text temporarily
        if (copyCodeBtn) {
            const originalText = copyCodeBtn.textContent;

            copyCodeBtn.textContent = "Copied!";

            setTimeout(() => {
                copyCodeBtn.textContent = originalText;
            }, 1500);
        }

        console.log("Room code copied:", roomCode);

    } catch (error) {
        console.error("Copy failed:", error);

        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = roomCode;

        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand("copy");
            console.log("Room code copied using fallback");
        } catch (fallbackError) {
            alert("Could not copy room code.");
        }

        document.body.removeChild(textArea);
    }
}


// ===============================
// SHARE ROOM LINK
// ===============================

// async function shareRoomLink() {
//     const shareUrl = window.location.href;

//     try {

//         // Modern mobile/browser sharing
//         if (navigator.share) {

//             await navigator.share({
//                 title: "Join my BidHouse Auction",
//                 text: `Join my auction room using code: ${roomCode}`,
//                 url: shareUrl
//             });

//             console.log("Room shared");

//         } else {

//             // Browser doesn't support native share
//             await navigator.clipboard.writeText(shareUrl);

//             alert("Room link copied!");

//         }

//     } catch (error) {

//         // User pressing Cancel on native share
//         if (error.name === "AbortError") {
//             console.log("Share cancelled");
//             return;
//         }

//         console.error("Share failed:", error);

//         // Final fallback
//         try {
//             await navigator.clipboard.writeText(shareUrl);
//             alert("Room link copied!");
//         } catch (copyError) {
//             alert("Could not share or copy the room link.");
//         }
//     }
// }


async function shareRoomLink(roomCode) {
    const shareUrl = window.location.href;
    const shareData = {
        title: "Join my BidHouse Auction",
        text: `Join my auction room using code: ${roomCode}`,
        url: shareUrl
    };

    // 1. Native share — must fire directly inside the user gesture
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return; // shared successfully (AbortError handled below)
        } catch (err) {
            if (err.name === "AbortError") return; // user cancelled, do nothing
            console.warn("navigator.share failed, falling back:", err);
        }
    }

    // 2. Clipboard API (HTTPS + permission required)
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(`${shareData.text}\n${shareUrl}`);
            showToast("Room link copied!");
            return;
        }
    } catch (e) {
        console.warn("clipboard.writeText failed:", e);
    }

    // 3. Legacy copy — works on old Android/iOS, even some non-secure contexts
    try {
        const ta = document.createElement("textarea");
        ta.value = `${shareData.text}\n${shareUrl}`;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length); // iOS needs this
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) {
            showToast("Room link copied!");
            return;
        }
    } catch (e) {
        console.warn("execCommand copy failed:", e);
    }

    // 4. Last resort: show the link so the user can copy manually
    showToast(`Copy this link: ${shareUrl}`);
}

function showToast(msg) {
    // replace alert() — alerts are blocked/dismissed weirdly in some WebViews
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
        "background:#222;color:#fff;padding:12px 20px;border-radius:8px;" +
        "z-index:9999;font-size:14px;max-width:90vw;word-break:break-all;";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}



// ===============================
// BUTTON EVENTS
// ===============================

copyCodeBtn?.addEventListener("click", copyRoomCode);

copyCodeIcon?.addEventListener("click", copyRoomCode);

shareLinkBtn?.addEventListener("click", shareRoomLink);




fetchRoom();
// Refresh lobby automatically every 2 seconds
setInterval(() => {
    fetchRoom();
}, 2000);