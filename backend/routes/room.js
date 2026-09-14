const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createRoom,getRoom,joinRoom ,leaveRoom} = require("../controllers/roomController");

const router = express.Router();

router.post("/createroom",authMiddleware,createRoom);
router.post("/join",authMiddleware,joinRoom);
router.get("/:code",authMiddleware,getRoom)
router.delete("/:code/leave", authMiddleware, leaveRoom);

module.exports = router;