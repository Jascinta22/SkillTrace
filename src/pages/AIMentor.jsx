import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Lightbulb, HelpCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getSocraticMentorResponse } from '../services/geminiService';

export default function AIMentor() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            sender: 'AI Mentor',
            text: 'Hello! I\'m your AI Mentor. I\'m here to help you learn by asking guiding questions, not just giving you answers. This helps you develop deeper understanding and problem-solving skills. What would you like to learn about today?',
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            sender: 'You',
            text: input,
            isUser: true,
            timestamp: new Date()
        };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsLoading(true);

        // Call Gemini AI
        try {
            const aiResponse = await getSocraticMentorResponse(input, messages);

            const mentorMessage = {
                sender: 'AI Mentor',
                text: aiResponse,
                isUser: false,
                timestamp: new Date(),
                isHint: true
            };
            setMessages(prev => [...prev, mentorMessage]);
        } catch (error) {
            console.error("Failed to get mentor response:", error);
            setMessages(prev => [...prev, {
                sender: 'AI Mentor',
                text: "I'm having trouble connecting right now. Please try your question again.",
                isUser: false,
                timestamp: new Date(),
                isHint: false
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        'How do I approach learning Python?',
        'I\'m stuck on a coding problem',
        'Explain data structures',
        'How do I debug my code?',
        'What\'s the best way to learn algorithms?',
        'I don\'t understand recursion'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
            <Navigation />
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">AI Mentor Chat</h1>
                            <p className="text-sm text-slate-600">Learn by questioning, not memorizing</p>
                        </div>
                    </div>
                    <Link
                        to="/skill-selection"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                    >
                        Back to Skills
                    </Link>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col max-w-4xl w-full mx-auto px-6 py-8 overflow-hidden">
                {/* Messages */}
                <div className="flex-grow overflow-y-auto space-y-6 mb-6">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Lightbulb className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Learning Today</h2>
                                <p className="text-slate-600">Ask me anything about your learning journey!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${msg.isUser
                                        ? 'bg-indigo-600 text-white rounded-3xl rounded-tr-lg'
                                        : 'bg-white text-slate-900 rounded-3xl rounded-tl-lg shadow-lg border border-slate-200'
                                    } px-6 py-4`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.isHint && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-current border-opacity-20">
                                            <Lightbulb className={`w-4 h-4 ${msg.isUser ? 'text-white' : 'text-amber-600'}`} />
                                            <span className={`text-sm ${msg.isUser ? 'text-blue-100' : 'text-slate-600'}`}>
                                                Guiding questions to deepen your understanding
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-slate-900 rounded-3xl rounded-tl-lg shadow-lg p-4">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested Questions */}
                {messages.length === 1 && (
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-slate-600 mb-3">Try asking me about:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {suggestedQuestions.map((question, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInput(question);
                                        setTimeout(() => {
                                            document.querySelector('textarea')?.focus();
                                        }, 0);
                                    }}
                                    className="text-left px-4 py-3 bg-white rounded-lg border border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 text-sm text-slate-700 transition"
                                >
                                    <div className="flex items-start gap-2">
                                        <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                        {question}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="flex gap-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Ask me a question... (Shift + Enter for new line)"
                        className="flex-grow px-6 py-4 bg-white border border-slate-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows="2"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className={`px-6 py-4 rounded-full font-medium transition flex items-center justify-center ${input.trim() && !isLoading
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Footer Tips */}
            <div className="bg-indigo-50 border-t border-indigo-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <p className="text-sm text-indigo-900">
                        💡 <strong>Pro Tip:</strong> The AI Mentor uses a Socratic method - asking questions to help you discover solutions yourself rather than giving direct answers. This builds deeper understanding!
                    </p>
                </div>
            </div>
        </div>
    );
}
