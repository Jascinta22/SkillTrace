import { BrainCircuit } from 'lucide-react';

export default function LandingPage({ onStart }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Abstract Background Design */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="z-10 text-center max-w-3xl flex flex-col items-center">
                <div className="mb-8 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl inline-block border border-white/20">
                    <BrainCircuit className="w-20 h-20 text-indigo-600" strokeWidth={1.5} />
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 drop-shadow-sm">
                    SkillForge
                </h1>
                <h2 className="text-2xl md:text-3xl text-slate-700 font-medium mb-6">
                    Discover Your True Skills.
                </h2>
                <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Step into a realistic simulation that tests your critical thinking, emotional intelligence, and integrity without relying on AI. Uncover your true potential.
                </p>

                <button
                    onClick={onStart}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl hover:bg-indigo-700 hover:scale-105 shadow-xl shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                    role="button"
                >
                    <span className="mr-2">Start Assessment</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>
        </div>
    );
}
