// Calculate individual skill scores based on the challenge type and telemetry
// These are simple mock algorithms for the purpose of the platform

const calculateIntegrityScore = (telemetry) => {
    let score = 100;

    // Penalize for copy pasting and tab switching
    score -= (telemetry.tab_switch_count * 10);
    score -= (telemetry.copy_paste_count * 15);
    score -= (telemetry.focus_loss_count * 5);

    // Auto flag if AI usage explicitly detected (if implementable)
    if (telemetry.ai_usage_flag) {
        score = 0;
    }

    return Math.max(0, score);
};

const calculateOverallScore = (skillScores) => {
    const { coding_score, debugging_score, decision_score, communication_score, integrity_score } = skillScores;

    // Average the hard/soft skills, factoring in integrity as a heavy multiplier
    const rawAverage = (coding_score + debugging_score + decision_score + communication_score) / 4;

    // Integrity reduces the overall validity of the score if low
    const integrityMultiplier = integrity_score / 100;

    return Math.round(rawAverage * integrityMultiplier);
};

// Simulate Big-O Code Quality Analysis
const calculateCodeQualityScore = (code) => {
    // In a production app, this would use AST parsing or an external evaluation engine.
    // Here we simulate it based on code length or random heuristics.
    const complexities = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'];

    // Randomize for simulation
    const timeComplexity = complexities[Math.floor(Math.random() * complexities.length)];
    const spaceComplexity = complexities[Math.floor(Math.random() * 3)]; // Bias towards better space complexity O(1) to O(n)

    let qualityScore = 100;
    if (timeComplexity === 'O(n^2)') qualityScore -= 30;
    if (timeComplexity === 'O(n log n)') qualityScore -= 10;
    if (spaceComplexity === 'O(n)') qualityScore -= 10;

    return {
        timeComplexity,
        spaceComplexity,
        qualityScore: Math.max(0, qualityScore)
    };
};

module.exports = { calculateIntegrityScore, calculateOverallScore, calculateCodeQualityScore };
