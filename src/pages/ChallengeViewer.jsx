import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { useAIDetection } from '../hooks/useAIDetection';
import { ShieldAlert, Play, ArrowRight, Save, ArrowLeft, ChevronRight, CheckCircle2, Terminal } from 'lucide-react';

export default function ChallengeViewer() {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your solution here\n');
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'Teammate', text: 'This PR looks terrible, we need to rewrite the entire module.', isUser: false }
    ]);
    const [consoleOutput, setConsoleOutput] = useState([]);

    // Hook for AI Detection (Blur/Visibility/Paste)
    const { metrics, isWarningActive } = useAIDetection((type) => {
        console.log(`Infraction registered: ${type}`);
        // Send telemetry to backend for HR proctoring
        const token = localStorage.getItem('skilltrace_token');
        if (token) {
            axios.post('/api/cheat-detection/log-event', {
                challengeId,
                eventType: type === 'tabSwitch' ? 'tab_switch' : 'paste',
                details: { timestamp: new Date().toISOString() }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.error('Telemetry log error:', err));
        }
    });

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const token = localStorage.getItem('skilltrace_token');
                const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChallenge(response.data);
            } catch (err) {
                console.error('Error fetching challenge:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenge();
    }, [challengeId]);

    if (loading) {
        return <div className="p-10 text-center text-slate-300">Loading challenge...</div>;
    }

    if (!challenge) {
        return <div className="p-10 text-center text-[#F1F5F9]">Challenge not found.</div>;
    }

    const handleRunCode = () => {
        setConsoleOutput([{ type: 'system', text: 'Executing code...' }]);

        const originalLog = console.log;
        const logs = [];

        console.log = (...args) => {
            logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
        };

        try {
            // Wrap in an IIFE to allow top-level returns and prevent scope pollution
            // eslint-disable-next-line no-eval
            const result = eval(`(() => { ${code} })()`);
            if (result !== undefined) {
                logs.push({ type: 'log', text: typeof result === 'object' ? JSON.stringify(result) : String(result) });
            }
            setConsoleOutput(prev => [...prev, ...logs, { type: 'success', text: 'Execution finished successfully.' }]);
        } catch (err) {
            setConsoleOutput(prev => [...prev, ...logs, { type: 'error', text: `Error: ${err.message}` }]);
        } finally {
            console.log = originalLog;
        }
    };

    const handleSubmit = () => {
        let codeQuality = null;
        if (challenge.type === 'coding' || challenge.type === 'debugging') {
            const complexities = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'];
            const timeComplexity = complexities[Math.floor(Math.random() * complexities.length)];
            const spaceComplexity = complexities[Math.floor(Math.random() * 3)];
            let qualityScore = 100;
            if (timeComplexity === 'O(n^2)') qualityScore -= 30;
            if (timeComplexity === 'O(n log n)') qualityScore -= 10;
            if (spaceComplexity === 'O(n)') qualityScore -= 10;

            codeQuality = {
                timeComplexity,
                spaceComplexity,
                qualityScore: Math.max(0, qualityScore)
            };
        }

        navigate('/results', { state: { metrics, challengeId: challenge.id, codeQuality } });
    };

    const renderCodingInterface = () => (
        <div className="flex-grow flex flex-col mt-6 border border-slate-700 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="bg-[#1E293B] text-slate-300 px-4 py-2 text-sm font-mono flex justify-between items-center border-b border-slate-800">
                <span>solution.js</span>
                <button
                    onClick={handleRunCode}
                    className="text-[#22C55E] hover:text-green-400 flex items-center font-bold text-xs bg-slate-800/50 px-2 py-1 rounded border border-slate-700 hover:border-green-500/50 transition-all"
                >
                    <Play className="w-4 h-4 mr-1" /> Run Code
                </button>
            </div>
            <Editor
                height="400px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on'
                }}
            />
            {/* Terminal / Output Console */}
            <div className="bg-[#0F172A] border-t border-slate-700 flex flex-col h-[200px]">
                <div className="bg-[#1E293B] px-4 py-1.5 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Output Console</span>
                    </div>
                    <button
                        onClick={() => setConsoleOutput([])}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        CLEAR
                    </button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto font-mono text-sm space-y-1">
                    {consoleOutput.length === 0 && (
                        <p className="text-slate-600 italic">Click "Run Code" to see output here...</p>
                    )}
                    {consoleOutput.map((log, idx) => (
                        <div key={idx} className={`leading-relaxed ${log.type === 'error' ? 'text-red-400' :
                            log.type === 'success' ? 'text-green-400' :
                                log.type === 'system' ? 'text-cyan-400' :
                                    'text-slate-300'
                            }`}>
                            {log.type === 'system' && <span className="mr-2">»</span>}
                            {log.type === 'error' && <span className="mr-2">✖</span>}
                            {log.type === 'success' && <span className="mr-2">✔</span>}
                            {log.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCommunicationInterface = () => (
        <div className="flex-grow flex flex-col mt-6 border border-slate-700 bg-[#1E293B] rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)] max-w-2xl mx-auto w-full">
            <div className="bg-[#0F172A] border-b border-slate-700 px-6 py-4 font-bold text-[#F1F5F9]">Team Chat - Pull Request #42</div>
            <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.isUser ? 'bg-[#06B6D4] text-[#0F172A] rounded-br-none font-medium shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-[#0F172A] text-slate-300 border border-slate-700 rounded-bl-none'}`}>
                            <div className="text-xs font-bold mb-1 opacity-70">{msg.sender}</div>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-700 flex items-center bg-[#0F172A] rounded-b-xl">
                <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-grow bg-[#1E293B] border border-slate-600 text-[#F1F5F9] rounded-lg px-4 py-2 focus:outline-none focus:border-[#06B6D4] placeholder-slate-500"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatMessage.trim()) {
                            setChatHistory([...chatHistory, { sender: 'You', text: chatMessage, isUser: true }]);
                            setChatMessage('');
                        }
                    }}
                />
                <button
                    className="ml-3 bg-[#06B6D4] text-[#0F172A] p-2 rounded-lg hover:bg-cyan-400 transition shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    onClick={() => {
                        if (chatMessage.trim()) {
                            setChatHistory([...chatHistory, { sender: 'You', text: chatMessage, isUser: true }]);
                            setChatMessage('');
                        }
                    }}
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col relative">

            {/* Anti-Cheating Visual Warning */}
            {isWarningActive && (
                <div className="fixed top-4 right-4 z-50 animate-bounce">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center font-bold">
                        <ShieldAlert className="w-6 h-6 mr-3" />
                        Focus lost (Browser moved/Tab switched). Focus points increased!
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-[#1E293B] border-b border-slate-700 px-8 py-5 flex justify-between items-center shadow-lg z-10 block">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-[#F1F5F9] hover:bg-slate-700 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#F1F5F9]">{challenge.title}</h1>
                        <p className="text-[#06B6D4] font-medium">{challenge.company_name || 'Premium Partner'} • <span className="text-slate-400">{challenge.type.toUpperCase()}</span></p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex flex-col text-right text-sm">
                        <span className="text-slate-400 font-medium border-b border-slate-700 pb-1">Integrity Telemetry</span>
                        <div className="flex space-x-4 pt-1 font-mono">
                            <span className={metrics.tabSwitches > 0 ? 'text-red-400' : 'text-[#22C55E]'}>Focus: {metrics.tabSwitches}</span>
                            <span className={metrics.pasteEvents > 0 ? 'text-orange-400' : 'text-[#22C55E]'}>Pastes: {metrics.pasteEvents}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center bg-[#22C55E] text-[#0F172A] px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition transform hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Submit Solution
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col md:flex-row p-6 gap-6 max-w-[1600px] mx-auto w-full">
                {/* Assessment Description */}
                <div className="w-full md:w-1/3 flex flex-col bg-[#1E293B] rounded-2xl shadow-xl border border-slate-700 p-8">
                    <h2 className="text-xl font-bold text-[#F1F5F9] mb-4 border-b border-slate-700 pb-4">Challenge Brief</h2>
                    <div className="prose prose-slate prose-invert">
                        <p className="text-slate-300 leading-relaxed text-lg">{challenge.description}</p>
                    </div>

                    <h3 className="uppercase tracking-wider text-xs font-bold text-[#06B6D4] mt-8 mb-3">Evaluated Skills</h3>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {(challenge.skills || []).map((s, i) => (
                            <span key={i} className="bg-[#0F172A] text-[#22C55E] px-3 py-1 rounded-full text-sm font-semibold border border-slate-700">
                                {s}
                            </span>
                        ))}
                    </div>

                    <h3 className="uppercase tracking-wider text-xs font-bold text-[#06B6D4] mb-4">Technical Questions</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[400px]">
                        {(challenge.questions || []).map((q, i) => (
                            <div key={i} className="bg-[#0F172A] p-4 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-[#F1F5F9]">Q{i + 1}: {q.question_text || q.text}</p>
                                    <span className="text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                        SOLVE <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 italic font-mono">Points: {q.points || 10}</p>
                                    <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Incomplete</span>
                                </div>
                            </div>
                        ))}
                        {(!challenge.questions || challenge.questions.length === 0) && (
                            <p className="text-xs text-slate-500 italic">No specific questions for this challenge.</p>
                        )}
                    </div>
                </div>

                {/* Assessment Interface Wrapper */}
                <div className="w-full md:w-2/3 flex flex-col">
                    {(challenge.type === 'coding' || challenge.type === 'debugging') && renderCodingInterface()}
                    {challenge.type === 'communication' && renderCommunicationInterface()}
                </div>
            </main>
        </div>
    );
}
