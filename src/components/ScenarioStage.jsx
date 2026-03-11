import { AlertTriangle } from 'lucide-react';

export default function ScenarioStage({ scenario, onSelectOption, isActive }) {
    if (!isActive) return null;

    return (
        <div className="animate-fade-in-up w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8 border-b border-indigo-100">
                    <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 mb-4">{scenario.title}</h2>
                    <p className="text-lg text-slate-700 leading-relaxed font-medium">
                        {scenario.description}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    <p className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full mr-4 inline-block"></span>
                        {scenario.question}
                    </p>

                    <div className="space-y-4">
                        {scenario.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelectOption(option)}
                                className="w-full text-left p-5 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold mr-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-lg text-slate-700 group-hover:text-indigo-900 font-medium">
                                        {option.text}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
