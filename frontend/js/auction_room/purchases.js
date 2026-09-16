function renderMyPurchases() {
    if (!myPurchasesList || !roomData || !roomData.participants) {
        return;
    }

    const participant = roomData.participants.find(
        p => String(p.userId?._id || p.userId) === String(userId)
    );

    const squad = participant?.squad || [];

    if (myPurchasesCount) {
        myPurchasesCount.textContent = squad.length;
    }

    myPurchasesList.innerHTML = "";

    if (squad.length === 0) {
        if (myPurchasesEmpty) {
            myPurchasesEmpty.style.display = "block";
        }
        return;
    }

    if (myPurchasesEmpty) {
        myPurchasesEmpty.style.display = "none";
    }

    squad.forEach(entry => {

        const player = entry?.player;
        const price = entry?.price;

        const li = document.createElement("li");
        li.className = "purchase-row";

        li.innerHTML = `
            <span class="purchase-row__avatar">${getInitials(player?.name)}</span>
            <span class="purchase-row__info">
                <span class="purchase-row__name">${player?.name || "Unknown player"}</span>
                <span class="purchase-row__role">${player?.role || ""}</span>
            </span>
            <span class="purchase-row__price">${price !== undefined && price !== null ? formatCrore(price) : "&mdash;"}</span>
        `;

        myPurchasesList.appendChild(li);
    });
}

myPurchasesToggle?.addEventListener("click", () => {
    myPurchasesOpen = !myPurchasesOpen;

    if (myPurchasesPanel) {
        myPurchasesPanel.hidden = !myPurchasesOpen;
    }

    if (myPurchasesChevron) {
        myPurchasesChevron.textContent = myPurchasesOpen ? "▴" : "▾";
    }
});
