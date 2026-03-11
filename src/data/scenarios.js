export const scenarios = [
    {
        id: "stage-1",
        title: "Stage 1: Ambiguous Brief",
        description: "You receive a vague product request from your manager: 'Make the dashboard better by next week.'",
        question: "How do you respond?",
        options: [
            {
                text: "Generate a redesign using AI and submit it immediately.",
                impact: { criticalThinking: 20, decisionMaking: 20 } // Low critical thinking
            },
            {
                text: "Begin working based on your assumptions to save time.",
                impact: { criticalThinking: 40, decisionMaking: 30 }
            },
            {
                text: "Schedule a 10-minute sync to clarify the specific pain points and target metrics before starting.",
                impact: { criticalThinking: 100, decisionMaking: 90 } // High critical thinking
            }
        ]
    },
    {
        id: "stage-2",
        title: "Stage 2: Team Conflict",
        description: "During a code review, a senior teammate aggressively criticizes your approach in front of the team.",
        question: "What is your immediate response?",
        options: [
            {
                text: "Reply defensively and point out flaws in their recent work.",
                impact: { emotionalIntelligence: 10 }
            },
            {
                text: "Stay silent during the meeting, but complain to your manager later.",
                impact: { emotionalIntelligence: 40 }
            },
            {
                text: "Acknowledge their feedback calmly and suggest discussing it 1-on-1 after the meeting.",
                impact: { emotionalIntelligence: 100 }
            }
        ]
    },
    {
        id: "stage-3",
        title: "Stage 3: Time Pressure",
        description: "It's 4 PM on a Friday. You have 3 tasks: A critical bug affecting 5% of users, a feature your manager wants for a demo, and answering a colleague's question.",
        question: "In what order do you tackle these?",
        type: "ranking", // Represents a different interaction type if we want
        options: [
            {
                text: "Feature Demo -> Critical Bug -> Colleague",
                impact: { decisionMaking: 40 }
            },
            {
                text: "Colleague -> Feature Demo -> Critical Bug",
                impact: { decisionMaking: 20 }
            },
            {
                text: "Critical Bug -> Feature Demo -> Colleague (delegate if possible)",
                impact: { decisionMaking: 100 }
            }
        ]
    },
    {
        id: "stage-4",
        title: "Stage 4: Ethical Dilemma",
        description: "Your boss suggests hardcoding some fake data to hide a performance flaw right before a major investor demo.",
        question: "How do you handle this?",
        options: [
            {
                text: "Do it. The boss knows best and we need the funding.",
                impact: { integrity: 10, decisionMaking: 30 }
            },
            {
                text: "Refuse aggressively and threaten to tell the investors.",
                impact: { integrity: 100, emotionalIntelligence: 20 }
            },
            {
                text: "Express your discomfort, explain the long-term risks, and propose an alternative way to frame the current performance.",
                impact: { integrity: 100, emotionalIntelligence: 100, decisionMaking: 90 }
            }
        ]
    }
];
