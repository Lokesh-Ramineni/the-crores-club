const playersGrid = document.getElementById("playersGrid");

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);
}

function createPlayerCard(player) {

    const card = document.createElement("article");

    card.className = "player-card";

    card.innerHTML = `
        <h2 class="player-card__name">
            ${player.name}
        </h2>

        <span class="player-card__role">
            ${player.role}
        </span>

        <div class="player-card__details">

            <div>
                <span class="player-card__detail-label">
                    Base Price
                </span>

                <span class="player-card__detail-value player-card__price">
                    ${formatPrice(player.basePrice)}
                </span>
            </div>

            <div>
                <span class="player-card__detail-label">
                    Country
                </span>

                <span class="player-card__detail-value">
                    ${player.country}
                </span>
            </div>

        </div>
    `;

    return card;
}

async function loadPlayers() {

    try {

        const response = await fetch("./data/players-list.json");

        if (!response.ok) {
            throw new Error("Failed to load players");
        }

        const players = await response.json();

        playersGrid.innerHTML = "";

        players.forEach(player => {

            const card = createPlayerCard(player);

            playersGrid.appendChild(card);

        });

    } catch (error) {

        console.error("Error loading players:", error);

        playersGrid.innerHTML = `
            <p style="
                grid-column: 1 / -1;
                text-align: center;
                color: var(--ink-500);
            ">
                Unable to load players.
            </p>
        `;
    }
}

loadPlayers();