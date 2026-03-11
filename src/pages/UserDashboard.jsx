import { useState, useEffect } from 'react';
import { Users, Briefcase, BookOpen, TrendingUp, BarChart3, Settings, LogOut, Bell, Shield, BarChart, AlertTriangle, Code, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function UserDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [skillGaps, setSkillGaps] = useState(null);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('skilltrace_token');
        try {
            const [dashRes, gapRes, trendRes] = await Promise.all([
                axios.get('/api/analytics/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/analytics/skill-gaps', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/analytics/trends', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setDashboardData(dashRes.data);
            setSkillGaps(gapRes.data);
            setTrends(trendRes.data);
        } catch (err) {
            console.error('Error fetching dashboard analytics:', err);
            setError('Failed to load real-time analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
                <Navigation />
                <div className="flex-1 flex flex-col items-center justify-center -mt-16">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading your real-time performance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center -mt-16">
                    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 text-center max-w-md">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Data Loading Failed</h3>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button onClick={fetchAnalytics} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = dashboardData?.stats || { challenges_attempted: 0, avg_score: 0, highest_score: 0, total_submissions: 0 };
    const skillBreakdown = dashboardData?.skillBreakdown || { coding: 0, debugging: 0, decision_making: 0, communication: 0, integrity: 0 };
    const recentSubmissions = dashboardData?.recentSubmissions || [];

    // Derive top level skill score from average
    const overallSkillScore = Math.round((parseFloat(stats.avg_score) || 0));

    // Average integrity proxy for AI Dependency
    // High integrity -> Low dependency
    const integrityVal = parseFloat(skillBreakdown.integrity) || 100;
    const aiDependencyScore = Math.max(0, 100 - Math.round(integrityVal));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
            <Navigation />
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SkillTrace Dashboard</h1>
                        <p className="text-sm text-slate-600 mt-1">Welcome back, <span className="font-semibold text-indigo-700">{user?.name || 'Candidate'}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/security" className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition shadow-sm border border-slate-100" title="Security Settings">
                            <Shield className="w-5 h-5 text-slate-600" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-slate-200/60 bg-gradient-to-br from-white to-slate-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Role</p>
                            <p className="text-2xl font-black capitalize text-slate-900">{user?.role || 'Candidate'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Total Submissions</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total_submissions}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Highest Score</p>
                            <p className="text-2xl font-black text-indigo-600">{parseFloat(stats.highest_score || 0).toFixed(1)}%</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Unique Challenges</p>
                            <p className="text-2xl font-black text-emerald-600">{stats.challenges_attempted}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'skills', label: 'Skill Analysis', icon: BookOpen },
                        { id: 'challenges', label: 'Recent Submissions', icon: TrendingUp }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-xl transition whitespace-nowrap ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/60 shadow-sm'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Stats Cards */}
                        <div className="md:col-span-2 space-y-8 animate-fade-in-up">
                            {/* Overall Skill */}
                            <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200/60 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20"></div>

                                <h3 className="text-xl font-bold text-slate-900 mb-8 relative z-10 text-center md:text-left">Overall Performance Engine</h3>

                                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                                    <div className="flex-shrink-0">
                                        <div className="relative w-44 h-44 drop-shadow-xl">
                                            <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                                            <div
                                                className="absolute inset-0 rounded-full border-8 border-indigo-600 z-10 transition-all duration-1000"
                                                style={{ clipPath: `inset(${100 - overallSkillScore}% 0 0 0)` }}
                                            ></div>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full z-20 m-3 shadow-inner">
                                                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-800">{overallSkillScore}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg Score</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="mb-6 p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 border-l-4 border-l-indigo-600 flex gap-4 items-center">
                                            <TrendingUp className="w-8 h-8 text-indigo-500 opacity-80" />
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                Your performance trend over the <strong className="text-indigo-900">{trends?.timeframe || 'period'}</strong> is <strong className={`capitalize px-2 py-0.5 rounded ${trends?.trend === 'improving' ? 'bg-emerald-100 text-emerald-800' : trends?.trend === 'declining' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{trends?.trend || 'stable'}</strong> across {trends?.insights?.totalAttempts || 0} attempts.
                                            </p>
                                        </div>
                                        <div className="space-y-5">
                                            {[
                                                { label: 'Coding Proficiency', value: skillBreakdown.coding, color: 'bg-indigo-500', bg: 'bg-indigo-50' },
                                                { label: 'System Design & Logic', value: skillBreakdown.decision_making, color: 'bg-blue-500', bg: 'bg-blue-50' },
                                                { label: 'Communication & Documentation', value: skillBreakdown.communication, color: 'bg-purple-500', bg: 'bg-purple-50' }
                                            ].map((skill, idx) => (
                                                <div key={idx} className="group">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition">{skill.label}</p>
                                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 rounded-md">{parseFloat(skill.value || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <div className={`w-full ${skill.bg} rounded-full h-3 overflow-hidden border border-white`}>
                                                        <div className={`${skill.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(parseFloat(skill.value || 0), 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Dependency Score */}
                            <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200/60 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-white to-slate-50/50">
                                <div className={`flex-shrink-0 w-32 h-32 rounded-3xl flex flex-col items-center justify-center border-4 shadow-sm rotate-3 hover:rotate-0 transition-all ${aiDependencyScore > 30 ? 'border-amber-300 bg-amber-50 shadow-amber-100' : 'border-emerald-300 bg-emerald-50 shadow-emerald-100'}`}>
                                    <Shield className={`w-8 h-8 mb-1 ${aiDependencyScore > 30 ? 'text-amber-500' : 'text-emerald-500'}`} />
                                    <p className={`text-3xl font-black ${aiDependencyScore > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>{aiDependencyScore}</p>
                                    <span className="text-[9px] uppercase font-black text-slate-500 mt-1 tracking-widest opacity-80">Dependency</span>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">AI & Integrity Index</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto md:mx-0 mb-4">
                                        Lower dependency shows higher independent capability. This tracks pasting frequency, tab swapping, and external tool reliance during challenges.
                                    </p>
                                    {aiDependencyScore > 30 ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-800 text-xs font-bold">
                                            ⚠️ Dependency elevated. Focus on original logic.
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
                                            ✨ Excellent! Strong independent problem-solving.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            {/* Action Card */}
                            <div className="bg-[#0F172A] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#06B6D4] rounded-full opacity-20 blur-2xl group-hover:bg-indigo-400 group-hover:scale-110 transition-all duration-700"></div>
                                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-600 rounded-full opacity-20 blur-2xl"></div>

                                <h3 className="font-black text-2xl mb-2 relative z-10 text-white drop-shadow-md">Ready to rise?</h3>
                                <p className="text-slate-300 text-sm mb-8 relative z-10 leading-relaxed font-medium">Push your boundaries. Take a new challenge to boost your analytics and climb the ranks.</p>

                                <div className="space-y-3 relative z-10">
                                    <Link
                                        to="/marketplace"
                                        className="flex items-center justify-center w-full px-5 py-3.5 bg-gradient-to-r from-[#06B6D4] to-indigo-500 hover:from-[#06B6D4] hover:to-indigo-400 text-white font-bold rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5"
                                    >
                                        <Code className="w-5 h-5 mr-3" />
                                        Launch Marketplace
                                    </Link>
                                    <Link
                                        to="/skill-selection"
                                        className="flex items-center justify-center w-full px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition backdrop-blur-md"
                                    >
                                        <BookOpen className="w-5 h-5 mr-3 opacity-70" />
                                        Browse Skills
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200/60">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 px-2">Account Hub</h3>
                                <Link
                                    to="/hr/analytics"
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl transition group text-slate-700 hover:text-slate-900"
                                >
                                    <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300">
                                        <Briefcase className="w-5 h-5 text-purple-600 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <span className="font-bold block">HR View</span>
                                        <span className="text-xs text-slate-500 block">Switch to employer mode</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Skills Tab (Gap Analysis) */}
                {activeTab === 'skills' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Coding Architecture', value: skillBreakdown.coding, icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'System Debugging', value: skillBreakdown.debugging, icon: Settings, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { label: 'Tech Communication', value: skillBreakdown.communication, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Logic & Decisions', value: skillBreakdown.decision_making, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                            ].map((skill, i) => {
                                const Icon = skill.icon;
                                return (
                                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${skill.bg}`}>
                                                <Icon className={`w-6 h-6 ${skill.color}`} />
                                            </div>
                                            <p className="text-3xl font-black text-slate-800">{parseFloat(skill.value || 0).toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-bold mb-3">{skill.label}</p>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className={`${skill.bg.replace('50', '500')} h-1.5 rounded-full`} style={{ width: `${Math.min(parseFloat(skill.value || 0), 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {skillGaps?.recommendations && skillGaps.recommendations.length > 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200/60 overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 text-slate-50 opacity-50">
                                    <TrendingUp className="w-64 h-64" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    Skill Gap Recommendations
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    {skillGaps.recommendations.map((rec, idx) => (
                                        <div key={idx} className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between md:items-center gap-6 ${rec.priority === 'high' ? 'bg-red-50/50 border-red-200' :
                                                rec.priority === 'medium' ? 'bg-amber-50/50 border-amber-200' :
                                                    'bg-emerald-50/50 border-emerald-200'
                                            }`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-bold text-slate-900 capitalize text-lg">{rec.skill.replace('_', ' ')}</h4>
                                                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${rec.priority === 'high' ? 'bg-red-200 text-red-900' :
                                                            rec.priority === 'medium' ? 'bg-amber-200 text-amber-900' :
                                                                'bg-emerald-200 text-emerald-900'
                                                        }`}>{rec.priority} Priority</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{rec.recommendation}</p>
                                            </div>
                                            <Link to={`/skill/${rec.skill.toLowerCase().replace('_', '-')}`} className={`px-6 py-3 font-bold text-sm rounded-xl whitespace-nowrap transition shadow-sm ${rec.priority === 'high' ? 'bg-red-600 text-white hover:bg-red-700' :
                                                    rec.priority === 'medium' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                                                        'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}>
                                                Focus on {rec.skill.replace('_', ' ')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-12 text-center shadow-sm">
                                <Award className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-emerald-900 mb-2">No Significant Skill Gaps!</h3>
                                <p className="text-emerald-700 max-w-lg mx-auto font-medium">Your scores are perfectly aligned with or above global benchmarks. Keep pushing your boundaries with more advanced challenges.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Challenges Tab */}
                {activeTab === 'challenges' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden animate-fade-in-up">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Submission History</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Detailed log of your recent verified challenges.</p>
                            </div>
                        </div>
                        {recentSubmissions && recentSubmissions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                                            <th className="p-6 font-bold w-1/3">Challenge</th>
                                            <th className="p-6 font-bold w-1/6">Type</th>
                                            <th className="p-6 font-bold text-center w-1/4">Algorithm Gen Score</th>
                                            <th className="p-6 font-bold text-right w-1/4">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-sm">
                                        {recentSubmissions.map((sub, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-6">
                                                    <p className="font-bold text-slate-900 text-base">{sub.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-60 group-hover:opacity-100 transition truncate w-32 border border-slate-200 rounded px-1 bg-slate-50"># {sub.id.substring(0, 8)}</p>
                                                </td>
                                                <td className="p-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-slate-200">
                                                        {sub.type}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <div className="flex justify-center">
                                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg ${parseFloat(sub.overall_score) >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-[inset_0_2px_4px_rgba(16,185,129,0.1)]' :
                                                                parseFloat(sub.overall_score) >= 60 ? 'bg-amber-50 text-amber-600 border border-amber-100 shadow-[inset_0_2px_4px_rgba(245,158,11,0.1)]' :
                                                                    'bg-red-50 text-red-600 border border-red-100 shadow-[inset_0_2px_4px_rgba(239,68,68,0.1)]'
                                                            }`}>
                                                            {parseFloat(sub.overall_score || 0).toFixed(0)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right text-slate-500 font-semibold text-xs whitespace-nowrap">
                                                    {new Date(sub.submitted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center text-slate-500 bg-white">
                                <Code className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <p className="text-xl font-bold text-slate-700 mb-2">No Verified Submissions</p>
                                <p className="mb-8 max-w-sm mx-auto font-medium">Head to the marketplace to take your first challenge and unlock detailed skill analytics.</p>
                                <Link to="/marketplace" className="inline-flex items-center px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 text-white font-bold rounded-xl transition">
                                    Browse Marketplace
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
