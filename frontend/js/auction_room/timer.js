// Countdown timer for the current player being auctioned.

function startTimer(endTime, serverTime) {
    timerEndsAt = endTime;

    if (serverTime) {
        clockOffset = serverTime - Date.now();
    }

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    updateTimer();

    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    if (!timerEndsAt) {
        timerValue.textContent = "00:00";
        return;
    }

    const correctedNow = Date.now() + clockOffset;
    const remaining = Math.max(0, new Date(timerEndsAt).getTime() - correctedNow);
    const seconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timerValue.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(remainingSeconds).padStart(2, "0")}`;

    if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerValue.textContent = "00:00";
    }
}
