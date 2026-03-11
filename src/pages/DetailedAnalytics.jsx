import { useState, useEffect } from 'react';
import {
    BarChart, Users, FileText, CheckCircle, AlertTriangle,
    ArrowLeft, Download, RefreshCw, TrendingUp, BarChart2,
    PieChart as PieChartIcon, Activity, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export default function DetailedAnalytics() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        const token = localStorage.getItem('skilltrace_token');
        try {
            const res = await axios.get('/api/analytics/hr/global', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load global analytics report.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Aggregating global intelligence...</p>
                </div>
            </div>
        );
    }

    // Chart Data Preparation
    const skillLabels = ['Coding', 'Debugging', 'Decision Making', 'Communication', 'Integrity'];
    const barData = {
        labels: skillLabels,
        datasets: [
            {
                label: 'Global Average Score',
                data: data ? [
                    parseFloat(data.skillAverages.avg_coding || 0),
                    parseFloat(data.skillAverages.avg_debugging || 0),
                    parseFloat(data.skillAverages.avg_decision || 0),
                    parseFloat(data.skillAverages.avg_communication || 0),
                    parseFloat(data.skillAverages.avg_integrity || 0)
                ] : [],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(234, 179, 8, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                ],
                borderColor: [
                    '#22C55E', '#3B82F6', '#A855F7', '#EAB308', '#EF4444'
                ],
                borderWidth: 1,
            }
        ]
    };

    const pieData = {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
            {
                data: data ? [
                    parseInt(data.riskDistribution.low_risk || 0),
                    parseInt(data.riskDistribution.medium_risk || 0),
                    parseInt(data.riskDistribution.high_risk || 0)
                ] : [],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(234, 179, 8, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                ],
                borderColor: [
                    '#22C55E', '#EAB308', '#EF4444'
                ],
                borderWidth: 1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1E293B',
                titleColor: '#F1F5F9',
                bodyColor: '#94A3B8',
                borderColor: '#334155',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(51, 65, 85, 0.5)' },
                ticks: { color: '#94A3B8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94A3B8' }
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] pb-20">
            {/* Header - Hidden in Print */}
            <div className="print:hidden border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/hr/analytics')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={isRefreshing}
                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition shadow-lg shadow-cyan-900/20"
                        >
                            <Download className="w-4 h-4" /> Export PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Title Section */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">SkillTrace Insights Report</h1>
                    <p className="text-slate-400 text-lg">Detailed analytical overview of the entire candidate pipeline.</p>
                    <p className="text-slate-500 text-sm mt-2">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -mr-8 -mt-8" />
                        <Users className="w-8 h-8 text-cyan-400 mb-4" />
                        <p className="text-3xl font-black">{data?.summary.total_candidates}</p>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Candidates</p>
                    </div>
                    <div className="bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8" />
                        <FileText className="w-8 h-8 text-purple-400 mb-4" />
                        <p className="text-3xl font-black">{data?.summary.total_challenges}</p>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Active Challenges</p>
                    </div>
                    <div className="bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8" />
                        <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                        <p className="text-3xl font-black">{data?.summary.total_submissions}</p>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Submissions</p>
                    </div>
                    <div className="bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8" />
                        <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
                        <p className="text-3xl font-black">{data?.skillAverages.avg_integrity}%</p>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Avg Integrity</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Bar Chart - Skills */}
                    <div className="lg:col-span-2 bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-cyan-400" />
                                <h3 className="font-bold text-lg">Global Skill Averages</h3>
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Pie Chart - Risk */}
                    <div className="bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="w-5 h-5 text-red-400" />
                            <h3 className="font-bold text-lg">Risk Distribution</h3>
                        </div>
                        <div className="h-[250px] flex items-center justify-center">
                            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500" /> Low Risk
                                </span>
                                <span className="font-bold">{data?.riskDistribution.low_risk}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium Risk
                                </span>
                                <span className="font-bold">{data?.riskDistribution.medium_risk}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500" /> High Risk
                                </span>
                                <span className="font-bold">{data?.riskDistribution.high_risk}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-bold text-lg">Recent Submission Activity</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#0F172A]/50 text-slate-500 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4">Challenge</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {data?.recentActivity.map((act) => (
                                    <tr key={act.id} className="hover:bg-slate-800/50 transition cursor-default">
                                        <td className="px-6 py-4 font-medium text-white">{act.candidate_name}</td>
                                        <td className="px-6 py-4 text-slate-400">{act.challenge_title}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md font-bold ${act.overall_score >= 80 ? 'text-green-400 bg-green-400/10' :
                                                act.overall_score >= 50 ? 'text-yellow-400 bg-yellow-400/10' :
                                                    'text-slate-400 bg-slate-400/10'
                                                }`}>
                                                {act.overall_score || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(act.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                                {data?.recentActivity.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-500">No recent activity detected.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Report Footer - Visible only in Print */}
                <div className="hidden print:block mt-20 pt-10 border-t border-slate-300 text-slate-600 text-sm">
                    <div className="flex justify-between">
                        <p>Detailed Analytics Report - SkillTrace</p>
                        <p>Confidence: High (Based on live telemetry data)</p>
                    </div>
                    <p className="mt-4 italic text-slate-500 text-xs">
                        This document contains confidential candidate performance data. Unauthorized distribution is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}
