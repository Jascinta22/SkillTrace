import { Target, Users, ShieldAlert, Award, Shield, BarChart as BarChartIcon, Lock, UploadCloud, TrendingUp, Settings, Video, Wand2, LogOut, Loader2, AlertTriangle, Code, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function HRDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidateDetail, setCandidateDetail] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('skilltrace_token');
        try {
            const res = await axios.get('/api/analytics/hr/candidates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidates(res.data);
        } catch (err) {
            console.error('Error fetching candidates:', err);
            setError('Failed to load candidate data. Ensure you are logged in as HR.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidateDetail = async (candidate) => {
        setSelectedCandidate(candidate);
        setDetailLoading(true);
        setCandidateDetail(null);
        const token = localStorage.getItem('skilltrace_token');
        try {
            const res = await axios.get(`/api/analytics/hr/candidate/${candidate.user_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidateDetail(res.data);
        } catch (err) {
            console.error('Error fetching candidate detail:', err);
            setCandidateDetail({ scores: [], telemetryLogs: [], submissions: [] });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getIntegrityColor = (integrity) => {
        const val = parseFloat(integrity || 100);
        if (val >= 80) return 'text-[#22C55E] bg-[#0F172A] border-[#22C55E]';
        if (val >= 50) return 'text-orange-400 bg-[#0F172A] border-orange-500';
        return 'text-red-400 bg-[#0F172A] border-red-500';
    };

    const calculateTopPercentile = (score, allCandidates) => {
        if (!allCandidates || allCandidates.length === 0) return 50;
        const scores = allCandidates.map(c => parseFloat(c.aggregated_skill_index || 0));
        const lowerScores = scores.filter(s => s < parseFloat(score || 0)).length;
        const percentile = Math.round((lowerScores / scores.length) * 100);
        const topVal = 100 - percentile;
        return topVal === 0 ? 1 : topVal;
    };

    const handleExportToATS = () => {
        alert(`Exporting ${selectedCandidate.name} to configured ATS via Webhook...`);
    };

    // Derive aggregated scores from detail data
    const getAggregatedScores = () => {
        if (!candidateDetail || !candidateDetail.scores || candidateDetail.scores.length === 0) {
            return { coding: 0, debugging: 0, communication: 0, decision_making: 0, integrity: 0 };
        }
        const scores = candidateDetail.scores;
        const avg = (field) => {
            const values = scores.map(s => parseFloat(s[field] || 0));
            return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;
        };
        return {
            coding: avg('coding_score'),
            debugging: avg('debugging_score'),
            communication: avg('communication_score'),
            decision_making: avg('decision_making_score'),
            integrity: avg('integrity_score')
        };
    };

    // Count telemetry events
    const getTelemetrySummary = () => {
        if (!candidateDetail || !candidateDetail.telemetryLogs) return { tabSwitches: 0, pasteEvents: 0 };
        const logs = candidateDetail.telemetryLogs;
        return {
            tabSwitches: logs.filter(l => l.event_type === 'tab_switch').length,
            pasteEvents: logs.filter(l => l.event_type === 'paste').length
        };
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1E293B] text-slate-300 p-6 flex flex-col hidden md:flex border-r border-slate-700">
                <div className="flex items-center text-[#F1F5F9] mb-10">
                    <Target className="w-8 h-8 mr-3 text-[#06B6D4]" />
                    <h2 className="text-xl font-bold">HR Analytics</h2>
                </div>
                <nav className="space-y-4">
                    <a href="#" className="flex items-center text-[#0F172A] bg-[#06B6D4] rounded-xl p-3 shadow-[0_0_10px_#06B6D4] font-bold">
                        <Users className="w-5 h-5 mr-3" /> Candidates
                    </a>
                    <Link to="/hr/leaderboard" className="flex items-center hover:text-[#06B6D4] hover:bg-slate-800 rounded-xl p-3 transition">
                        <Award className="w-5 h-5 mr-3" /> Leaderboard
                    </Link>
                    <Link to="/hr/risk-reports" className="flex items-center hover:text-[#06B6D4] hover:bg-slate-800 rounded-xl p-3 transition">
                        <ShieldAlert className="w-5 h-5 mr-3" /> Risk Reports
                    </Link>
                    <Link to="/hr/detailed-report" className="flex items-center hover:text-[#06B6D4] hover:bg-slate-800 rounded-xl p-3 transition">
                        <BarChartIcon className="w-5 h-5 mr-3" /> Analytics
                    </Link>
                    <Link to="/compliance" className="flex items-center hover:text-[#06B6D4] hover:bg-slate-800 rounded-xl p-3 transition">
                        <Lock className="w-5 h-5 mr-3" /> Compliance
                    </Link>

                    <div className="pt-4 mt-4 border-t border-slate-700 w-full mb-auto">
                        <p className="text-xs uppercase font-bold text-slate-500 mb-2 px-3 tracking-wider">Enterprise Tools</p>
                        <Link to="/hr/challenge-builder" className="flex items-center hover:text-indigo-400 hover:bg-slate-800 rounded-xl p-3 transition">
                            <Wand2 className="w-5 h-5 mr-3" /> Challenge Builder
                        </Link>
                        <Link to="/hr/settings" className="flex items-center hover:text-indigo-400 hover:bg-slate-800 rounded-xl p-3 transition">
                            <Settings className="w-5 h-5 mr-3" /> Settings Hub
                        </Link>
                    </div>

                    <div className="pt-4 mt-auto border-t border-slate-700 w-full">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full hover:text-red-400 hover:bg-red-500/10 rounded-xl p-3 transition text-slate-400"
                        >
                            <LogOut className="w-5 h-5 mr-3" /> Sign Out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Candidate Pool</h1>
                <p className="text-slate-400 mb-8">Review real candidate submissions and analyze true skill profiles.</p>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-[#06B6D4] animate-spin mb-4" />
                        <p className="text-slate-400 font-medium">Loading candidate profiles from database...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-400 font-medium mb-4">{error}</p>
                        <button onClick={fetchCandidates} className="px-6 py-2 bg-[#06B6D4] text-[#0F172A] font-bold rounded-xl hover:bg-cyan-400 transition">Retry</button>
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                        <Users className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-xl font-bold text-slate-400 mb-2">No Candidates Yet</p>
                        <p className="max-w-md text-center">When candidates register and complete challenges, their profiles will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Candidates List */}
                        <div className="lg:col-span-2 space-y-4">
                            {candidates.map(candidate => {
                                const skillIndex = parseFloat(candidate.aggregated_skill_index || 0).toFixed(1);
                                const isSelected = selectedCandidate?.user_id === candidate.user_id;
                                return (
                                    <div
                                        key={candidate.user_id}
                                        onClick={() => fetchCandidateDetail(candidate)}
                                        className={`flex flex-col md:flex-row bg-[#1E293B] rounded-2xl p-6 shadow-sm border transition-all cursor-pointer ${isSelected ? 'border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-[#F1F5F9] flex items-center mb-1">
                                                {candidate.name}
                                                {parseFloat(skillIndex) >= 90 && <Award className="w-5 h-5 text-yellow-400 ml-2 animate-pulse" />}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-mono mb-3">{candidate.email}</p>
                                            <div className="flex gap-4">
                                                <div className="bg-[#0F172A] px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-300">
                                                    Skill Index: <span className="text-[#06B6D4] font-bold">{skillIndex}</span>
                                                </div>
                                                <div className="bg-[#0F172A] px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-300">
                                                    Integrity: <span className={`font-bold ${parseFloat(candidate.average_integrity || 0) >= 80 ? 'text-[#22C55E]' : parseFloat(candidate.average_integrity || 0) >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                                        {parseFloat(candidate.average_integrity || 0).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end justify-center">
                                            <div className="text-3xl font-black text-[#F1F5F9] mb-1">{skillIndex}</div>
                                            <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Skill Index</div>
                                            <div className="flex items-center text-xs font-bold text-indigo-400 bg-[#0F172A] px-2 py-1 rounded border border-indigo-500/30">
                                                <TrendingUp className="w-3 h-3 mr-1" /> Top {calculateTopPercentile(skillIndex, candidates)}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Details Panel */}
                        <div className="bg-[#1E293B] rounded-3xl p-6 shadow-xl border border-slate-700 h-fit sticky top-8">
                            {selectedCandidate ? (
                                detailLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-10 h-10 text-[#06B6D4] animate-spin mb-4" />
                                        <p className="text-slate-400 text-sm">Loading profile...</p>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in-up">
                                        <h3 className="text-2xl font-bold text-[#F1F5F9] mb-1 border-b border-slate-700 pb-4">
                                            Profile: {selectedCandidate.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-mono mb-6">{selectedCandidate.email}</p>

                                        {/* Integrity Report */}
                                        <div className="mb-8">
                                            <h4 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">Integrity Report</h4>
                                            {(() => {
                                                const telemetry = getTelemetrySummary();
                                                return (
                                                    <div className={`p-4 rounded-xl border flex justify-between items-center ${getIntegrityColor(selectedCandidate.average_integrity)}`}>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold opacity-80">Tab Switches</span>
                                                            <span className="text-2xl font-black">{telemetry.tabSwitches}</span>
                                                        </div>
                                                        <ShieldAlert className="w-8 h-8 opacity-50" />
                                                        <div className="flex flex-col text-right">
                                                            <span className="text-sm font-semibold opacity-80">Paste Events</span>
                                                            <span className="text-2xl font-black">{telemetry.pasteEvents}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Detailed Scores */}
                                        <div className="mb-8">
                                            <h4 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">Detailed Scores</h4>
                                            {(() => {
                                                const scores = getAggregatedScores();
                                                return (
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg border border-slate-700">
                                                            <span className="font-medium text-slate-300">Coding</span>
                                                            <span className="font-bold text-[#06B6D4]">{scores.coding}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg border border-slate-700">
                                                            <span className="font-medium text-slate-300">Debugging</span>
                                                            <span className="font-bold text-[#06B6D4]">{scores.debugging}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg border border-slate-700">
                                                            <span className="font-medium text-slate-300">Decision Making</span>
                                                            <span className="font-bold text-[#22C55E]">{scores.decision_making}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg border border-slate-700">
                                                            <span className="font-medium text-slate-300">Communication</span>
                                                            <span className="font-bold text-[#22C55E]">{scores.communication}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg border border-slate-700">
                                                            <span className="font-medium text-slate-300">Integrity</span>
                                                            <span className={`font-bold ${parseFloat(scores.integrity) >= 80 ? 'text-[#22C55E]' : parseFloat(scores.integrity) >= 50 ? 'text-orange-400' : 'text-red-400'}`}>{scores.integrity}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Recent Submissions */}
                                        {candidateDetail?.submissions && candidateDetail.submissions.length > 0 && (
                                            <div className="mb-8">
                                                <h4 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">Recent Submissions</h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {candidateDetail.submissions.slice(0, 5).map((sub, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg border border-slate-700 text-sm">
                                                            <div className="flex-1 mr-3">
                                                                <p className="font-medium text-slate-300 truncate">{sub.challenge_title || 'Challenge'}</p>
                                                                <p className="text-xs text-slate-500">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`font-black text-lg ${parseFloat(sub.overall_score || 0) >= 80 ? 'text-[#22C55E]' : parseFloat(sub.overall_score || 0) >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                                                {parseFloat(sub.overall_score || 0).toFixed(0)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => navigate(`/hr/proctoring/${selectedCandidate.user_id}`)}
                                                className="flex-1 py-3 bg-[#06B6D4] text-[#0F172A] rounded-xl font-bold hover:bg-cyan-400 transition shadow-[0_0_10px_#06B6D4] flex justify-center items-center gap-2"
                                            >
                                                <Video className="w-5 h-5" /> Live Proctoring
                                            </button>
                                            <button
                                                onClick={handleExportToATS}
                                                className="flex-1 flex justify-center items-center py-3 bg-[#1E293B] border border-slate-600 text-slate-300 hover:text-[#22C55E] hover:border-[#22C55E] rounded-xl font-bold transition shadow-sm"
                                            >
                                                <UploadCloud className="w-5 h-5 mr-2" /> Export to ATS
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-20 text-slate-500">
                                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Select a candidate to view their detailed skill and integrity profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
