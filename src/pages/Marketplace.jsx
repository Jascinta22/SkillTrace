import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Code2, Bug, MessageSquare, ArrowLeft, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAIDetection } from '../hooks/useAIDetection';

export default function Marketplace() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [allChallenges, setAllChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const { metrics, isWarningActive } = useAIDetection((type) => {
        console.log(`Focus/Integrity infraction in Marketplace: ${type}`);
    });

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const token = localStorage.getItem('skilltrace_token');
                const response = await axios.get('http://localhost:5000/api/challenges', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllChallenges(response.data);
            } catch (err) {
                console.error('Error fetching challenges:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    const filteredChallenges = allChallenges.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIcon = (type) => {
        switch (type) {
            case 'coding': return <Code2 className="w-6 h-6 text-blue-500" />;
            case 'debugging': return <Bug className="w-6 h-6 text-red-500" />;
            case 'communication': return <MessageSquare className="w-6 h-6 text-green-500" />;
            default: return <Code2 className="w-6 h-6 text-slate-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Navigation />

            {/* Anti-Cheating Visual Warning */}
            {isWarningActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center font-bold shadow-lg">
                        <ShieldAlert className="w-6 h-6 mr-3" />
                        Focus lost (Browser moved/Tab switched). Focus points increased!
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto py-12 px-6">
                {/* Header Area */}
                <div className="flex justify-between items-start mb-8">
                    <button
                        onClick={() => navigate('/skill-selection')}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Skills
                    </button>

                    <div className="flex flex-col text-right text-sm bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Integrity Telemetry</span>
                        <div className="flex space-x-4 font-mono font-bold mt-1 text-base">
                            <span className={metrics.tabSwitches > 0 ? 'text-red-500' : 'text-green-600'}>Focus Points: {metrics.tabSwitches}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Challenge Marketplace</h1>
                        <p className="text-slate-600 text-lg">Browse real-world scenarios posted by top companies.</p>
                    </div>

                    <div className="flex mt-6 md:mt-0 space-x-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search challenges..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-3 bg-white border-2 border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-500 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Promo Banners for New Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fade-in-up">
                    <div className="bg-gradient-to-tr from-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-300" /> Soft Skills Evaluation</h3>
                            <p className="text-indigo-200 text-sm">Experience our new Generative Voice AI Interview.</p>
                        </div>
                        <button onClick={() => navigate('/voice-interview')} className="px-4 py-2 bg-white text-indigo-900 font-bold rounded-lg shadow hover:bg-indigo-50 transition">
                            Start Demo
                        </button>
                    </div>

                    <div className="bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center border border-slate-700">
                        <div>
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-cyan-400" /> High-Stakes Environment</h3>
                            <p className="text-slate-400 text-sm">Try the Enterprise Identity Verification gate.</p>
                        </div>
                        <button onClick={() => navigate('/identity-verification')} className="px-4 py-2 bg-cyan-500 text-slate-900 font-bold rounded-lg shadow hover:bg-cyan-400 transition">
                            Verify ID
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {filteredChallenges.map((challenge) => (
                        <div key={challenge.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-50 rounded-xl inline-block">
                                    {getIcon(challenge.type)}
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                  ${challenge.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                                        challenge.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                            'bg-green-100 text-green-700'}`}
                                >
                                    {challenge.difficulty}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-1">{challenge.title}</h3>
                            <p className="text-sm font-semibold text-indigo-600 mb-3">{challenge.company_name || 'Premium Partner'}</p>

                            <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">
                                {challenge.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(challenge.skills || []).map((skill, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <Link
                                to={`/solve/${challenge.id}`}
                                className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-indigo-200 text-center flex items-center justify-center gap-2 group"
                            >
                                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                                Solve Challenge
                            </Link>
                        </div>
                    ))}
                </div>

                {filteredChallenges.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-xl text-slate-500 font-medium">No challenges found matching your criteria.</p>
                        <p className="text-sm text-slate-400 mt-2">Check your connection or ensure the database is seeded.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
