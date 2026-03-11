import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, AlertTriangle, Loader2, CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RiskReports() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [allFlags, setAllFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedCandidate, setExpandedCandidate] = useState(null);
    const [candidateFlags, setCandidateFlags] = useState({});
    const [severityFilter, setSeverityFilter] = useState('all');
    const [loadingFlags, setLoadingFlags] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            const token = localStorage.getItem('skilltrace_token');
            try {
                const res = await axios.get('/api/analytics/hr/candidates', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCandidates(res.data || []);
            } catch (err) {
                setError('Failed to load risk data.');
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const fetchFlagsForCandidate = async (userId) => {
        if (candidateFlags[userId]) {
            setExpandedCandidate(expandedCandidate === userId ? null : userId);
            return;
        }

        setLoadingFlags(userId);
        setExpandedCandidate(userId);
        const token = localStorage.getItem('skilltrace_token');
        try {
            const res = await axios.get(`/api/cheat-detection/hr/candidate/${userId}/flags`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidateFlags(prev => ({ ...prev, [userId]: res.data.flags }));
        } catch (err) {
            setCandidateFlags(prev => ({ ...prev, [userId]: [] }));
        } finally {
            setLoadingFlags(null);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getRiskLevel = (integrity) => {
        const val = parseFloat(integrity) || 0;
        if (val >= 80) return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-500/10' };
        if (val >= 50) return { label: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
        return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10' };
    };

    // Sort candidates: lowest integrity first (highest risk at top)
    const sortedCandidates = [...candidates].sort((a, b) => {
        const aIntegrity = parseFloat(a.average_integrity) || 0;
        const bIntegrity = parseFloat(b.average_integrity) || 0;
        return aIntegrity - bIntegrity;
    });

    return (
        <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] flex flex-col">
            <div className="max-w-5xl mx-auto py-10 px-6 w-full flex-grow">
                <button
                    onClick={() => navigate('/hr/analytics')}
                    className="flex items-center gap-2 mb-8 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to HR Dashboard
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-3 flex items-center justify-center gap-3">
                        <ShieldAlert className="w-10 h-10 text-red-400" />
                        Risk Reports
                    </h1>
                    <p className="text-slate-400 text-lg">Review integrity flags and suspicious behavior across all candidates.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 text-center">
                        <p className="text-3xl font-black text-white">{candidates.length}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">Total Candidates</p>
                    </div>
                    <div className="bg-[#1E293B] border border-red-500/20 rounded-xl p-5 text-center">
                        <p className="text-3xl font-black text-red-400">
                            {candidates.filter(c => (parseFloat(c.average_integrity) || 0) < 50).length}
                        </p>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">High Risk</p>
                    </div>
                    <div className="bg-[#1E293B] border border-green-500/20 rounded-xl p-5 text-center">
                        <p className="text-3xl font-black text-green-400">
                            {candidates.filter(c => (parseFloat(c.average_integrity) || 0) >= 80).length}
                        </p>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">Clean</p>
                    </div>
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
                        <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">No candidates to review yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedCandidates.map(c => {
                            const integrity = parseFloat(c.average_integrity) || 0;
                            const risk = getRiskLevel(c.average_integrity);
                            const isExpanded = expandedCandidate === c.user_id;
                            const flags = candidateFlags[c.user_id] || [];

                            return (
                                <div key={c.user_id} className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden">
                                    {/* Candidate Row */}
                                    <div
                                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition"
                                        onClick={() => fetchFlagsForCandidate(c.user_id)}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${risk.bg}`}>
                                            {integrity >= 80 ? (
                                                <CheckCircle2 className={`w-5 h-5 ${risk.color}`} />
                                            ) : integrity >= 50 ? (
                                                <AlertTriangle className={`w-5 h-5 ${risk.color}`} />
                                            ) : (
                                                <XCircle className={`w-5 h-5 ${risk.color}`} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{c.name}</p>
                                            <p className="text-sm text-slate-500 truncate">{c.email}</p>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${risk.bg} ${risk.color}`}>
                                                {risk.label}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase">Integrity</p>
                                                <p className={`text-lg font-black ${risk.color}`}>{integrity.toFixed(1)}</p>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-slate-500" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Flags */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-700 p-4 bg-[#0F172A]">
                                            {loadingFlags === c.user_id ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                                </div>
                                            ) : flags.length === 0 ? (
                                                <p className="text-slate-500 text-sm text-center py-4">
                                                    <CheckCircle2 className="w-5 h-5 inline mr-2 text-green-400" />
                                                    No integrity flags recorded. This candidate appears clean.
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {flags.map((flag, idx) => (
                                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityColor(flag.severity)}`}>
                                                            <div className="flex items-center gap-3">
                                                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-bold capitalize">{flag.flag_type?.replace(/_/g, ' ')}</p>
                                                                    <p className="text-xs opacity-60">{new Date(flag.flagged_at).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-bold uppercase">{flag.severity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/hr/proctoring/${c.user_id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-bold hover:bg-cyan-500/20 transition"
                                                >
                                                    <Eye className="w-4 h-4" /> Live Proctoring
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
