const db = require('./backend/config/db');
require('dotenv').config({ path: './backend/.env' });

async function seedAnalytics() {
    try {
        console.log("Seeding sample HR analytics data...");

        // 1. Get a candidate
        const candidates = await db.query("SELECT id FROM users WHERE role = 'candidate' LIMIT 5");
        if (candidates.rows.length === 0) {
            console.log("No candidates found to seed data for.");
            return;
        }

        // 2. Get some challenges
        const challenges = await db.query("SELECT id FROM challenges LIMIT 5");
        if (challenges.rows.length === 0) {
            console.log("No challenges found to seed data for.");
            return;
        }

        for (const candidate of candidates.rows) {
            for (const challenge of challenges.rows) {
                // Insert skill_scores
                await db.query(`
                    INSERT INTO skill_scores (user_id, challenge_id, coding_score, debugging_score, decision_score, communication_score, integrity_score, overall_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                `, [
                    candidate.id,
                    challenge.id,
                    Math.floor(Math.random() * 50) + 50,
                    Math.floor(Math.random() * 50) + 50,
                    Math.floor(Math.random() * 50) + 50,
                    Math.floor(Math.random() * 50) + 50,
                    Math.floor(Math.random() * 30) + 70, // 70-100 integrity
                    Math.floor(Math.random() * 40) + 60
                ]);

                // Insert a submission for recent activity
                await db.query(`
                    INSERT INTO submissions (user_id, challenge_id, submitted_at, score)
                    VALUES ($1, $2, NOW() - (random() * interval '7 days'), $3)
                    ON CONFLICT DO NOTHING
                `, [candidate.id, challenge.id, Math.floor(Math.random() * 100)]);
            }
        }

        console.log("Seeding complete. Global analytics should now have data.");
    } catch (err) {
        console.error("Error seeding data:", err);
    } finally {
        process.exit();
    }
}

seedAnalytics();
