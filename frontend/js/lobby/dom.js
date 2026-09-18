const API_BASE_URL = "https://the-crores-club.onrender.com";

const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("code");
let roomId = null;

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

if (!roomCode) {
    alert("No room code found.");
    window.location.href = "home.html";
}

const roomCodeElement = document.getElementById("roomCode");
const lobbySummary = document.getElementById("lobbySummary");
const playerList = document.getElementById("playerList");
const playerCount = document.getElementById("playerCount");
const playerMax = document.getElementById("playerMax");
const startAuctionBtn = document.getElementById("startAuctionBtn");
const startHint = document.querySelector(".start-hint");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const copyCodeIcon = document.getElementById("copyCodeIcon");
const shareLinkBtn = document.getElementById("shareLinkBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
