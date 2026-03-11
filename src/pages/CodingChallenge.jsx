import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Send, MessageSquare, ShieldAlert } from 'lucide-react';
import Editor from '@monaco-editor/react';
import Navigation from '../components/Navigation';
import { useAIDetection } from '../hooks/useAIDetection';
import { getSocraticMentorResponse } from '../services/geminiService';

export default function CodingChallenge() {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('# Write your solution here\n');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { sender: 'AI Mentor', text: 'Hello! I\'m here to help you with this coding challenge. What would you like to know?', isUser: false }
    ]);

    const { metrics, isWarningActive } = useAIDetection((type) => {
        console.log(`Focus/Integrity infraction: ${type}`);
    });

    const challenge = {
        id: challengeId,
        title: 'Two Sum Problem',
        description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to the target.',
        difficulty: 'Easy',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'nums[0] + nums[1] == 9, so we return [0, 1]'
            }
        ],
        constraints: [
            '2 <= nums.length <= 104',
            '-109 <= nums[i] <= 109',
            '-109 <= target <= 109'
        ]
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        // Simulate code execution
        setTimeout(() => {
            setOutput('✓ Test case 1 passed\n✓ Test case 2 passed\n✓ Test case 3 passed\nAll tests passed! Score: 100/100');
            setIsRunning(false);
        }, 2000);
    };

    const handleSubmitCode = () => {
        navigate('/results', { state: { challengeId, score: 100, language: 'Python' } });
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || isChatLoading) return;

        const userMsg = { sender: 'You', text: chatMessage, isUser: true };
        setChatHistory(prev => [...prev, userMsg]);
        setChatMessage('');
        setIsChatLoading(true);

        try {
            // Append problem context silently to the prompt sent to Gemini
            const contextPrompt = `Context: The user is working on a coding problem called "${challenge.title}". Description: "${challenge.description}".\n\nUser Question: ${chatMessage}`;
            const aiResponse = await getSocraticMentorResponse(contextPrompt, chatHistory);

            setChatHistory(prev => [...prev, {
                sender: 'AI Mentor',
                text: aiResponse,
                isUser: false
            }]);
        } catch (error) {
            console.error(error);
            setChatHistory(prev => [...prev, {
                sender: 'AI Mentor',
                text: "I'm having trouble connecting to my logic centers. Please try again.",
                isUser: false
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col relative">
            <Navigation />

            {/* Anti-Cheating Visual Warning */}
            {isWarningActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        <ShieldAlert className="w-6 h-6 mr-3" />
                        Focus lost (Browser moved/Tab switched). Focus points increased!
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
                        <p className="text-slate-400">{challenge.difficulty} • Coding Challenge</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right text-sm border-r border-slate-700 pr-4">
                        <span className="text-slate-400 font-medium">Integrity Telemetry</span>
                        <div className="flex space-x-4 font-mono">
                            <span className={metrics.tabSwitches > 0 ? 'text-red-400' : 'text-[#22C55E]'}>Focus: {metrics.tabSwitches}</span>
                            <span className={metrics.pasteEvents > 0 ? 'text-orange-400' : 'text-[#22C55E]'}>Pastes: {metrics.pasteEvents}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition"
                        >
                            <Play className="w-4 h-4" />
                            {isRunning ? 'Running...' : 'Run Code'}
                        </button>
                        <button
                            onClick={handleSubmitCode}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                        >
                            Submit Solution
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-grow flex gap-4 p-4 overflow-hidden">
                {/* Left Panel - Problem Description */}
                <div className="w-1/3 bg-slate-800 rounded-lg p-6 overflow-y-auto border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4">Problem Description</h2>
                    <p className="text-slate-300 mb-6">{challenge.description}</p>

                    <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
                    {challenge.examples.map((ex, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                            <p className="text-sm text-slate-400 mb-2"><strong>Input:</strong> {ex.input}</p>
                            <p className="text-sm text-slate-400 mb-2"><strong>Output:</strong> {ex.output}</p>
                            <p className="text-sm text-slate-500"><strong>Explanation:</strong> {ex.explanation}</p>
                        </div>
                    ))}

                    <h3 className="text-lg font-semibold text-white mb-3 mt-6">Constraints</h3>
                    <ul className="space-y-2">
                        {challenge.constraints.map((constraint, idx) => (
                            <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                {constraint}
                            </li>
                        ))}
                    </ul>

                    {/* AI Mentor Button */}
                    <button className="w-full mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Ask AI Mentor
                    </button>
                </div>

                {/* Middle Panel - Code Editor */}
                <div className="w-1/3 flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-slate-300 font-mono text-sm">solution.py</span>
                        <select className="bg-slate-700 text-slate-300 text-sm rounded px-2 py-1 border border-slate-600">
                            <option>Python</option>
                            <option>JavaScript</option>
                            <option>Java</option>
                            <option>C++</option>
                        </select>
                    </div>
                    <Editor
                        height="calc(100% - 40px)"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false
                        }}
                    />
                </div>

                {/* Right Panel - Output & Chat */}
                <div className="w-1/3 flex flex-col gap-4">
                    {/* Output Terminal */}
                    <div className="flex-1 bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-3">Output</h3>
                        <div className="flex-grow bg-slate-900 rounded p-3 overflow-y-auto border border-slate-700 font-mono text-sm text-slate-300">
                            {output || <span className="text-slate-500">Run your code to see output...</span>}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="flex-1 bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-3">AI Mentor Chat</h3>
                        <div className="flex-grow space-y-3 overflow-y-auto mb-3">
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${msg.isUser
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-200'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-700 text-slate-200 rounded-lg p-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Ask AI Mentor..."
                                className="flex-grow bg-slate-700 border border-slate-600 text-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
