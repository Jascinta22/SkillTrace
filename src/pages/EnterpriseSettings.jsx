import { useState } from 'react';
import { ArrowLeft, Box, Check, RefreshCw, X, EyeOff, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function EnterpriseSettings() {
    const navigate = useNavigate();
    const [blindMode, setBlindMode] = useState(false);

    // Mock ATS Integrations
    const integrations = [
        { id: 1, name: 'Workday', status: 'connected', desc: 'Sync candidate telemetry scores directly into Workday Recruiter profiles.' },
        { id: 2, name: 'Greenhouse', status: 'connected', desc: 'Auto-trigger SkillTrace assessments when a candidate moves to the "Technical Screen" stage.' },
        { id: 3, name: 'Lever', status: 'disconnected', desc: 'Import candidate lists and export final AI evaluation reports.' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col">
            <Navigation />

            <div className="max-w-5xl mx-auto py-12 px-6 w-full flex-grow">
                {/* Header */}
                <button
                    onClick={() => navigate('/hr/analytics')}
                    className="flex items-center gap-2 mb-8 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition self-start"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to HR Dashboard
                </button>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Enterprise Settings</h1>
                <p className="text-slate-600 text-lg mb-12">Manage your recruitment pipeline, ATS integrations, and hiring policies.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Hiring Policies */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5 text-indigo-500" /> Hiring Policies
                            </h2>

                            {/* Blind Hiring Toggle */}
                            <div className={`p-5 rounded-xl border-2 transition-colors ${blindMode ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                                        <EyeOff className={`w-5 h-5 ${blindMode ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        Blind Hiring Mode
                                    </div>
                                    <button
                                        onClick={() => setBlindMode(!blindMode)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${blindMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${blindMode ? 'translate-x-6' : ''}`}></div>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600">
                                    When enabled, candidate names, photos, and demographic data are obfuscated from the HR dashboard to prevent unconscious bias. Candidates are ranked purely by their <strong>SkillTrace Telemetry</strong>.
                                </p>
                                {blindMode && (
                                    <div className="mt-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded">
                                        Active: 1,420 candidates currently anonymized.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: ATS Integrations */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Box className="w-6 h-6 text-indigo-600" />
                                ATS Integrations
                            </h2>
                            <p className="text-slate-600 mb-8">Connect SkillTrace with your existing Applicant Tracking System to automate workflows.</p>

                            <div className="space-y-4">
                                {integrations.map(int => (
                                    <div key={int.id} className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-300 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shrink-0 ${int.status === 'connected' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {int.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">{int.name}</h3>
                                                <p className="text-sm text-slate-600">{int.desc}</p>
                                            </div>
                                        </div>

                                        <button className={`shrink-0 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition ${int.status === 'connected'
                                                ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600 group'
                                                : 'bg-slate-900 text-white hover:bg-indigo-600'
                                            }`}>
                                            {int.status === 'connected' ? (
                                                <>
                                                    <span className="group-hover:hidden flex items-center gap-1"><Check className="w-4 h-4" /> Connected</span>
                                                    <span className="hidden group-hover:flex items-center gap-1"><X className="w-4 h-4" /> Disconnect</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-4 h-4" /> Connect API
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
