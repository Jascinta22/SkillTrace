import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Star, Zap, Trophy, BarChart3, Share2 } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function LevelProgression() {
    const { skillId } = useParams();
    const navigate = useNavigate();
    const [currentLevel, setCurrentLevel] = useState(1);

    // Mock skill data
    const skillsMap = {
        '1': { name: 'Python', icon: '🐍' },
        '2': { name: 'Data Structures', icon: '📊' },
        '3': { name: 'Web Development', icon: '🌐' },
        '4': { name: 'Machine Learning', icon: '🤖' },
        '5': { name: 'Communication Skills', icon: '💬' },
        '6': { name: 'Decision Making', icon: '🎯' }
    };

    const skill = skillsMap[skillId] || { name: 'Unknown', icon: '❓' };

    const topicLevelsMap = {
        '1': [ // Python
            { id: 1, number: 1, title: 'Python Basics', description: 'Variables, loops, and data types', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
            { id: 2, number: 2, title: 'Python Data Structures', description: 'Lists, dictionaries, and sets', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
            { id: 3, number: 3, title: 'OOP Challenge', description: 'Classes, inheritance, and polymorphism', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 4, number: 4, title: 'Web Scraper Mini Project', description: 'Build a scraper using BeautifulSoup', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 5, number: 5, title: 'Full-Stack Boss Challenge', description: 'Build a Flask API with a database', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
        ],
        '2': [ // Data Structures
            { id: 1, number: 1, title: 'Arrays & Strings', description: 'Basic manipulation and traversal', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
            { id: 2, number: 2, title: 'Linked Lists & Stacks', description: 'Node manipulation and LIFO structures', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
            { id: 3, number: 3, title: 'Trees & Graphs', description: 'BFS, DFS, and hierarchical data', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 4, number: 4, title: 'Search/Sort Visualizer', description: 'Build a project visualizing algorithms', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 5, number: 5, title: 'Competitive Programming Boss', description: 'Master complex algorithmic challenges', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
        ],
        '3': [ // Web Development
            { id: 1, number: 1, title: 'HTML & CSS Basics', description: 'Semantic tags and responsive styling', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
            { id: 2, number: 2, title: 'JavaScript Fundamentals', description: 'DOM manipulation and ES6+', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
            { id: 3, number: 3, title: 'React Challenge', description: 'Components, hooks, and state management', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 4, number: 4, title: 'Portfolio Mini Project', description: 'Build a fully responsive portfolio site', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 5, number: 5, title: 'E-Commerce Boss Challenge', description: 'Full-stack store with shopping cart', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
        ],
        '4': [ // Machine Learning
            { id: 1, number: 1, title: 'Math & Stats Basics', description: 'Probability, calculus, and algebra', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
            { id: 2, number: 2, title: 'Scikit-Learn Practice', description: 'Regression, classification, and clustering', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
            { id: 3, number: 3, title: 'Neural Networks Challenge', description: 'Perceptrons and backpropagation', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 4, number: 4, title: 'Image Classifier Project', description: 'Build a CNN with TensorFlow', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 5, number: 5, title: 'Deep Learning Boss Challenge', description: 'Deploy a custom NLP model', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
        ],
        '5': [ // Communication Skills
            { id: 1, number: 1, title: 'Active Listening Basics', description: 'Techniques for understanding others', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
            { id: 2, number: 2, title: 'Written Communication', description: 'Emails, reports, and documentation', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
            { id: 3, number: 3, title: 'Conflict Resolution', description: 'Navigating difficult conversations', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 4, number: 4, title: 'Presentation Mini Project', description: 'Deliver a technical presentation', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 5, number: 5, title: 'Real-world Boss Challenge', description: 'Handle an executive stakeholder meeting', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
        ],
        '6': [ // Decision Making
            { id: 1, number: 1, title: 'Analytical Thinking', description: 'Breaking down complex problems', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
            { id: 2, number: 2, title: 'Case Study Practice', description: 'Applying frameworks to business cases', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
            { id: 3, number: 3, title: 'Risk Assessment', description: 'Evaluating tradeoffs and probabilities', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 4, number: 4, title: 'Business Strategy Project', description: 'Develop a go-to-market plan', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
            { id: 5, number: 5, title: 'Board Room Boss Challenge', description: 'Make a crisis leadership decision', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
        ]
    };

    // Fallback to generic levels if skillId isn't found
    const fallbackLevels = [
        { id: 1, number: 1, title: 'Basics', description: 'Learn fundamental concepts and syntax', lessons: 8, challenges: 5, difficulty: 'Beginner', progress: 100, status: 'completed' },
        { id: 2, number: 2, title: 'Practice', description: 'Solve real-world problems and exercises', lessons: 10, challenges: 8, difficulty: 'Beginner', progress: 75, status: 'in-progress' },
        { id: 3, number: 3, title: 'Challenge', description: 'Take on intermediate challenges', lessons: 12, challenges: 10, difficulty: 'Intermediate', progress: 0, status: 'locked' },
        { id: 4, number: 4, title: 'Mini Project', description: 'Build a complete small project', lessons: 15, challenges: 7, difficulty: 'Intermediate', progress: 0, status: 'locked' },
        { id: 5, number: 5, title: 'Boss Challenge', description: 'Master the skill with the ultimate challenge', lessons: 5, challenges: 1, difficulty: 'Advanced', progress: 0, status: 'locked' }
    ];

    const levels = topicLevelsMap[skillId] || fallbackLevels;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-300';
            case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'locked': return 'bg-slate-100 text-slate-500 border-slate-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-50 text-green-700';
            case 'Intermediate': return 'bg-amber-50 text-amber-700';
            case 'Advanced': return 'bg-red-50 text-red-700';
            default: return 'bg-slate-50 text-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <Trophy className="w-5 h-5" />;
            case 'in-progress': return <Zap className="w-5 h-5" />;
            case 'locked': return <Lock className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navigation />
            <div className="max-w-4xl mx-auto py-12 px-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <button
                        onClick={() => navigate('/skill-selection')}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">
                            {skill.icon} {skill.name} Learning Path
                        </h1>
                        <p className="text-lg text-slate-600 mt-2">Master this skill by completing all levels</p>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Your Progress</h2>
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                        <div className="bg-indigo-600 h-4 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <p className="text-slate-600 mt-4">2 of 5 levels completed • 40% overall progress</p>
                </div>

                {/* Levels */}
                <div className="space-y-6">
                    {levels.map((level) => (
                        <div
                            key={level.id}
                            className={`rounded-2xl shadow-lg p-8 border-2 transition-all ${getStatusColor(level.status)} ${level.status !== 'locked' ? 'cursor-pointer hover:shadow-xl' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-current">
                                        {getStatusIcon(level.status)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            Level {level.number}: {level.title}
                                        </h3>
                                        <p className="text-sm opacity-75">{level.description}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(level.difficulty)}`}>
                                    {level.difficulty}
                                </span>
                            </div>

                            <div className="flex gap-8 mb-4">
                                <div>
                                    <p className="text-sm opacity-75">Lessons</p>
                                    <p className="text-2xl font-bold">{level.lessons}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-75">Challenges</p>
                                    <p className="text-2xl font-bold">{level.challenges}</p>
                                </div>
                            </div>

                            {level.status !== 'locked' && (
                                <>
                                    <div className="w-full bg-white/30 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-current h-2 rounded-full transition"
                                            style={{ width: `${level.progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm opacity-75 mb-4">{level.progress}% Complete</p>
                                </>
                            )}

                            {level.status === 'locked' && (
                                <p className="text-sm opacity-75">Complete previous levels to unlock</p>
                            )}

                            {level.status !== 'locked' && (
                                <div className="mt-4 flex flex-wrap gap-4 items-center">
                                    <Link
                                        to={`/coding-challenge/${level.id}`}
                                        className="inline-block px-6 py-2 bg-white text-current font-semibold rounded-lg hover:bg-white/80 transition shadow-sm"
                                    >
                                        {level.status === 'completed' ? 'Review' : 'Continue Learning'}
                                    </Link>

                                    {level.number === 5 && level.status === 'completed' && (
                                        <button
                                            onClick={() => alert(`Redirecting to LinkedIn to certify ${skill.name} mastery! \n(Mocks social sharing OAuth flow)`)}
                                            className="inline-flex items-center px-6 py-2 bg-[#0077b5] text-white font-semibold rounded-lg hover:bg-[#005582] transition shadow-md"
                                        >
                                            <Share2 className="w-4 h-4 mr-2" /> Add to Profile
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Help Section */}
                <div className="mt-12 bg-indigo-50 rounded-2xl p-8 border border-indigo-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Stuck? Get Help</h3>
                    <p className="text-slate-700 mb-4">Use the AI Mentor to ask questions and get personalized guidance.</p>
                    <Link
                        to="/ai-mentor"
                        className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                    >
                        Chat with AI Mentor
                    </Link>
                </div>
            </div>
        </div>
    );
}
