function formatCrore(amount) {
    if (amount === null || amount === undefined) {
        return "0 cr";
    }

    const crore = amount / 10000000;

    return `${crore.toFixed(crore % 1 === 0 ? 0 : 2)} cr`;
}

function getInitials(name) {
    if (!name) {
        return "?";
    }

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
