import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Activity, Bot, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

export default function VoiceInterview() {
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({ tone: "Professional", clarity: "High" });
    const [transcript, setTranscript] = useState([
        { speaker: 'AI', text: "Hello! I'm your AI Soft Skills Evaluator. Today we'll discuss the Team Conflict scenario. Are you ready to begin?" }
    ]);
    const [audioLevel, setAudioLevel] = useState(0);

    const recognitionRef = useRef(null);

    // Initialize Web Speech API
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                processUserSpeech(text);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setError(`Speech recognition error: ${event.error}`);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        } else {
            setError("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
        }
    }, []);

    const processUserSpeech = async (text) => {
        setTranscript(prev => [...prev, { speaker: 'User', text }]);
        setIsAnalyzing(true);

        try {
            // Prepare history for Gemini (alternating User/Model)
            const history = transcript.map(m => ({
                role: m.speaker === 'User' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const response = await axios.post('/api/ai/voice-chat', {
                message: text,
                history: history.slice(-6) // Send last 3 rounds of conversation
            });

            const { text: aiText, metrics: aiMetrics } = response.data;

            setTranscript(prev => [...prev, { speaker: 'AI', text: aiText }]);
            setMetrics(aiMetrics);
        } catch (err) {
            console.error("AI API Error:", err);
            setError("Failed to get response from AI. Check your connection.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Simulate microphone audio visualizer
    useEffect(() => {
        let interval;
        if (isRecording || isAnalyzing) {
            interval = setInterval(() => {
                setAudioLevel(Math.random() * 100);
            }, 100);
        } else {
            setAudioLevel(0);
        }
        return () => clearInterval(interval);
    }, [isRecording, isAnalyzing]);

    const handleMicToggle = () => {
        if (!recognitionRef.current) return;

        if (!isRecording) {
            setError(null);
            setIsRecording(true);
            recognitionRef.current.start();
        } else {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden text-slate-200">
            <Navigation />

            {/* Background glowing effects */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 transition-all duration-1000 ${isRecording ? 'bg-cyan-500' : isAnalyzing ? 'bg-purple-500' : 'bg-indigo-600'}`}></div>

            <div className="max-w-6xl mx-auto py-12 px-6 w-full flex-grow flex flex-col relative z-10">

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-bounce">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Exit Assessment
                    </button>
                    <div className="flex gap-4">
                        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 px-4 py-2 rounded-lg text-sm font-bold text-slate-300 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" /> Live Sentiment Tracking
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-grow items-center">

                    {/* Left Column: Visualizer & Avatar */}
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl relative h-[600px]">

                        <h2 className="absolute top-8 text-2xl font-black text-white tracking-widest text-center uppercase">
                            SkillTrace AI
                            <span className="block text-sm font-medium text-indigo-400 mt-1 lowercase tracking-normal">Real-time Soft Skills Evaluation</span>
                        </h2>

                        {/* Central Avatar/Visualizer */}
                        <div className="relative w-64 h-64 flex items-center justify-center mt-12">
                            {/* Animated sound waves */}
                            {[1, 2, 3].map((wave) => (
                                <div
                                    key={wave}
                                    className={`absolute inset-0 rounded-full border-2 transition-transform duration-300 ease-out`}
                                    style={{
                                        borderColor: isRecording ? '#06b6d4' : isAnalyzing ? '#a855f7' : '#4f46e5',
                                        opacity: (isRecording || isAnalyzing) ? 1 - (wave * 0.25) : 0.1,
                                        transform: `scale(${1 + ((audioLevel / 100) * wave * 0.5)})`
                                    }}
                                ></div>
                            ))}

                            {/* Inner Orb */}
                            <div className={`w-40 h-40 rounded-full flex items-center justify-center z-10 shadow-2xl transition-colors duration-500 ${isRecording ? 'bg-cyan-500 shadow-cyan-500/50' : isAnalyzing ? 'bg-purple-500 shadow-purple-500/50' : 'bg-indigo-600 shadow-indigo-600/50'}`}>
                                {isAnalyzing ? <Activity className="w-16 h-16 text-white animate-pulse" /> : <Bot className="w-16 h-16 text-white" />}
                            </div>
                        </div>

                        {/* Status Text */}
                        <div className="mt-12 text-center h-8">
                            {isRecording ? (
                                <span className="text-cyan-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2 justify-center">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div> Listening...
                                </span>
                            ) : isAnalyzing ? (
                                <span className="text-purple-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2 justify-center">
                                    <Activity className="w-4 h-4" /> Gemini is thinking...
                                </span>
                            ) : (
                                <span className="text-slate-400 font-bold uppercase tracking-widest">
                                    AI is waiting for your response
                                </span>
                            )}
                        </div>

                        {/* Mic Button */}
                        <button
                            onClick={handleMicToggle}
                            disabled={isAnalyzing}
                            className={`mt-8 w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 z-20 ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                                : isAnalyzing
                                    ? 'bg-slate-700 cursor-not-allowed opacity-50'
                                    : 'bg-white hover:bg-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-slate-900 font-bold'
                                }`}
                        >
                            {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className={`w-8 h-8 ${isAnalyzing ? 'text-slate-400' : 'text-slate-900'}`} />}
                        </button>
                        <div className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {isRecording ? "Tap to Stop" : "Tap to Speak"}
                        </div>
                    </div>

                    {/* Right Column: Live Transcript */}
                    <div className="flex flex-col h-[600px] bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-3xl shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" /> Live Transcript
                            </h3>
                            <div className="flex gap-2">
                                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-500/30">Tone: {metrics.tone}</span>
                                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-500/30">Clarity: {metrics.clarity}</span>
                            </div>
                        </div>

                        <div className="flex-grow p-6 overflow-y-auto space-y-6 flex flex-col justify-start pb-12 scroll-smooth">
                            {transcript.map((msg, idx) => (
                                <div key={idx} className={`flex items-start gap-4 ${msg.speaker === 'User' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.speaker === 'User' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'}`}>
                                        {msg.speaker === 'User' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl max-w-[80%] shadow-lg ${msg.speaker === 'User'
                                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none'
                                        : 'bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-tl-none'
                                        }`}>
                                        <p className="leading-relaxed text-[15px]">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isAnalyzing && (
                                <div className="flex items-start gap-4 animate-fade-in-up">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-tl-none flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
