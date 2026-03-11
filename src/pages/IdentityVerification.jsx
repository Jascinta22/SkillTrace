import { useState, useEffect } from 'react';
import { ArrowLeft, ScanFace, CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function IdentityVerification() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Face, 2: ID, 3: Success
    const [scanProgress, setScanProgress] = useState(0);

    // Simulate scanning progress
    useEffect(() => {
        if (step === 1 || step === 2) {
            setScanProgress(0);
            const interval = setInterval(() => {
                setScanProgress(prev => {
                    const next = prev + 5;
                    if (next >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep(step + 1), 500);
                        return 100;
                    }
                    return next;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [step]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            <Navigation />

            {/* Background design */}
            <div className="absolute top-0 w-full h-64 bg-slate-900 overflow-hidden z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGwtMiAydjRsMi0yem0wLTRWMjZsLTIgMnY0bDItMnpNMzYgMjJ2LTRsLTIgMnY0bDItMnpNMzYgMTB2LTRsLTIgMnY0bDItMnpNMzYgNEwyNCAxNHY0bDEyLTEweiIgZmlsbD0iI2ZmZmZmZiIvPjwvZz48L3N2Zz4=')]"></div>
            </div>

            <div className="max-w-4xl mx-auto py-12 px-6 w-full flex-grow flex flex-col relative z-10">

                <button
                    onClick={() => navigate('/skill-selection')}
                    className="flex items-center gap-2 mb-8 px-4 py-2 text-slate-300 hover:text-white rounded-lg transition self-start"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                    {/* Left Panel: Steps */}
                    <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-200">
                        <div className="flex items-center gap-2 text-indigo-600 mb-8 font-bold tracking-wider uppercase text-sm">
                            <ShieldCheck className="w-6 h-6" /> Enterprise Security
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verify Identity</h2>
                        <p className="text-slate-500 text-sm mb-10">High-stakes assessments require multi-factor identity verification before proceeding.</p>

                        <div className="relative">
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                            <div className={`flex items-start gap-4 relative mb-10 ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-slate-50 ${step > 1 ? 'border-green-500 text-green-500' : 'border-indigo-600 text-indigo-600'}`}>
                                    {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : 1}
                                </div>
                                <div className="-mt-1">
                                    <h4 className={`font-bold ${step > 1 ? 'text-green-700' : 'text-slate-900'}`}>Facial Recognition</h4>
                                    <p className="text-xs text-slate-500">Mapping 128 micro-landmarks</p>
                                </div>
                            </div>

                            <div className={`flex items-start gap-4 relative mb-10 ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-slate-50 ${step > 2 ? 'border-green-500 text-green-500' : step === 2 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300 text-slate-500'}`}>
                                    {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : 2}
                                </div>
                                <div className="-mt-1">
                                    <h4 className={`font-bold ${step > 2 ? 'text-green-700' : step === 2 ? 'text-slate-900' : 'text-slate-500'}`}>ID Card Scan</h4>
                                    <p className="text-xs text-slate-500">Government issued ID matching</p>
                                </div>
                            </div>

                            <div className={`flex items-start gap-4 relative ${step === 3 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-slate-50 ${step === 3 ? 'border-green-500 text-green-500' : 'border-slate-300 text-slate-500'}`}>
                                    {step === 3 ? <CheckCircle2 className="w-5 h-5" /> : 3}
                                </div>
                                <div className="-mt-1">
                                    <h4 className={`font-bold ${step === 3 ? 'text-green-700' : 'text-slate-500'}`}>Secure Assessment</h4>
                                    <p className="text-xs text-slate-500">Workspace unlocked</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Active Scanner */}
                    <div className="w-full md:w-2/3 p-8 flex flex-col items-center justify-center bg-slate-900 relative">

                        {step === 1 && (
                            <div className="text-center w-full max-w-sm animate-fade-in-up">
                                <h3 className="text-xl font-bold text-white mb-6">Scanning Facial Landmarks...</h3>
                                <div className="relative w-64 h-64 mx-auto mb-8 rounded-full overflow-hidden border-4 border-slate-700 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                        <ScanFace className="w-32 h-32 text-indigo-400 opacity-50" />
                                    </div>
                                    {/* Scanning laser line */}
                                    <div
                                        className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] transition-all duration-75 ease-linear"
                                        style={{ top: `${scanProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-cyan-400" /> Keep your face within the frame
                                </p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center w-full max-w-sm animate-fade-in-up">
                                <h3 className="text-xl font-bold text-white mb-6">Scanning Government ID...</h3>
                                <div className="relative w-72 h-44 mx-auto mb-8 rounded-xl overflow-hidden border-2 border-dashed border-indigo-500 bg-slate-800 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                                    <CreditCard className="w-16 h-16 text-slate-500 opacity-50" />

                                    {/* Scanning overlay */}
                                    <div
                                        className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transition-all duration-75 ease-linear blur-md"
                                        style={{ left: `${(scanProgress * 1.5) - 50}%` }}
                                    ></div>
                                </div>
                                <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-cyan-400" /> Align ID card with the guidelines
                                </p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center w-full max-w-sm animate-fade-in-up">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Identity Verified</h3>
                                <p className="text-green-400 text-sm mb-8 font-bold uppercase tracking-wider">
                                    Match Confidence: 99.8%
                                </p>
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                >
                                    Unlock Assessment Workspace
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
