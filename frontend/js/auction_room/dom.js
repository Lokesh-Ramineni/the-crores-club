const API_BASE_URL = "http://10.151.73.123:3000";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

function getUserFromToken() {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload;
    } catch (error) {
        console.error("Invalid token");
        return null;
    }
}

const currentUser = getUserFromToken();
const userId = currentUser?.userId;
const username = currentUser?.username;

const params = new URLSearchParams(window.location.search);
const roomId = params.get("roomId");

if (!roomId) {
    console.error("Room ID missing");
    alert("Room ID is missing");
    window.location.href = "/home";
}

const roundCurrent = document.getElementById("roundCurrent");
const roundTotal = document.getElementById("roundTotal");
const playerAvatar = document.getElementById("playerAvatar");
const playerName = document.getElementById("playerName");
const playerTag = document.getElementById("playerTag");
const playerRole = document.getElementById("playerRole");
const playerBase = document.getElementById("playerBase");
const timerValue = document.getElementById("timerValue");
const currentBid = document.getElementById("currentBid");
const currentBidder = document.getElementById("currentBidder");
const outbidAlert = document.getElementById("outbidAlert");
const yourPurse = document.getElementById("yourPurse");
const squadCount = document.getElementById("squadCount");
const playersLeft = document.getElementById("playersLeft");
const otherPlayersList = document.getElementById("otherPlayersList");
const passBtn = document.getElementById("passBtn");
const hostControls = document.getElementById("hostControls");
const forceSkipBtn = document.getElementById("forceSkipBtn");
const pauseBtn = document.getElementById("pauseBtn");
const bidButtons = document.querySelectorAll(".bid-btn[data-increment]");
const myPurchasesToggle = document.getElementById("myPurchasesToggle");
const myPurchasesPanel = document.getElementById("myPurchasesPanel");
const myPurchasesCount = document.getElementById("myPurchasesCount");
const myPurchasesChevron = document.getElementById("myPurchasesChevron");
const myPurchasesList = document.getElementById("myPurchasesList");
const myPurchasesEmpty = document.getElementById("myPurchasesEmpty");


let currentPlayer = null;
let currentBidAmount = 0;
let currentBidderId = null;
let timerEndsAt = null;
let timerInterval = null;
let roomData = null;
let isHost = false;
let hasPassed = false;

let passedUserIds = [];

let clockOffset = 0;

let wasHighestBidder = false;

let myPurchasesOpen = false;
