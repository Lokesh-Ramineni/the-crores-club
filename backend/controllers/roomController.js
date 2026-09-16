const generateRoomCode = require("../utils/generateRoomCode");
const Room = require("../models/room");
// const Player = require("../models/player");

async function createRoom(req, res) {
    try {
        const uniqueCode = generateRoomCode();

        const userId = req.user.userId;

        const newRoom = new Room({
            code: uniqueCode,

            type: req.body.type,

            hostId: userId,

            settings: req.body.settings,

            participants: [
                {
                    userId: userId,
                    purseRemaining: req.body.settings.startingPurse,
                    squad: []
                }
            ]
        });

        const savedRoom = await newRoom.save();

        console.log("Room created:", savedRoom.code);

        res.status(201).json({
            roomId: savedRoom._id,
            code: savedRoom.code
        });

    } catch (error) {
        console.error("CREATE ROOM ERROR:", error);

        res.status(500).json({
            message: error.message || "Failed to create room"
        });
    }
}

async function getRoomById(req, res) {
    try {
        const room = await Room.findById(req.params.id)
        .populate("hostId", "username")
        .populate("participants.userId", "username")
        .populate("participants.squad.player");

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json({
            room
        });

    } catch (error) {
        console.error("GET ROOM BY ID ERROR:", error);

        res.status(500).json({
            message: error.message || "Failed to get room"
        });
    }
}

async function getRoom(req, res) {
    try {
        const roomCode = req.params.code.toUpperCase();

        const room = await Room.findOne({
            code: roomCode
        })
        .populate("hostId", "username")
        .populate("participants.userId", "username");

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json({
            room
        });

    } catch (error) {
        console.error("GET ROOM ERROR:", error);

        res.status(500).json({
            message: error.message || "Failed to get room"
        });
    }
}


async function joinRoom(req, res) {
    try {
        const roomCode = req.body.code?.trim().toUpperCase();

        if (!roomCode) {
            return res.status(400).json({
                message: "Room code is required"
            });
        }

        const userId = req.user.userId;

        const room = await Room.findOne({
            code: roomCode
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        // Don't allow joining an already started/completed auction
        if (room.status !== "waiting") {
            return res.status(400).json({
                message: "Auction has already started"
            });
        }

        // Check if user is already in the room
        const alreadyJoined = room.participants.some(
            participant =>
                String(participant.userId) === String(userId)
        );

        if (alreadyJoined) {
            return res.status(200).json({
                message: "Already in room",
                code: room.code
            });
        }

        // Check room capacity
        if (room.participants.length >= room.settings.maxPlayers) {
            return res.status(400).json({
                message: "Room is full"
            });
        }

        // Add player
        room.participants.push({
            userId: userId,
            purseRemaining: room.settings.startingPurse,
            squad: []
        });

        await room.save();

        console.log(
            `User ${userId} joined room ${room.code}`
        );

        const io = req.app.get("io");

        const updatedRoom = await Room.findOne({
            code: room.code
        })
            .populate("hostId", "username")
            .populate("participants.userId", "username");

        io.to(String(room._id)).emit(
            "room:updated",
            updatedRoom
        );  
        
        res.status(200).json({
            message: "Joined room successfully",
            code: room.code
        });

    } catch (error) {
        console.error("JOIN ROOM ERROR:", error);

        res.status(500).json({
            message: error.message || "Failed to join room"
        });
    }
}

// LEAVE ROOM
async function leaveRoom(req, res) {
    try {
        const roomCode = req.params.code.trim().toUpperCase();
        const userId = req.user.userId;

        const room = await Room.findOne({
            code: roomCode
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        if (room.status !== "waiting") {
            return res.status(400).json({
                message: "You cannot leave after the auction has started"
            });
        }

        const participantIndex = room.participants.findIndex(
            participant =>
                String(participant.userId) === String(userId)
        );

        if (participantIndex === -1) {
            return res.status(400).json({
                message: "You are not in this room"
            });
        }

        const leavingUserIsHost =
            String(room.hostId) === String(userId);

        // Remove player from participants
        room.participants.splice(participantIndex, 1);

        // Nobody left -> delete room
        if (room.participants.length === 0) {
            await Room.deleteOne({ _id: room._id });

            return res.status(200).json({
                message: "Left room and room was deleted"
            });
        }

        // If host leaves, assign a new host
        if (leavingUserIsHost) {
            room.hostId = room.participants[0].userId;
        }

        await room.save();

        console.log(
            `User ${userId} left room ${room.code}`
        );

        const io = req.app.get("io");

        const updatedRoom = await Room.findOne({
            code: room.code
        })
            .populate("hostId", "username")
            .populate("participants.userId", "username");

        io.to(String(room._id)).emit(
            "room:updated",
            updatedRoom
        );

        res.status(200).json({
            message: "Left room successfully",
            code: room.code
        });

    } catch (error) {
        console.error("LEAVE ROOM ERROR:", error);

        res.status(500).json({
            message: error.message || "Failed to leave room"
        });
    }
}

module.exports = {
    createRoom,
    getRoom,
    getRoomById,
    joinRoom,
    leaveRoom
};