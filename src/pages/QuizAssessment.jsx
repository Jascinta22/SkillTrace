import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAIDetection } from '../hooks/useAIDetection';
import { CheckCircle, XCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function QuizAssessment() {
    const navigate = useNavigate();
    const location = useLocation();

    // Fallback if accessed directly without state
    const quizQuestions = location.state?.questions || [];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const { metrics, isWarningActive } = useAIDetection((type) => {
        console.log(`Assessment Focus Infraction: ${type}`);
    });

    useEffect(() => {
        if (!quizQuestions || quizQuestions.length === 0) {
            navigate('/skill-selection');
        }
    }, [quizQuestions, navigate]);

    if (!quizQuestions || quizQuestions.length === 0) return null;

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

    const handleSelectOption = (index) => {
        if (!isAnswerSubmitted) {
            setSelectedOption(index);
        }
    };

    const handleSubmitAnswer = () => {
        if (selectedOption !== null && !isAnswerSubmitted) {
            setIsAnswerSubmitted(true);
            if (selectedOption === currentQuestion.correctOption) {
                setScore(score + 10);
            }
        }
    };

    const totalPossiblePoints = quizQuestions.reduce((acc, q) => acc + (q.points || 10), 0);

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            navigate('/results', {
                state: {
                    metrics,
                    challengeId: 'Skill Assessment Quiz',
                    codeQuality: {
                        qualityScore: Math.min(100, Math.round((score / totalPossiblePoints) * 100)),
                        timeComplexity: 'N/A',
                        spaceComplexity: 'N/A'
                    }
                }
            });
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswerSubmitted(false);
        }
    };

    const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navigation />

            {/* Focus Warning Overlay */}
            {isWarningActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        <ShieldAlert className="w-6 h-6 mr-3" />
                        Focus lost (Browser moved/Tab switched). Focus points increased!
                    </div>
                </div>
            )}

            <main className="flex-grow flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-3xl">

                    {/* Header Details */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900">Skill Assessment</h1>
                            <p className="text-slate-500 mt-1">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
                        </div>
                        <div className="text-right flex space-x-4">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-indigo-600 border border-slate-200">
                                Score: {score}
                            </div>
                            <div className={`bg-white px-4 py-2 rounded-lg text-sm shadow-sm font-bold border border-slate-200 ${metrics.tabSwitches > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                Focus Points: {metrics.tabSwitches}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-8">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8">{currentQuestion.text}</h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option, index) => {
                                let optionClasses = "w-full p-4 rounded-xl text-left font-medium transition-all border-2 flex justify-between items-center ";

                                if (!isAnswerSubmitted) {
                                    optionClasses += selectedOption === index
                                        ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700";
                                } else {
                                    if (index === currentQuestion.correctOption) {
                                        optionClasses += "border-green-500 bg-green-50 text-green-900";
                                    } else if (index === selectedOption) {
                                        optionClasses += "border-red-500 bg-red-50 text-red-900";
                                    } else {
                                        optionClasses += "border-slate-200 bg-slate-50 opacity-60 text-slate-500";
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectOption(index)}
                                        disabled={isAnswerSubmitted}
                                        className={optionClasses}
                                    >
                                        <span>{option}</span>
                                        {isAnswerSubmitted && index === currentQuestion.correctOption && (
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        )}
                                        {isAnswerSubmitted && index === selectedOption && index !== currentQuestion.correctOption && (
                                            <XCircle className="w-6 h-6 text-red-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-end">
                            {!isAnswerSubmitted ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedOption === null}
                                    className={`px-8 py-3 rounded-lg font-bold transition-all ${selectedOption !== null
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
                                >
                                    {isLastQuestion ? 'View Results' : 'Next Question'}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
