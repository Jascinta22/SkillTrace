import { useLocation, Link } from 'react-router-dom';
import { Target, ShieldAlert, CheckCircle2, Home } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Results() {
    const location = useLocation();
    const metrics = location.state?.metrics || { tabSwitches: 0, pasteEvents: 0 };
    const challengeId = location.state?.challengeId || 'Unknown Challenge';
    const codeQuality = location.state?.codeQuality || null;

    // Mocking technical scores for demonstration after solving
    const scores = {
        technical: codeQuality ? codeQuality.qualityScore : 85,
        problemSolving: 90,
        efficiency: codeQuality ? (codeQuality.timeComplexity === 'O(1)' ? 100 : codeQuality.timeComplexity === 'O(n)' ? 80 : 60) : 78,
        communication: 88,
        integrity: Math.max(0, 100 - (metrics.tabSwitches * 10) - (metrics.pasteEvents * 15))
    };

    const chartData = {
        labels: ['Technical', 'Problem Solving', 'Efficiency', 'Communication', 'Integrity'],
        datasets: [{
            label: 'Your Assessment Profile',
            data: [scores.technical, scores.problemSolving, scores.efficiency, scores.communication, scores.integrity],
            backgroundColor: 'rgba(6, 182, 212, 0.2)', // Cyan with opacity
            borderColor: 'rgba(6, 182, 212, 1)',     // Cyan border
            borderWidth: 2,
            pointBackgroundColor: '#22C55E',         // Emerald points
            pointBorderColor: '#fff',
        }],
    };

    return (
        <div className="min-h-screen bg-[#0F172A] py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-[#F1F5F9] mb-2">Final Candidate Report</h1>
                    <p className="text-lg text-slate-400">Analysis complete for: {challengeId}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Radar Chart */}
                    <div className="bg-[#1E293B] rounded-3xl p-8 shadow-[0_0_20px_rgba(6,182,212,0.1)] border border-slate-700 flex flex-col items-center">
                        <h3 className="text-xl font-bold text-[#F1F5F9] mb-6 flex items-center w-full">
                            <Target className="w-6 h-6 mr-2 text-[#06B6D4]" /> Skill Assessment Radar
                        </h3>
                        <div className="w-full h-64">
                            <Radar
                                data={chartData}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        r: {
                                            min: 0,
                                            max: 100,
                                            ticks: { display: false },
                                            grid: { color: 'rgba(148, 163, 184, 0.2)' },
                                            angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
                                            pointLabels: { color: '#94a3b8', font: { size: 12 } }
                                        }
                                    },
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </div>
                    </div>

                    {/* Integrity Report */}
                    <div className="bg-[#1E293B] rounded-3xl p-8 shadow-[0_0_20px_rgba(34,197,94,0.1)] border border-slate-700 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-[#F1F5F9] mb-6 flex items-center">
                            <ShieldAlert className="w-6 h-6 mr-2 text-orange-400" /> Integrity Telemetry
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                <span className="font-semibold text-slate-300">Tab Switching Events</span>
                                <span className={`text-2xl font-black ${metrics.tabSwitches > 0 ? 'text-orange-400' : 'text-[#22C55E]'}`}>
                                    {metrics.tabSwitches}
                                </span>
                            </div>
                            <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                <span className="font-semibold text-slate-300">Paste Events Detected</span>
                                <span className={`text-2xl font-black ${metrics.pasteEvents > 0 ? 'text-red-400' : 'text-[#22C55E]'}`}>
                                    {metrics.pasteEvents}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700">
                            {scores.integrity >= 80 ? (
                                <div className="flex items-center text-[#22C55E] bg-[#0F172A] border border-[#22C55E] p-4 rounded-xl shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                    <CheckCircle2 className="w-6 h-6 mr-3" />
                                    <span className="font-bold">Trust Score Excellent. High probability of authentic work.</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-400 bg-[#0F172A] border border-red-500 p-4 rounded-xl shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                                    <ShieldAlert className="w-6 h-6 mr-3" />
                                    <span className="font-bold">Trust Score Compromised. Potentially high AI reliance.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Code Quality Report (If Applicable) */}
                    {codeQuality && (
                        <div className="md:col-span-2 bg-[#1E293B] rounded-3xl p-8 shadow-[0_0_20px_rgba(168,85,247,0.1)] border border-slate-700">
                            <h3 className="text-xl font-bold text-[#F1F5F9] mb-6 flex items-center">
                                <Target className="w-6 h-6 mr-2 text-purple-400" /> Code Quality Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-700 flex flex-col justify-center items-center">
                                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Time Complexity</span>
                                    <span className={`text-3xl font-black ${codeQuality.timeComplexity === 'O(1)' || codeQuality.timeComplexity === 'O(log n)' ? 'text-[#22C55E]' : codeQuality.timeComplexity === 'O(n)' ? 'text-blue-400' : 'text-orange-400'}`}>
                                        {codeQuality.timeComplexity}
                                    </span>
                                </div>
                                <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-700 flex flex-col justify-center items-center">
                                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Space Complexity</span>
                                    <span className={`text-3xl font-black ${codeQuality.spaceComplexity === 'O(1)' ? 'text-[#22C55E]' : 'text-blue-400'}`}>
                                        {codeQuality.spaceComplexity}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="text-slate-300">
                                    Overall Quality Score: <strong className="text-purple-400">{codeQuality.qualityScore}/100</strong>.
                                    Your solution demonstrates {codeQuality.qualityScore > 80 ? 'excellent' : codeQuality.qualityScore > 60 ? 'fair' : 'suboptimal'} computational efficiency.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-8">
                    <Link to="/marketplace" className="mx-2 px-6 py-3 bg-[#1E293B] border border-slate-600 text-slate-300 hover:border-[#06B6D4] hover:text-[#06B6D4] rounded-xl font-bold transition-all shadow-sm">
                        Solve Another
                    </Link>
                    <Link to="/" className="flex items-center mx-2 px-6 py-3 bg-[#22C55E] text-[#0F172A] rounded-xl font-bold hover:bg-green-400 transition shadow-[0_0_15px_#22C55E]">
                        <Home className="w-5 h-5 mr-2" /> Return Home
                    </Link>
                </div>

            </div>
        </div>
    );
}
