const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");
const roomRoutes=require("./routes/room")
const { registerAuctionSocket,liveAuctionState } = require("./sockets/auctionSocket");

const PORT = process.env.PORT || 3000;

const app = express();  

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.use(express.json());

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/rooms",roomRoutes)

// http server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

app.set("io", io);
registerAuctionSocket(io);

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ roomId }) => {

        socket.join(roomId);

        const auction = liveAuctionState[roomId];

        if (auction && auction.currentAuction) {

            const player = auction.playerPool[auction.poolIndex];

            if (player) {

                socket.emit("auction:currentPlayer", {

                    player,

                    currentBid: auction.currentAuction.currentBid,

                    currentBidder: auction.currentAuction.currentBidder,

                    timerEndsAt: auction.currentAuction.timerEndsAt,

                    round: auction.poolIndex + 1,

                    totalPlayers: auction.playerPool.length,

                    serverTime: Date.now()
                });
            }
        }

    });

});


server.listen(PORT, "0.0.0.0", () => {
console.log("Server running on port 3000");
});