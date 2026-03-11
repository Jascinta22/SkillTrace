const db = require('./config/db');
require('dotenv').config();

async function seed() {
    try {
        const users = await db.query("SELECT id FROM users WHERE role = 'candidate' LIMIT 5");
        const challenges = await db.query("SELECT id FROM challenges LIMIT 5");

        if (users.rows.length === 0 || challenges.rows.length === 0) {
            console.log("Not enough data to seed analytics.");
            return;
        }

        for (const u of users.rows) {
            for (const c of challenges.rows) {
                await db.query(`
                    INSERT INTO skill_scores (user_id, challenge_id, coding_score, debugging_score, decision_score, communication_score, integrity_score, overall_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                `, [u.id, c.id, 75, 82, 65, 90, 88, 80]);

                await db.query(`
                    INSERT INTO submissions (user_id, challenge_id, score, submitted_at)
                    VALUES ($1, $2, 85, NOW() - interval '2 days')
                    ON CONFLICT DO NOTHING
                `, [u.id, c.id, 85]);
            }
        }
        console.log("Seeding successful.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
seed();
