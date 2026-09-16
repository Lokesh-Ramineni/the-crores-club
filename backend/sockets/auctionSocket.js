const mongoose=require('mongoose')
const Room = require("../models/room");
const playerSchema=require("../models/player")
const Player = mongoose.model("Player", playerSchema);
const liveAuctionState = {};

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function getParticipant(room, userId) {
    return room.participants.find(
        participant =>
            String(participant.userId) === String(userId)
    );
}

function getMinimumBid(currentBid) {
    return currentBid + 500000; 
}
async function finishCurrentPlayer(io, roomId) {
    try {

        const auction = liveAuctionState[roomId];

        if (!auction || !auction.currentAuction) {
            return;
        }

        const currentAuction = auction.currentAuction;

        const room = await Room.findById(roomId);

        if (!room) {
            delete liveAuctionState[roomId];
            return;
        }

        const player = auction.playerPool[
            auction.poolIndex
        ];

        if (!player) {
            delete liveAuctionState[roomId];
            return;
        }

        if (currentAuction.currentBidder) {

            const participant = room.participants.find(
                p =>
                    String(p.userId) ===
                    String(currentAuction.currentBidder)
            );

            if (!participant) {

                console.error(
                    "Winning participant not found"
                );

                return;
            }

            participant.purseRemaining -=
                currentAuction.currentBid;

            participant.squad.push({
                player: currentAuction.playerId,
                price: currentAuction.currentBid
            });

            await room.save();

            const updatedRoom = await Room.findById(roomId)
                .populate("hostId", "username")
                .populate("participants.userId", "username")
                .populate("participants.squad.player");

            io.to(String(roomId)).emit(
                "room:updated",
                updatedRoom
            );

            io.to(String(roomId)).emit(
                "player:sold",
                {
                    player,
                    soldPrice:
                        currentAuction.currentBid,
                    buyerUserId:
                        currentAuction.currentBidder
                }
            );

            // console.log(
            //     `🏆 ${player.name} sold for ₹${currentAuction.currentBid}`
            // );

        }

        else {

            io.to(String(roomId)).emit(
                "player:unsold",
                {
                    player
                }
            );

            // console.log(
            //     `❌ ${player.name} went unsold`
            // );
        }

        auction.poolIndex++;

        const poolFinished =
            auction.poolIndex >=
            auction.playerPool.length;

        const everyoneFull =
            room.participants.every(
                participant =>
                    // participant.squad.length >=
                    // room.settings.maxPlayers
                    participant.squad.length >=20
            );


        if (poolFinished || everyoneFull) {

            room.status = "completed";

            await room.save();

            io.to(String(roomId)).emit(
                "auction:complete",
                {
                    message: "Auction completed"
                }
            );

            delete liveAuctionState[roomId];

            // console.log(
            //     `🏁 Auction completed: ${roomId}`
            // );

            return;
        }

        const nextPlayer =
            auction.playerPool[
                auction.poolIndex
            ];

        const timerSeconds =
            room.settings.timerPerPlayer;

        const timerEndsAt =
            Date.now() +
            timerSeconds * 1000;

        auction.currentAuction = {

            playerId:
                nextPlayer._id,

            currentBid:
                nextPlayer.basePrice,

            currentBidder:
                null,

            timerEndsAt
        };

        auction.passedUserIds = new Set();

        io.to(String(roomId)).emit(
            "auction:passUpdate",
            {
                passedUserIds: []
            }
        );

        io.to(String(roomId)).emit(
            "auction:currentPlayer",
            {
                player: nextPlayer,

                currentBid:
                    nextPlayer.basePrice,

                currentBidder:
                    null,

                timerEndsAt,

                round:
                    auction.poolIndex + 1,

                totalPlayers:
                    auction.playerPool.length,

                serverTime:
                    Date.now()
            }
        );

        auction.timeoutRef = setTimeout(
            () => {
                finishCurrentPlayer(
                    io,
                    roomId
                );
            },
            timerSeconds * 1000
        );

        // console.log(
        //     `➡️ Next player: ${nextPlayer.name}`
        // );

    } catch (error) {

        console.error(
            "FINISH PLAYER ERROR:",
            error
        );
    }
}

function registerAuctionSocket(io) {

    io.on("connection", (socket) => {

        socket.on("auction:start", async ({ roomId ,userId }) => {

            try {

                // console.log("Auction start requested:", roomId);

                if (liveAuctionState[roomId]) {
                    socket.emit("auction:error", {
                        message: "Auction is already running"
                    });
                    return;
                }

                const room = await Room.findById(roomId);

                if (!room) {
                    socket.emit("auction:error", {
                        message: "Room not found"
                    });
                    return;
                }

                if (room.status !== "waiting") {
                    socket.emit("auction:error", {
                        message: "Auction cannot be started"
                    });
                    return;
                }

                if (room.participants.length < 2) {
                    socket.emit("auction:error", {
                        message: "At least 2 players are required"
                    });
                    return;
                }

                if (room.participants.length < 2) {

                    socket.emit("auction:error", {
                        message: "At least 2 players are required"
                    });

                    return;
                }

                if (String(room.hostId) !== String(userId)) {

                    socket.emit("auction:error", {
                        message: "Only the host can start the auction"
                    });

                    return;
                }

                const players = await Player.find({}).lean();

                if (!players.length) {
                    socket.emit("auction:error", {
                        message: "No players found"
                    });
                    return;
                }

                const playerPool = shuffleArray(players);

                liveAuctionState[roomId] = {

                    playerPool,

                    poolIndex: 0,

                    currentAuction: null,

                    timeoutRef: null,

                    passedUserIds: new Set()
                };

                const firstPlayer = playerPool[0];

                const timerSeconds = room.settings.timerPerPlayer;

                const timerEndsAt =
                    Date.now() + (timerSeconds * 1000);

                liveAuctionState[roomId].currentAuction = {

                    playerId: firstPlayer._id,

                    currentBid: firstPlayer.basePrice,

                    currentBidder: null,

                    timerEndsAt
                };

                room.status = "live";

                await room.save();

                socket.join(String(roomId));

                io.to(String(roomId)).emit(
                    "auction:currentPlayer",
                    {
                        player: firstPlayer,

                        currentBid: firstPlayer.basePrice,

                        currentBidder: null,

                        timerEndsAt,

                        round: 1,

                        totalPlayers: playerPool.length,

                        serverTime: Date.now()
                    }
                );

                liveAuctionState[roomId].timeoutRef =setTimeout(
                    () => {
                        finishCurrentPlayer(
                            io,
                            roomId
                        );
                    },
                    timerSeconds * 1000
                );

                // console.log(
                //     `Auction started in room ${roomId}`
                // );

            } catch (error) {

                console.error(
                    "AUCTION START ERROR:",
                    error
                );

                socket.emit("auction:error", {
                    message: "Failed to start auction"
                });
            }

        });
        socket.on("bid:place", async ({ roomId, userId, bidAmount }) => {

            try {

                const auction = liveAuctionState[roomId];

                if (!auction || !auction.currentAuction) {
                    socket.emit("bid:error", {
                        message: "No active auction"
                    });
                    return;
                }

                const currentAuction = auction.currentAuction;

                if (
                    currentAuction.currentBidder &&
                    String(currentAuction.currentBidder) === String(userId)
                ) {
                    socket.emit("bid:error", {
                        message: "You are already the highest bidder"
                    });
                    return;
                }

                bidAmount = Number(bidAmount);

                if (!Number.isFinite(bidAmount)) {
                    socket.emit("bid:error", {
                        message: "Invalid bid amount"
                    });
                    return;
                }

                const minimumBid = getMinimumBid(
                    currentAuction.currentBid
                );

                if (bidAmount < minimumBid) {
                    socket.emit("bid:error", {
                        message: `Minimum bid is ₹${minimumBid}`
                    });
                    return;
                }

                const room = await Room.findById(roomId);

                if (!room) {
                    socket.emit("bid:error", {
                        message: "Room not found"
                    });
                    return;
                }

                const participant = getParticipant(
                    room,
                    userId
                );

                if (!participant) {
                    socket.emit("bid:error", {
                        message: "You are not in this room"
                    });
                    return;
                }

                if (bidAmount > participant.purseRemaining) {
                    socket.emit("bid:error", {
                        message: "Insufficient purse"
                    });
                    return;
                }

                if (
                    participant.squad.length >=20
                    // room.settings.maxPlayers
                ) {
                    socket.emit("bid:error", {
                        message: "Your squad is full"
                    });
                    return;
                }

                currentAuction.currentBid = bidAmount;
                currentAuction.currentBidder = userId;

                if (auction.timeoutRef) {
                    clearTimeout(auction.timeoutRef);
                }

                const timerSeconds =
                    room.settings.timerPerPlayer;

                currentAuction.timerEndsAt =
                    Date.now() + timerSeconds * 1000;

                io.to(String(roomId)).emit(
                    "auction:update",
                    {
                        currentBid: currentAuction.currentBid,
                        currentBidder: currentAuction.currentBidder,
                        timerEndsAt: currentAuction.timerEndsAt,
                        serverTime: Date.now()
                    }
                );

                // console.log(
                //     `💰 Bid ₹${bidAmount} by ${userId} in room ${roomId}`
                // );

                auction.timeoutRef = setTimeout(
                    () => {
                        finishCurrentPlayer(
                            io,
                            roomId
                        );
                    },
                    timerSeconds * 1000
                );

            } catch (error) {

                console.error(
                    "BID ERROR:",
                    error
                );

                socket.emit("bid:error", {
                    message: "Failed to place bid"
                });
            }

        });

        socket.on("bid:pass", async ({ roomId, userId }) => {

            try {

                const auction = liveAuctionState[roomId];

                if (!auction || !auction.currentAuction) {
                    socket.emit("bid:error", {
                        message: "No active auction"
                    });
                    return;
                }

                const currentAuction = auction.currentAuction;

                if (
                    currentAuction.currentBidder &&
                    String(currentAuction.currentBidder) === String(userId)
                ) {
                    socket.emit("bid:error", {
                        message: "You are already the highest bidder"
                    });
                    return;
                }

                if (!auction.passedUserIds) {
                    auction.passedUserIds = new Set();
                }

                if (auction.passedUserIds.has(String(userId))) {
                    return;
                }

                auction.passedUserIds.add(String(userId));

                io.to(String(roomId)).emit(
                    "auction:passUpdate",
                    {
                        passedUserIds: Array.from(auction.passedUserIds)
                    }
                );

                // console.log(
                //     `🙅 ${userId} passed in room ${roomId}`
                // );

                const room = await Room.findById(roomId);

                if (room) {

                    const eligibleParticipants = room.participants.filter(
                        p =>
                            // p.squad.length < room.settings.maxPlayers &&
                            p.squad.length < 20 &&

                            String(p.userId) !== String(currentAuction.currentBidder)
                    );

                    const everyoneEligiblePassed =
                        eligibleParticipants.length > 0 &&
                        eligibleParticipants.every(
                            p => auction.passedUserIds.has(String(p.userId))
                        );

                    if (everyoneEligiblePassed) {

                        if (auction.timeoutRef) {
                            clearTimeout(auction.timeoutRef);
                        }

                        finishCurrentPlayer(io, roomId);
                    }
                }

            } catch (error) {

                console.error(
                    "BID PASS ERROR:",
                    error
                );

                socket.emit("bid:error", {
                    message: "Failed to pass"
                });
            }

        });

        socket.on("auction:forceSkip", async ({ roomId, userId }) => {

            try {

                const auction = liveAuctionState[roomId];

                if (!auction || !auction.currentAuction) {
                    socket.emit("auction:error", {
                        message: "No active auction"
                    });
                    return;
                }

                const room = await Room.findById(roomId);

                if (!room) {
                    socket.emit("auction:error", {
                        message: "Room not found"
                    });
                    return;
                }

                if (String(room.hostId) !== String(userId)) {
                    socket.emit("auction:error", {
                        message: "Only the host can force skip"
                    });
                    return;
                }

                if (auction.timeoutRef) {
                    clearTimeout(auction.timeoutRef);
                }

                // console.log(
                //     `⏭️ Host force-skipped current player in room ${roomId}`
                // );

                finishCurrentPlayer(io, roomId);

            } catch (error) {

                console.error(
                    "FORCE SKIP ERROR:",
                    error
                );

                socket.emit("auction:error", {
                    message: "Failed to skip"
                });
            }

        });
    });

}

module.exports = {
    registerAuctionSocket,
    liveAuctionState
};