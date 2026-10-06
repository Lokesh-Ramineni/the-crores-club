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

        const avatar = document.createElement("span");
        avatar.className = "purchase-row__avatar";
        avatar.textContent = getInitials(player?.name);

        const info = document.createElement("span");
        info.className = "purchase-row__info";

        const nameEl = document.createElement("span");
        nameEl.className = "purchase-row__name";
        nameEl.textContent = player?.name || "Unknown player";

        const roleEl = document.createElement("span");
        roleEl.className = "purchase-row__role";
        roleEl.textContent = player?.role || "";

        info.appendChild(nameEl);
        info.appendChild(roleEl);

        const priceEl = document.createElement("span");
        priceEl.className = "purchase-row__price";
        priceEl.textContent =
            price !== undefined && price !== null ? formatCrore(price) : "—";

        li.appendChild(avatar);
        li.appendChild(info);
        li.appendChild(priceEl);

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