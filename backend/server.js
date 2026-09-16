const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");
const roomRoutes=require("./routes/room")
const { registerAuctionSocket,liveAuctionState } = require("./sockets/auctionSocket");

const app = express();  

app.use(cors({
    origin:[ "http://localhost:50555",
    "http://10.151.73.123:50555"]
}));

app.use(express.json());

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/rooms",roomRoutes)

// http server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:50555",
            "http://10.151.73.123:50555"
        ],
        methods: ["GET", "POST"]
    }
});

app.set("io", io);
registerAuctionSocket(io);

io.on("connection", (socket) => {

    // console.log("🟢 User connected:", socket.id);


    socket.on("joinRoom", ({ roomId }) => {

        socket.join(roomId);

        // console.log(
        //     `🏠 ${socket.id} joined room ${roomId}`
        // );

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


    socket.on("disconnect", () => {

        // console.log(
        //     "🔴 User disconnected:",
        //     socket.id
        // );

    });

});


server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});