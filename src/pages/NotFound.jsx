import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navigation />
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-9xl font-black text-indigo-100 mb-4">404</h1>
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Page Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                    <Home className="w-5 h-5" /> Back to Home
                </Link>
            </div>
        </div>
    );
}
