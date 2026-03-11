import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Code, MessageSquare, User, Shield, BarChart } from 'lucide-react';

export default function Navigation() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/skill-selection', label: 'Skills', icon: BookOpen },
        { path: '/marketplace', label: 'Challenges', icon: Code },
        { path: '/ai-mentor', label: 'AI Mentor', icon: MessageSquare },
        { path: '/user-dashboard', label: 'Dashboard', icon: User },
        { path: '/security', label: 'Security', icon: Shield }
    ];

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-indigo-600">
                        SkillTrace
                    </Link>
                    <div className="flex items-center gap-6">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${isActive
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
