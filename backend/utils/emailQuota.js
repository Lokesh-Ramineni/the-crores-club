const EmailUsage = require("../models/EmailUsage");

const MAX_DAILY_EMAILS = Number(process.env.MAX_DAILY_EMAILS) || 450;

function todayKey() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function reserveEmailSend() {
    const date = todayKey();

    const usage = await EmailUsage.findOneAndUpdate(
        { date, count: { $lt: MAX_DAILY_EMAILS } },
        { $inc: { count: 1 } },
        { new: true }
    );

    if (usage) {
        return true;
    }

    try {
        await EmailUsage.create({ date, count: 1 });
        return true;
    } catch (e) {
        if (e.code === 11000) {

            const retry = await EmailUsage.findOneAndUpdate(
                { date, count: { $lt: MAX_DAILY_EMAILS } },
                { $inc: { count: 1 } },
                { new: true }
            );
            return Boolean(retry);
        }
        throw e;
    }
}

module.exports = { reserveEmailSend, MAX_DAILY_EMAILS };
