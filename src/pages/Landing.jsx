import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#06B6D4] rounded-full filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-[#22C55E] rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="z-10 text-center max-w-4xl flex flex-col items-center animate-fade-in-up">
                <div className="mb-8 p-4 bg-[#1E293B] rounded-2xl shadow-[0_0_15px_rgba(34,197,94,0.3)] inline-block border border-slate-700">
                    <BrainCircuit className="w-20 h-20 text-[#22C55E]" strokeWidth={1.5} />
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-[#F1F5F9] mb-6 drop-shadow-sm">
                    Skill<span className="text-[#06B6D4]">Trace</span>
                </h1>
                <h2 className="text-2xl md:text-4xl text-slate-300 font-bold mb-6">
                    Real Skill Assessment Platform
                </h2>
                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                    The platform where HR, companies, and educators post real-world challenges. Candidates solve them in a monitored environment to demonstrate true skills beyond AI-generated answers.
                </p>

                <Link
                    to="/login"
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#0F172A] transition-all duration-200 bg-[#22C55E] rounded-xl hover:bg-[#16a34a] hover:scale-105 shadow-[0_0_15px_#22C55E]"
                >
                    <span className="mr-2 text-lg">Enter Platform</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
