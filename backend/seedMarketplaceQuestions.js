const { Client } = require('pg');
require('dotenv').config();

const seedMarketplaceQuestions = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected. Identifying marketplace challenges...');

        // Get the specific marketplace challenges (excluding the generic skill challenges)
        const challengesRes = await client.query("SELECT id, title, type FROM challenges WHERE title NOT IN ('Python', 'Data Structures', 'Web Development', 'Machine Learning', 'Communication Skills', 'Decision Making')");

        console.log(`Found ${challengesRes.rows.length} marketplace challenges.`);

        let insertedCount = 0;

        for (const challenge of challengesRes.rows) {
            // Only seed coding/debugging type challenges
            if (challenge.type === 'coding' || challenge.type === 'debugging') {
                const titleLower = challenge.title.toLowerCase();

                let questions = [];

                if (titleLower.includes('amazon') || titleLower.includes('pathfinding')) {
                    questions = [
                        { text: 'Write a greedy algorithm to find the optimal route through the warehouse.', snippet: 'function optimizeWarehouseRoute(grid) {\n// Your code here\n}', ans: 'A*' },
                        { text: 'Calculate the time complexity of your pathfinding solution.', snippet: '// Determine Time Complexity', ans: 'O(V+E)' }
                    ];
                } else if (titleLower.includes('meta') || titleLower.includes('recursive')) {
                    questions = [
                        { text: 'Implement the recursive friend-of-friend traversal.', snippet: 'function recommendFriends(userGraph, userId, depth) {\n// Your code here\n}', ans: 'DFS' },
                        { text: 'Handle cycle detection in the friend graph.', snippet: '// Add cycle detection logic', ans: 'Set' }
                    ];
                } else if (titleLower.includes('google') || titleLower.includes('sparse vector')) {
                    questions = [
                        { text: 'Implement an O(L1 + L2) dot product calculation for two sparse vectors represented as arrays of [index, value] pairs.', snippet: 'function sparseVectorDotProduct(vec1, vec2) {\n// Your code here\n}', ans: 'Two Pointers' }
                    ];
                } else if (titleLower.includes('microsoft') || titleLower.includes('thread-safe')) {
                    questions = [
                        { text: 'Implement a thread-safe Singleton pattern using closures.', snippet: 'const Singleton = (function() {\n// Your code here\n})();', ans: 'Closure' }
                    ];
                } else if (titleLower.includes('netflix') || titleLower.includes('cdn')) {
                    questions = [
                        { text: 'Design an LRU Cache to simulate the CDN edge node chunk eviction policy.', snippet: 'class LRUCache {\n  constructor(capacity) {\n    // Initialize cache\n  }\n\n  get(key) {}\n  put(key, value) {}\n}', ans: 'Doubly Linked List' }
                    ];
                } else if (titleLower.includes('uber') || titleLower.includes('geospatial')) {
                    questions = [
                        { text: 'Write a function to calculate the Haversine distance between two sets of GPS coordinates.', snippet: 'function haversineDistance(lat1, lon1, lat2, lon2) {\n// Return distance in km\n}', ans: 'Math' }
                    ];
                } else if (titleLower.includes('apple') || titleLower.includes('memory-efficient')) {
                    questions = [
                        { text: 'Implement a function to compress a string using run-length encoding (e.g., "aabcccccaaa" -> "a2b1c5a3").', snippet: 'function stringCompression(str) {\n// Your code here\n}', ans: 'String Manipulation' }
                    ];
                } else if (titleLower.includes('airbnb') || titleLower.includes('calendar')) {
                    questions = [
                        { text: 'Given an array of booking intervals [start, end], merge all overlapping bookings.', snippet: 'function mergeBookings(intervals) {\n// Your code here\n}', ans: 'Sorting' }
                    ];
                } else if (titleLower.includes('stripe') || titleLower.includes('rate limiting')) {
                    questions = [
                        { text: 'Implement a Token Bucket algorithm for API rate limiting.', snippet: 'class TokenBucket {\n  constructor(capacity, fillRate) {}\n  consume(tokens) {}\n}', ans: 'Algorithm' }
                    ];
                } else if (titleLower.includes('nvidia') || titleLower.includes('tensor')) {
                    questions = [
                        { text: 'Write a function to transpose a 2D matrix (representing a tensor shape transformation) in-place if possible, or out-of-place if not square.', snippet: 'function transposeMatrix(matrix) {\n// Your code here\n}', ans: 'Matrix' }
                    ];
                }

                for (const q of questions) {
                    await client.query(`
                        INSERT INTO questions (challenge_id, question_text, code_snippet, expected_answer, points)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [challenge.id, q.text, q.snippet, q.ans, 20]);
                    insertedCount++;
                }
            }
        }

        console.log(`Successfully seeded ${insertedCount} questions into marketplace challenges.`);

    } catch (err) {
        console.error('Error seeding marketplace questions:', err);
    } finally {
        await client.end();
    }
};

seedMarketplaceQuestions();
