import { useState } from 'react';
import { ArrowLeft, Wand2, Sparkles, CheckCircle2, Plus, Trash2, Code, BookOpen, MessageSquare, Bug, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ChallengeBuilder() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [createdChallenge, setCreatedChallenge] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'coding',
        difficulty: 'medium',
        questions: [{ question_text: '', code_snippet: '', expected_answer: '', points: 10 }]
    });

    const challengeTypes = [
        { value: 'coding', label: 'Coding', icon: Code, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
        { value: 'debugging', label: 'Debugging', icon: Bug, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
        { value: 'communication', label: 'Communication', icon: MessageSquare, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
        { value: 'decision_making', label: 'Decision Making', icon: BookOpen, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
    ];

    const addQuestion = () => {
        setForm(prev => ({
            ...prev,
            questions: [...prev.questions, { question_text: '', code_snippet: '', expected_answer: '', points: 10 }]
        }));
    };

    const removeQuestion = (idx) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx)
        }));
    };

    const updateQuestion = (idx, field, value) => {
        setForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === idx ? { ...q, [field]: value } : q)
        }));
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            setError('Title and description are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const token = localStorage.getItem('skilltrace_token');
        try {
            const res = await axios.post('/api/challenges', {
                ...form,
                questions: form.questions.filter(q => q.question_text.trim())
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatedChallenge(res.data.challenge);
            setIsComplete(true);
        } catch (err) {
            console.error('Error creating challenge:', err);
            setError(err.response?.data?.error || 'Failed to create challenge. Make sure you are logged in as HR.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsComplete(false);
        setCreatedChallenge(null);
        setForm({
            title: '', description: '', type: 'coding', difficulty: 'medium',
            questions: [{ question_text: '', code_snippet: '', expected_answer: '', points: 10 }]
        });
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] flex flex-col">
            <div className="max-w-4xl mx-auto py-10 px-6 w-full flex-grow flex flex-col">
                <button
                    onClick={() => navigate('/hr/analytics')}
                    className="flex items-center gap-2 mb-8 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition self-start"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to HR Dashboard
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-3 flex items-center justify-center gap-3">
                        <Wand2 className="w-10 h-10 text-cyan-400" />
                        Challenge Builder
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Create real coding, debugging, or communication challenges. They will appear in the Marketplace for candidates immediately.
                    </p>
                </div>

                {isComplete ? (
                    <div className="bg-[#1E293B] rounded-2xl p-10 border border-green-500/30 flex flex-col items-center text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Challenge Published!</h2>
                        <p className="text-slate-400 mb-6">Your challenge is now live in the Marketplace.</p>

                        <div className="bg-[#0F172A] border border-slate-700 rounded-xl p-6 w-full text-left mb-8">
                            <h3 className="font-bold text-lg text-white mb-1">{createdChallenge?.title}</h3>
                            <div className="flex gap-2 mb-3">
                                <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase">{createdChallenge?.type}</span>
                                <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase">{createdChallenge?.difficulty}</span>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">{createdChallenge?.description}</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={resetForm} className="px-6 py-3 font-semibold text-slate-400 hover:bg-slate-800 rounded-xl transition border border-slate-700">
                                Create Another
                            </button>
                            <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-cyan-500 text-[#0F172A] font-bold rounded-xl hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                View in Marketplace
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#1E293B] rounded-2xl p-8 border border-slate-700 shadow-xl space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Challenge Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Optimize Database Query Performance"
                                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the challenge scenario, requirements, and expected deliverables..."
                                rows={4}
                                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 placeholder-slate-600 resize-none"
                            />
                        </div>

                        {/* Type & Difficulty */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {challengeTypes.map(ct => (
                                        <button
                                            key={ct.value}
                                            onClick={() => setForm(prev => ({ ...prev, type: ct.value }))}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${form.type === ct.value ? ct.color + ' border-current' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                        >
                                            <ct.icon className="w-4 h-4" /> {ct.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Difficulty</label>
                                <div className="flex gap-2">
                                    {['easy', 'medium', 'hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setForm(prev => ({ ...prev, difficulty: d }))}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold uppercase transition border ${form.difficulty === d
                                                ? d === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                    : d === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Questions */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Questions</label>
                                <button onClick={addQuestion} className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition">
                                    <Plus className="w-4 h-4" /> Add Question
                                </button>
                            </div>
                            <div className="space-y-4">
                                {form.questions.map((q, idx) => (
                                    <div key={idx} className="bg-[#0F172A] border border-slate-700 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Question {idx + 1}</span>
                                            {form.questions.length > 1 && (
                                                <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-300 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={q.question_text}
                                            onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                                            placeholder="Question text..."
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                                        />
                                        <textarea
                                            value={q.code_snippet}
                                            onChange={e => updateQuestion(idx, 'code_snippet', e.target.value)}
                                            placeholder="Code snippet (optional)..."
                                            rows={2}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 placeholder-slate-600 resize-none"
                                        />
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={q.expected_answer}
                                                onChange={e => updateQuestion(idx, 'expected_answer', e.target.value)}
                                                placeholder="Expected answer..."
                                                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                                            />
                                            <input
                                                type="number"
                                                value={q.points}
                                                onChange={e => updateQuestion(idx, 'points', parseInt(e.target.value) || 0)}
                                                className="w-20 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                            ) : (
                                <><Sparkles className="w-5 h-5" /> Publish to Marketplace</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
