export const initialScores = {
    criticalThinking: 0,
    emotionalIntelligence: 0,
    decisionMaking: 0,
    integrity: 0,
    aiCollaborationBalance: 100, // Starts at 100, decreases on unfocus
};

// Calculate final category tier based on scores
export const getFinalRating = (scores) => {
    const averageCoreSkill =
        (scores.criticalThinking +
            scores.emotionalIntelligence +
            scores.decisionMaking +
            scores.integrity) / 4;

    const penaltyForAI = (100 - scores.aiCollaborationBalance) * 0.5;
    const finalScore = averageCoreSkill - penaltyForAI;

    if (finalScore >= 80) return "Future Leader";
    if (finalScore >= 50) return "Industry Ready";
    return "Emerging Talent";
};

// Helper for merging a stage's score impact into the total
export const updateScores = (currentScores, scoreImpact) => {
    const newScores = { ...currentScores };
    Object.keys(scoreImpact).forEach((key) => {
        if (newScores[key] !== undefined) {
            newScores[key] = Math.min(100, Math.max(0, newScores[key] + scoreImpact[key]));
        }
    });
    return newScores;
};
