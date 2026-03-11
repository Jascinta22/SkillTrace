import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Video, ShieldAlert, Cpu, Activity, AlertCircle, Maximize, Eye, Loader2, User, Code, Clock, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function LiveProctoring() {
    const navigate = useNavigate();
    const { id: candidateId } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [flags, setFlags] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(0);
    const [activityLog, setActivityLog] = useState([
        "simuwork@proctor:~/$ Initializing secure proctoring session...",
        "[SYS] Connecting to candidate environment..."
    ]);
    const videoRef = useRef(null);
    const [webcamError, setWebcamError] = useState(null);

    // Fetch candidate data and flags
    useEffect(() => {
        const fetchCandidateData = async () => {
            const token = localStorage.getItem('skilltrace_token');
            try {
                const res = await axios.get(`/api/cheat-detection/hr/candidate/${candidateId}/flags`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCandidate(res.data.candidate);
                setFlags(res.data.flags);
                setSubmissions(res.data.submissions);
                setActivityLog(prev => [
                    ...prev,
                    `[SYS] Connected. Monitoring candidate: ${res.data.candidate?.name || candidateId}`,
                    `[SYS] Found ${res.data.totalFlags} integrity flag(s) in history.`,
                    `[SYS] Found ${res.data.submissions.length} submission(s).`,
                    "Environment Ready. Live monitoring active..."
                ]);
            } catch (err) {
                console.error('Error fetching candidate proctoring data:', err);
                setActivityLog(prev => [...prev, `[ERROR] Failed to connect: ${err.message}`]);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateData();
    }, [candidateId]);

    // Poll for new flags every 5 seconds (simulates real-time)
    useEffect(() => {
        const interval = setInterval(async () => {
            const token = localStorage.getItem('skilltrace_token');
            try {
                const res = await axios.get(`/api/cheat-detection/hr/candidate/${candidateId}/flags`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const newFlags = res.data.flags;
                if (newFlags.length > flags.length) {
                    const diff = newFlags.length - flags.length;
                    setActivityLog(prev => [
                        ...prev,
                        `[WARNING] ${diff} new integrity infraction(s) detected!`
                    ]);
                }
                setFlags(newFlags);
                setSubmissions(res.data.submissions);
            } catch (err) {
                // Silent fail on polling
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [candidateId, flags.length]);

    // Initialize Webcam (HR's own webcam for reference)
    useEffect(() => {
        let stream = null;
        const startWebcam = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setWebcamError("Webcam access denied or unavailable.");
            }
        };
        startWebcam();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    // Session timer
    useEffect(() => {
        const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Derive telemetry summary from flags
    const telemetry = {
        tabSwitches: flags.filter(f => f.flag_type === 'tab_switch' || (f.details && JSON.stringify(f.details).includes('tab_switch'))).length,
        pasteEvents: flags.filter(f => f.flag_type === 'paste' || f.flag_type === 'copy_paste').length,
        totalFlags: flags.length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-green-500 font-mono">Connecting to candidate environment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono relative overflow-hidden flex flex-col">

            {/* FULLSCREEN BACKGROUND: Real Activity Log */}
            <div className="absolute inset-0 z-0 p-6 overflow-hidden opacity-40 pt-24 pointer-events-none">
                {activityLog.map((log, index) => (
                    <div key={index} className={`mb-2 text-sm md:text-base ${log.includes('[WARNING]') ? 'text-red-500 font-bold bg-red-500/10 inline-block px-2' : log.includes('[ERROR]') ? 'text-red-400' : 'text-green-500'}`}>
                        <span className="opacity-50 min-w-[100px] inline-block">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                        {log}
                    </div>
                ))}
                <div className="w-3 h-5 bg-green-500 inline-block animate-pulse mt-2"></div>
            </div>

            {/* OVERLAY: Glassmorphism Control Panel */}
            <div className="relative z-10 flex flex-col min-h-screen p-6 pointer-events-none">

                {/* Top Navigation Bar */}
                <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl pointer-events-auto">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/hr/analytics')}
                            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-3">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                                LIVE PROCTORING: {candidate?.name || 'Unknown'}
                            </h1>
                            <p className="text-sm text-cyan-400 flex items-center gap-2">
                                <Cpu className="w-4 h-4" /> Monitoring {candidate?.email || candidateId}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg border border-slate-600">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-white font-bold tracking-widest">{formatTime(timer)}</span>
                        </div>
                        <button
                            onClick={() => navigate('/hr/analytics')}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded-lg font-bold transition"
                        >
                            End Session
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex flex-1 gap-6 mt-6 pointer-events-none">

                    {/* Left: Submissions & Activity Feed */}
                    <div className="pointer-events-auto flex-1 flex flex-col gap-6">

                        {/* Recent Submissions */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Challenge Submissions
                                </span>
                                <span className="text-xs text-cyan-400 font-mono">{submissions.length} total</span>
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                                {submissions.length === 0 ? (
                                    <p className="text-slate-500 text-sm italic">No submissions yet. Waiting for candidate activity...</p>
                                ) : (
                                    submissions.map((sub, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                                            <div>
                                                <p className="text-sm text-white font-medium">{sub.challenge_title || 'Challenge'}</p>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {new Date(sub.submitted_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className={`text-lg font-black ${parseFloat(sub.overall_score || 0) >= 80 ? 'text-green-400' : parseFloat(sub.overall_score || 0) >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                                                {parseFloat(sub.overall_score || 0).toFixed(0)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Real-time Activity Feed */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex-1">
                            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Maximize className="w-4 h-4" /> Integrity Flags Timeline
                                </span>
                                <span className={`text-xs font-mono ${flags.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {flags.length} flag(s)
                                </span>
                            </div>
                            <div className="p-4 max-h-64 overflow-y-auto space-y-2 font-mono text-sm">
                                {flags.length === 0 ? (
                                    <p className="text-slate-500 italic text-sans">No integrity flags recorded. Candidate appears clean.</p>
                                ) : (
                                    flags.map((flag, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${flag.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' : flag.severity === 'high' ? 'border-orange-500/50 bg-orange-500/10' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold text-xs uppercase ${flag.severity === 'critical' ? 'text-red-400' : flag.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'}`}>
                                                    {flag.flag_type?.replace(/_/g, ' ')} — {flag.severity}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(flag.flagged_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Widgets */}
                    <div className="flex flex-col gap-6 pointer-events-auto w-80">

                        {/* Webcam View */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Video className="w-4 h-4 text-blue-400" /> Proctor Cam
                                </span>
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            </div>
                            <div className="aspect-video bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                {webcamError ? (
                                    <div className="text-red-400 text-xs text-center p-4">
                                        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                        {webcamError}
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent opacity-20 z-10 pointer-events-none"></div>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                                        />
                                    </>
                                )}
                                <div className="absolute bottom-2 right-2 text-[10px] text-white/50 bg-black/50 px-2 py-0.5 rounded z-20">
                                    Live
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Warnings */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border-l-4 border-orange-500 border-t border-r border-b border-slate-700 rounded-r-2xl rounded-l-none shadow-2xl p-5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-orange-400" /> Telemetry Summary
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${telemetry.tabSwitches > 2 ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">Focus Lost</div>
                                            <div className="text-slate-500 text-xs text-sans">Tab Switches</div>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black ${telemetry.tabSwitches > 2 ? 'text-red-500' : 'text-slate-300'}`}>
                                        {telemetry.tabSwitches}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${telemetry.pasteEvents > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-800 text-slate-400'}`}>
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">Paste Events</div>
                                            <div className="text-slate-500 text-xs text-sans">Clipboard</div>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black ${telemetry.pasteEvents > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                                        {telemetry.pasteEvents}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${telemetry.totalFlags > 3 ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">Total Flags</div>
                                            <div className="text-slate-500 text-xs text-sans">All infractions</div>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black ${telemetry.totalFlags > 3 ? 'text-red-500' : 'text-slate-300'}`}>
                                        {telemetry.totalFlags}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Info Card */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-5">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" /> Candidate Profile
                            </h2>
                            <div className="space-y-2">
                                <p className="text-white font-bold text-lg">{candidate?.name || 'Unknown'}</p>
                                <p className="text-cyan-400 text-xs font-mono">{candidate?.email || 'N/A'}</p>
                                <p className="text-slate-500 text-xs">ID: {candidate?.id || candidateId}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
