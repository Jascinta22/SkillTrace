import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import { questions } from '../data/mockDb';

export default function SkillSelection() {
    const navigate = useNavigate();
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');

    const skills = [
        {
            id: 1,
            name: 'Python',
            description: 'Master Python programming from basics to advanced concepts',
            icon: '🐍',
            difficulty: 'Beginner',
            learners: 2451
        },
        {
            id: 2,
            name: 'Data Structures',
            description: 'Learn arrays, linked lists, trees, graphs, and more',
            icon: '📊',
            difficulty: 'Intermediate',
            learners: 1893
        },
        {
            id: 3,
            name: 'Web Development',
            description: 'Build responsive websites with HTML, CSS, JavaScript & React',
            icon: '🌐',
            difficulty: 'Intermediate',
            learners: 3214
        },
        {
            id: 4,
            name: 'Machine Learning',
            description: 'Explore AI, neural networks, and predictive models',
            icon: '🤖',
            difficulty: 'Advanced',
            learners: 987
        },
        {
            id: 5,
            name: 'Communication Skills',
            description: 'Develop presentations, writing, and interpersonal abilities',
            icon: '💬',
            difficulty: 'Intermediate',
            learners: 1654
        },
        {
            id: 6,
            name: 'Decision Making',
            description: 'Master analytical thinking and problem-solving strategies',
            icon: '🎯',
            difficulty: 'Advanced',
            learners: 1123
        }
    ];

    const toggleSkill = (skillId) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-700';
            case 'Intermediate': return 'bg-amber-100 text-amber-700';
            case 'Advanced': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleStartLearning = async () => {
        if (selectedSkills.length === 0) return;

        try {
            const skillName = skills.find(s => s.id === selectedSkills[0]).name;
            const token = localStorage.getItem('skilltrace_token');

            const response = await axios.get(`http://localhost:5000/api/challenges/random`, {
                params: { skill: skillName, difficulty: selectedDifficulty },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.length > 0) {
                const formattedQuestions = response.data.map(q => ({
                    id: q.id,
                    text: q.question_text,
                    type: 'text',
                    expectedAnswer: q.expected_answer,
                    points: q.points
                }));

                navigate('/quiz-assessment', { state: { questions: formattedQuestions, skillName, difficulty: selectedDifficulty } });
            } else {
                alert('No questions found for this selection.');
            }
        } catch (err) {
            console.error('Error fetching randomized questions:', err);
            alert('Failed to start assessment. Please ensure the backend is running.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navigation />
            <div className="max-w-6xl mx-auto py-12 px-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-12">
                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">Choose Your Learning Path</h1>
                        <p className="text-lg text-slate-600 mt-2">Select one or more skills to start your personalized learning journey</p>
                    </div>
                </div>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {skills.map(skill => (
                        <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            className={`text-left transition-all transform hover:scale-105 ${selectedSkills.includes(skill.id)
                                ? 'ring-2 ring-indigo-600'
                                : ''
                                }`}
                        >
                            <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 ${selectedSkills.includes(skill.id)
                                ? 'border-indigo-600'
                                : 'border-transparent'
                                }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-5xl">{skill.icon}</span>
                                    {selectedSkills.includes(skill.id) && (
                                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{skill.name}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{skill.description}</p>

                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(skill.difficulty)}`}>
                                        {skill.difficulty}
                                    </span>
                                    <span className="text-xs text-slate-500">{skill.learners.toLocaleString()} learners</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Difficulty Selector */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mt-12 mb-8 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Select Assessment Difficulty</h3>
                    <div className="flex justify-center gap-4">
                        {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${selectedDifficulty === diff
                                    ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mt-12">
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition"
                    >
                        Cancel
                    </Link>
                    <button
                        disabled={selectedSkills.length === 0}
                        onClick={handleStartLearning}
                        className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition ${selectedSkills.length > 0
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Zap className="w-5 h-5" />
                        Start Learning ({selectedSkills.length})
                    </button>
                </div>

                {/* Info Box */}
                <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border-l-4 border-indigo-600">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">How It Works</h3>
                    <ul className="space-y-2 text-slate-700">
                        <li>✓ Each skill has 5 progressive levels (Basics → Boss Challenge)</li>
                        <li>✓ Earn points and badges as you progress</li>
                        <li>✓ Get personalized guidance from AI Mentor</li>
                        <li>✓ Track your learning analytics in real-time</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
