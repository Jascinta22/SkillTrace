import { useState } from 'react';
import ScenarioStage from './ScenarioStage';
import { scenarios } from '../data/scenarios';
import { updateScores } from '../utils/scoring';
import { useAIDetection } from '../hooks/useAIDetection';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function Assessment({ onComplete, currentScores, setCurrentScores }) {
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    // Use AI detection hook, penalize AI collaboration balance when focus is lost
    const { metrics, isWarningActive } = useAIDetection(() => {
        setCurrentScores((prev) => ({
            ...prev,
            aiCollaborationBalance: Math.max(0, prev.aiCollaborationBalance - 25) // Deduct 25 points per warning
        }));
    });

    const handleSelectOption = (option) => {
        // 1. Update scores based on the selected option impact
        const newScores = updateScores(currentScores, option.impact);
        setCurrentScores(newScores);

        // 2. Move to next stage or finish
        if (currentStageIndex < scenarios.length - 1) {
            setCurrentStageIndex((prev) => prev + 1);
        } else {
            onComplete(newScores);
        }
    };

    const progress = ((currentStageIndex) / scenarios.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 relative">

            {/* Focus Warning Overlay */}
            {isWarningActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        <ShieldAlert className="w-6 h-6 mr-3" />
                        Focus lost (Browser moved/Tab switched). Focus points increased!
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="w-full max-w-3xl mb-8">
                <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                    <span>Stage {currentStageIndex + 1} of {scenarios.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Scenario Rendering */}
            {scenarios.map((scenario, index) => (
                <ScenarioStage
                    key={scenario.id}
                    scenario={scenario}
                    isActive={index === currentStageIndex}
                    onSelectOption={handleSelectOption}
                />
            ))}

            {/* Warnings Counter Footer */}
            {metrics.tabSwitches > 0 && (
                <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm flex items-center shadow-md font-bold">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Focus Points (Tab Switches): {metrics.tabSwitches}
                </div>
            )}
        </div>
    );
}
