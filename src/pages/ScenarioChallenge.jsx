import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, CheckCircle, ShieldAlert } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAIDetection } from '../hooks/useAIDetection';
import { getSocraticMentorResponse } from '../services/geminiService';

export default function ScenarioChallenge() {
    const { scenarioId } = useParams();
    const navigate = useNavigate();
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const { metrics, isWarningActive } = useAIDetection((type) => {
        console.log(`Focus/Integrity infraction: ${type}`);
    });

    const scenario = {
        id: scenarioId,
        title: 'Team Conflict Resolution',
        type: 'communication',
        description: `You're a software engineer in a meeting where two team members are having a heated discussion about the technical approach for an upcoming feature. 

Team Member A insists on using Microservices architecture, while Team Member B wants to stick with the monolith. The discussion is becoming tense, and other team members are uncomfortable. 

Your manager looks to you for input. How do you handle this situation?`,
        skill_category: 'Communication Skills',
        difficulty: 'Intermediate',
        options: [
            {
                id: 1,
                text: 'Ask both team members to step back and explain their concerns calmly',
                isCorrect: true,
                explanation: 'This is the best approach. By asking both parties to explain their positions, you create a structured discussion that allows you to understand their perspectives and find common ground.'
            },
            {
                id: 2,
                text: 'Side with one team member to end the discussion quickly',
                isCorrect: false,
                explanation: 'This would create resentment and doesn\'t address the underlying concerns of either party. A good leader should listen to both sides.'
            },
            {
                id: 3,
                text: 'Ignore the conflict and focus on your own work',
                isCorrect: false,
                explanation: 'Ignoring team conflicts can harm team dynamics and productivity. As a team member, you should help foster healthy communication.'
            },
            {
                id: 4,
                text: 'Make a decision based on which person is more senior',
                isCorrect: false,
                explanation: 'Decisions should be based on technical merit and business needs, not seniority. This approach discounts valuable input from junior team members.'
            }
        ]
    };

    const handleSelectAnswer = (optionId) => {
        if (!submitted) {
            setSelectedAnswer(optionId);
        }
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        const selected = scenario.options.find(o => o.id === selectedAnswer);
        setSubmitted(true);
        setFeedback(selected.explanation);

        // Add mentor feedback
        setTimeout(() => {
            setChatHistory([{
                sender: 'AI Mentor',
                text: 'Great choice! Let\'s discuss why this is the best approach and how you can handle similar situations in the future.',
                isUser: false
            }]);
        }, 300);
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || isChatLoading) return;

        const userMsg = { sender: 'You', text: chatMessage, isUser: true };
        setChatHistory(prev => [...prev, userMsg]);
        setChatMessage('');
        setIsChatLoading(true);

        try {
            const selectedOption = scenario.options.find(o => o.id === selectedAnswer);
            const contextPrompt = `Context: The user evaluated a behavioral scenario: "${scenario.title}". 
Description: "${scenario.description}". 
The user chose: "${selectedOption?.text}". 
Was their choice correct? ${selectedOption?.isCorrect ? 'Yes' : 'No'}. 

User Question: ${chatMessage}`;

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6 relative">
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

            <div className="max-w-5xl mx-auto mt-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">{scenario.title}</h1>
                        <p className="text-lg text-slate-600 mt-2">{scenario.skill_category} • {scenario.type.charAt(0).toUpperCase() + scenario.type.slice(1)}</p>
                    </div>

                    <div className="ml-auto flex flex-col text-right text-sm bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Integrity Telemetry</span>
                        <div className="flex space-x-4 font-mono font-bold mt-1 text-base">
                            <span className={metrics.tabSwitches > 0 ? 'text-red-500' : 'text-green-600'}>Focus Points: {metrics.tabSwitches}</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Scenario Description */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Scenario</h2>
                            <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">{scenario.description}</p>
                        </div>

                        {/* Answer Options */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">What would you do?</h2>
                            <div className="space-y-4">
                                {scenario.options.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelectAnswer(option.id)}
                                        disabled={submitted}
                                        className={`w-full p-6 rounded-xl text-left transition-all border-2 ${selectedAnswer === option.id
                                            ? submitted
                                                ? option.isCorrect
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-red-500 bg-red-50'
                                                : 'border-indigo-600 bg-indigo-50'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${selectedAnswer === option.id
                                                ? submitted
                                                    ? option.isCorrect
                                                        ? 'border-green-500 bg-green-500'
                                                        : 'border-red-500 bg-red-500'
                                                    : 'border-indigo-600 bg-indigo-600'
                                                : 'border-slate-300'
                                                }`}>
                                                {selectedAnswer === option.id && submitted && option.isCorrect && (
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-lg font-semibold ${selectedAnswer === option.id
                                                    ? submitted
                                                        ? option.isCorrect
                                                            ? 'text-green-700'
                                                            : 'text-red-700'
                                                        : 'text-indigo-700'
                                                    : 'text-slate-900'
                                                    }`}>
                                                    {option.text}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {!submitted && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswer === null}
                                    className={`w-full mt-6 px-6 py-3 rounded-lg font-semibold transition ${selectedAnswer !== null
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    Submit Answer
                                </button>
                            )}

                            {submitted && feedback && (
                                <div className={`mt-6 p-6 rounded-xl border-2 ${scenario.options.find(o => o.id === selectedAnswer)?.isCorrect
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-orange-300 bg-orange-50'
                                    }`}>
                                    <h3 className={`font-bold text-lg mb-2 ${scenario.options.find(o => o.id === selectedAnswer)?.isCorrect
                                        ? 'text-green-700'
                                        : 'text-orange-700'
                                        }`}>
                                        {scenario.options.find(o => o.id === selectedAnswer)?.isCorrect ? '✓ Excellent!' : 'Let\'s learn more:'}
                                    </h3>
                                    <p className="text-slate-700">{feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - AI Mentor Chat */}
                    {submitted && (
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-slate-200 flex flex-col h-fit">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                                AI Mentor
                            </h3>

                            <div className="flex-grow space-y-3 mb-4 max-h-96 overflow-y-auto">
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${msg.isUser
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 text-slate-800 rounded-lg p-3">
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
                                    className="flex-grow bg-slate-100 border border-slate-300 text-slate-900 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
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
                    )}
                </div>
            </div>
        </div>
    );
}
