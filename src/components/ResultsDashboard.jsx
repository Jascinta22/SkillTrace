import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { getFinalRating } from '../utils/scoring';
import { Award, Brain, Target, Heart, Shield, RefreshCw } from 'lucide-react';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function ResultsDashboard({ scores, onRestart }) {
    const rating = getFinalRating(scores);

    const data = {
        labels: [
            'Critical Thinking',
            'Emotional Intelligence',
            'Decision Making',
            'Integrity',
            'AI Independence'
        ],
        datasets: [
            {
                label: 'Your Skill Profile',
                data: [
                    scores.criticalThinking,
                    scores.emotionalIntelligence,
                    scores.decisionMaking,
                    scores.integrity,
                    scores.aiCollaborationBalance
                ],
                backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo 500
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
            },
        ],
    };

    const options = {
        scales: {
            r: {
                angleLines: { color: 'rgba(148, 163, 184, 0.3)' },
                grid: { color: 'rgba(148, 163, 184, 0.3)' },
                pointLabels: {
                    font: { size: 12, family: "'Inter', sans-serif", weight: '600' },
                    color: '#475569'
                },
                ticks: {
                    display: false,
                    min: 0,
                    max: 100,
                    stepSize: 20
                }
            }
        },
        plugins: {
            legend: { display: false }
        },
        maintainAspectRatio: false
    };

    // AI Mentor Summary Logic
    const getMentorSummary = () => {
        let strengths = [];
        let weaknesses = [];

        if (scores.criticalThinking >= 80) strengths.push("analytical reasoning");
        else if (scores.criticalThinking <= 40) weaknesses.push("digging deeper into ambiguous problems");

        if (scores.emotionalIntelligence >= 80) strengths.push("empathy and conflict resolution");
        else if (scores.emotionalIntelligence <= 40) weaknesses.push("maintaining composure under criticism");

        if (scores.integrity >= 80) strengths.push("strong moral compass");
        else if (scores.integrity <= 40) weaknesses.push("navigating ethical gray areas");

        if (scores.aiCollaborationBalance < 80) weaknesses.push("over-reliance on external tools (AI) during focused tasks");

        let summary = "Based on your simulation, ";

        if (strengths.length > 0) {
            summary += `you excel in ${strengths.join(" and ")}. `;
        } else {
            summary += `you have a baseline understanding of workplace dynamics. `;
        }

        if (weaknesses.length > 0) {
            summary += `However, you could benefit from improving in ${weaknesses.join(" and ")}.`;
        } else {
            summary += `You demonstrated highly balanced and robust human skills across the board.`;
        }

        return summary;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 animate-fade-in-up">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Assessment Results</h1>
                    <p className="text-lg text-slate-500">Your true human skill profile unlocked.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Rating Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105">
                        <Award className="w-20 h-20 mb-6 text-indigo-200" />
                        <p className="text-indigo-200 uppercase tracking-wider font-semibold text-sm mb-2">Final Rating</p>
                        <h2 className="text-4xl font-bold mb-4">{rating}</h2>
                        <p className="text-indigo-100/80 text-sm">
                            This rating is calculated based on your core scores and AI independence.
                        </p>
                    </div>

                    {/* Radar Chart Card */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <Target className="w-6 h-6 mr-2 text-indigo-500" /> Skill Radar
                        </h3>
                        <div className="w-full h-[300px] flex justify-center">
                            <Radar data={data} options={options} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* AI Mentor Insights */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <Brain className="w-6 h-6 mr-2 text-purple-500" /> AI Mentor Summary
                        </h3>
                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                            <p className="text-slate-700 leading-relaxed">
                                {getMentorSummary()}
                            </p>
                        </div>
                    </div>

                    {/* Score Breakdown List */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <Heart className="w-6 h-6 mr-2 text-pink-500" /> Score Breakdown
                        </h3>
                        <div className="space-y-4">
                            <ScoreBar label="Critical Thinking" score={scores.criticalThinking} />
                            <ScoreBar label="Emotional Intelligence" score={scores.emotionalIntelligence} />
                            <ScoreBar label="Decision Making" score={scores.decisionMaking} />
                            <ScoreBar label="Integrity" score={scores.integrity} />
                            <ScoreBar label="AI Independence" score={scores.aiCollaborationBalance} color="bg-emerald-500" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={onRestart}
                        className="flex items-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg rounded-xl font-bold transition-all"
                    >
                        <RefreshCw className="w-5 h-5 mr-3" /> Start Over
                    </button>
                </div>

            </div>
        </div>
    );
}

function ScoreBar({ label, score, color = "bg-indigo-500" }) {
    return (
        <div>
            <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>{label}</span>
                <span>{score}/100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`${color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    )
}
