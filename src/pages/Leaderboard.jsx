import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, TrendingUp, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Leaderboard() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCandidates = async () => {
            const token = localStorage.getItem('skilltrace_token');
            try {
                const res = await axios.get('/api/analytics/hr/candidates', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Sort by aggregated_skill_index descending
                const sorted = (res.data || []).sort((a, b) => {
                    const aScore = parseFloat(a.aggregated_skill_index) || 0;
                    const bScore = parseFloat(b.aggregated_skill_index) || 0;
                    return bScore - aScore;
                });
                setCandidates(sorted);
            } catch (err) {
                setError('Failed to load leaderboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</span>;
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return 'border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]';
        if (rank === 2) return 'border-slate-400/30 bg-slate-400/5';
        if (rank === 3) return 'border-amber-600/30 bg-amber-600/5';
        return 'border-slate-700';
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] flex flex-col">
            <div className="max-w-4xl mx-auto py-10 px-6 w-full flex-grow">
                <button
                    onClick={() => navigate('/hr/analytics')}
                    className="flex items-center gap-2 mb-8 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to HR Dashboard
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-3 flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-400" />
                        Candidate Leaderboard
                    </h1>
                    <p className="text-slate-400 text-lg">Real-time ranking of all candidates by Skill Index score.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" /> {error}
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">No candidates yet. Rankings will appear as candidates complete challenges.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {candidates.map((c, idx) => {
                            const rank = idx + 1;
                            const skillScore = parseFloat(c.aggregated_skill_index) || 0;
                            const integrity = parseFloat(c.average_integrity) || 0;
                            return (
                                <div
                                    key={c.user_id}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition hover:bg-slate-800/50 cursor-pointer ${getRankStyle(rank)}`}
                                    onClick={() => navigate('/hr/analytics')}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        {getRankIcon(rank)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold truncate ${rank <= 3 ? 'text-lg' : 'text-base'}`}>{c.name}</p>
                                        <p className="text-sm text-slate-500 truncate">{c.email}</p>
                                    </div>

                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Skill</p>
                                            <p className={`text-xl font-black ${skillScore >= 80 ? 'text-green-400' : skillScore >= 50 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                {skillScore.toFixed(1)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Integrity</p>
                                            <div className="flex items-center gap-1">
                                                <Shield className={`w-4 h-4 ${integrity >= 80 ? 'text-green-400' : integrity >= 50 ? 'text-yellow-400' : 'text-red-400'}`} />
                                                <p className={`text-xl font-black ${integrity >= 80 ? 'text-green-400' : integrity >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {integrity.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-8 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-slate-600" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
