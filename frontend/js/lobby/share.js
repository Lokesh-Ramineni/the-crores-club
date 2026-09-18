async function copyRoomCode() {
    try {
        await navigator.clipboard.writeText(roomCode);

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

async function shareRoomLink() {
    const shareUrl = window.location.href;
    const shareData = {
        title: "Join my BidHouse Auction",
        text: `Join my auction room using code: ${roomCode}`,
        url: shareUrl
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            if (err.name === "AbortError") return;
            console.warn("navigator.share failed, falling back:", err);
        }
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(`${shareData.text}\n${shareUrl}`);
            showToast("Room link copied!");
            return;
        }
    } catch (e) {
        console.warn("clipboard.writeText failed:", e);
    }

    try {
        const ta = document.createElement("textarea");
        ta.value = `${shareData.text}\n${shareUrl}`;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) {
            showToast("Room link copied!");
            return;
        }
    } catch (e) {
        console.warn("execCommand copy failed:", e);
    }

    showToast(`Copy this link: ${shareUrl}`);
}

function showToast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
        "background:#222;color:#fff;padding:12px 20px;border-radius:8px;" +
        "z-index:9999;font-size:14px;max-width:90vw;word-break:break-all;";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}
