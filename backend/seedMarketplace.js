const { Client } = require('pg');
require('dotenv').config();

const marketplaceChallenges = [
    {
        company: "Google",
        type: "coding",
        title: "Sparse Vector Multiplication",
        description: "Implement an efficient algorithm for multiplying two high-dimensional sparse vectors. The vectors are represented as lists of (index, value) pairs. Optimize for both time and space complexity using a hash-map or two-pointer approach.",
        difficulty: "Hard",
        skills: ["Coding", "Data Structures", "Optimization"],
        questions: [
            { text: "What is the most efficient data structure to represent a sparse vector with only 1% non-zero elements?", answer: "Hash Map (Dictionary) or Sorted List of pairs", points: 20 },
            { text: "Write a function `multiply(v1, v2)` that returns the dot product of two sparse vectors.", answer: "Iterate through one map and check existence in the other, or use two pointers if sorted.", points: 30 }
        ]
    },
    {
        company: "Meta",
        type: "debugging",
        title: "Recursive friend recommendation engine",
        description: "A background job for recommending friends is hanging. Debug a non-terminating recursion in the graph traversal logic. The engine should find 'Friends of Friends' within a 3-degree radius without getting stuck in mutual-friend cycles.",
        difficulty: "Hard",
        skills: ["Debugging", "Graph Algorithms", "Decision Making"],
        questions: [
            { text: "What is the primary way to prevent an infinite loop in a recursive graph traversal?", answer: "Use a 'visited' set to track processed nodes.", points: 25 }
        ]
    },
    {
        company: "Amazon",
        type: "coding",
        title: "Warehouse Pathfinding Optimization",
        description: "Given a grid-based warehouse layout, find the shortest path for a robot to collect items while avoiding seasonal obstacles. Implement a modified A* or Dijkstra's algorithm to account for dynamic weight changes on specific 'busy' aisles.",
        difficulty: "Medium",
        skills: ["Coding", "Algorithms", "Pathfinding"],
        questions: [
            { text: "Which heuristic is generally best for grid-based pathfinding (Manhattan or Euclidean)?", answer: "Manhattan (since diagonal moves are usually restricted in warehouses)", points: 20 }
        ]
    },
    {
        company: "Microsoft",
        type: "debugging",
        title: "Collab-Doc Sync Race Condition",
        description: "Debug a race condition in an Operational Transformation (OT) algorithm that causes text desynchronization between users in a real-time editor. Identify why concurrent local and remote deletions are causing index offsets.",
        difficulty: "Hard",
        skills: ["Debugging", "Concurrent Programming", "Web Development"],
        questions: [
            { text: "What does 'Operational Transformation' solve in collaborative editing?", answer: "Consistency of document state across distributed clients without locking.", points: 30 }
        ]
    },
    {
        company: "Netflix",
        type: "coding",
        title: "Adaptive Bitrate Controller",
        description: "Optimize the predictive algorithm that chooses the next video chunk quality. Your logic must balance buffer stability (preventing stalls) with playback quality (maximizing bitrate) based on a 10-second rolling window of bandwidth samples.",
        difficulty: "Medium",
        skills: ["Coding", "System Design", "Networking"],
        questions: [
            { text: "Why would you choose a slightly lower bitrate even if current bandwidth is high?", answer: "To build a buffer safety margin against future bitrate drops.", points: 20 }
        ]
    },
    {
        company: "Apple",
        type: "coding",
        title: "On-Device Privacy Masking",
        description: "Implement a basic differential privacy algorithm to mask individual user telemetry. Add calibrated Laplacian noise to numeric metrics so that the aggregate data remains accurate while protecting individual user identity.",
        difficulty: "Hard",
        skills: ["Coding", "Security", "Mathematics"],
        questions: [
            { text: "What is the 'Privacy Budget' (Epsilon) in Differential Privacy?", answer: "A measure of how much privacy is leaked; lower epsilon means more noise/better privacy.", points: 30 }
        ]
    },
    {
        company: "Uber",
        type: "communication",
        title: "Dynamic Surge Pricing Strategy",
        description: "Analyze supply/demand metrics and respond to a product manager's proposal for a new surge multiplier. Balance driver availability (earnings) and user friction (price sensitivty) in a professionally written technical strategy.",
        difficulty: "Medium",
        skills: ["Communication", "Decision Making", "Analytics"],
        questions: [
            { text: "How do you explain a price increase to a frustrated user while maintaining brand trust?", answer: "Focus on service reliability and ensuring a driver is available when needed.", points: 20 }
        ]
    },
    {
        company: "Airbnb",
        type: "coding",
        title: "Search Ranking for Vacation Rentals",
        description: "Implement a weighted ranking algorithm that prioritizes listings based on price, rating, and geographic proximity. Ensure that new listings (those with 0 ratings) are given a small 'boost' to solve the cold-start problem.",
        difficulty: "Medium",
        skills: ["Coding", "Algorithms", "Ranking"],
        questions: [
            { text: "How do you handle the 'cold start' problem in ranking systems?", answer: "Give items a temporary boost or use features from similar items.", points: 20 }
        ]
    },
    {
        company: "Stripe",
        type: "coding",
        title: "Idempotent API Request Handling",
        description: "Ensure a payment request is never processed twice. Implement a distributed locking mechanism using idempotency keys. Your solution must handle cases where the network fails *after* successful processing but *before* the response is sent.",
        difficulty: "Hard",
        skills: ["Coding", "Distributed Systems", "Payments"],
        questions: [
            { text: "Where should the idempotency key check occur in the request lifecycle?", answer: "At the beginning, before any side effects or database writes.", points: 30 }
        ]
    },
    {
        company: "NVIDIA",
        type: "debugging",
        title: "GPU Memory Bank Conflict",
        description: "Identify and fix a bank conflict in a CUDA kernel that is causing 40% performance degradation in matrix multiplication. Analyze the memory access pattern and propose a padding strategy to align requests.",
        difficulty: "Hard",
        skills: ["Debugging", "Performance", "C++"],
        questions: [
            { text: "What is a 'Bank Conflict' in shared memory?", answer: "When multiple threads in a warp access different addresses within the same memory bank simultaneously.", points: 30 }
        ]
    }
];

const seedMarketplace = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to DB for seeding Marketplace...');

        // Migrate schema
        await client.query('ALTER TABLE challenges ADD COLUMN IF NOT EXISTS skills TEXT[];');

        // Clear existing challenges and questions (Clearing dummy data)
        await client.query('DELETE FROM questions');
        await client.query('DELETE FROM challenges');

        // Ensure the HR users (Companies) exist
        const companyUserIds = {};
        for (const challenge of marketplaceChallenges) {
            const email = `${challenge.company.toLowerCase()}@hr.com`;
            const name = `${challenge.company} HR`;

            // Upsert HR user
            const userRes = await client.query(
                `INSERT INTO users (name, email, password_hash, role)
                 VALUES ($1, $2, 'company_pass_123', 'hr')
                 ON CONFLICT (email) DO UPDATE SET name = $1
                 RETURNING id`,
                [name, email]
            );
            companyUserIds[challenge.company] = userRes.rows[0].id;
        }

        for (const c of marketplaceChallenges) {
            // Insert Challenge with skills
            const challengeRes = await client.query(
                `INSERT INTO challenges (title, description, type, difficulty, skills, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [c.title, c.description, c.type, c.difficulty, c.skills, companyUserIds[c.company]]
            );
            const challengeId = challengeRes.rows[0].id;

            for (const q of c.questions) {
                await client.query(
                    'INSERT INTO questions (challenge_id, question_text, expected_answer, points) VALUES ($1, $2, $3, $4)',
                    [challengeId, q.text, q.answer, q.points]
                );
            }
        }

        console.log('✅ Successfully seeded 10 top-company challenges!');
    } catch (err) {
        console.error('Error seeding marketplace:', err);
    } finally {
        await client.end();
    }
};

seedMarketplace();
