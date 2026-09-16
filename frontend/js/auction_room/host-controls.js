forceSkipBtn?.addEventListener("click", () => {
    if (!isHost) {
        return;
    }

    socket.emit("auction:forceSkip", { roomId, userId });
});

pauseBtn?.addEventListener("click", () => {
    if (!isHost) {
        return;
    }

    //need to implement
    console.log("Pause requested");
});
