import { useState, useEffect, useRef } from 'react';
import { Users, Briefcase, Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        <path d="M1 1h22v22H1z" fill="none" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { loginWithEmail, signup, loginWithGoogle, user: authUser } = useAuth();
    const googleButtonRef = useRef(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [userData, setUserData] = useState(null);
    const [selectedRole, setSelectedRole] = useState('candidate'); // 'candidate' or 'hr'

    useEffect(() => {
        /* global google */
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });

            google.accounts.id.renderButton(googleButtonRef.current, {
                theme: 'filled_blue',
                size: 'large',
                width: '100%',
                text: 'continue_with',
                shape: 'rectangular'
            });
        }
    }, [isSignup]); // Re-render button if we switch between Login/Signup

    const handleGoogleResponse = async (response) => {
        setLoading(true);
        setError('');
        try {
            const user = await loginWithGoogle(response.credential);
            setUserData(user);
            setLoading(false);

            // Redirect based on role (default is candidate for Google users in our backend)
            if (user.role === 'hr') {
                navigate('/hr/analytics');
            } else {
                navigate('/user-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
            setLoading(false);
        }
    };


    // MFA state
    const [isMfaStep, setIsMfaStep] = useState(false);
    const [mfaToken, setMfaToken] = useState(['', '', '', '', '', '']);
    const [mfaError, setMfaError] = useState('');

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Signup state
    const [fullName, setFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }


        try {
            const user = await loginWithEmail(email, password, selectedRole);
            setUserData(user);
            setLoading(false);
            setIsMfaStep(true); // Trigger MFA
        } catch (err) {
            console.error(err);
            setError(err.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!fullName || !signupEmail || !signupPassword || !confirmPassword) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (fullName.length < 2) {
            setError('Full name must be at least 2 characters');
            setLoading(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        if (signupPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (signupPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }


        try {
            const user = await signup(signupEmail, signupPassword, selectedRole, fullName);
            setUserData(user);
            setIsLoggedIn(true);
            setLoading(false);

            // Redirect immediately after signup since there's no MFA for mockup signup
            if (selectedRole === 'hr') {
                navigate('/hr/analytics');
            } else {
                navigate('/user-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Signup failed. Please try again.');
            setLoading(false);
        }
    };



    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsMfaStep(false);
        setUserData(null);
        setEmail('');
        setPassword('');
        setFullName('');
        setSignupEmail('');
        setSignupPassword('');
        setConfirmPassword('');
        setMfaToken(['', '', '', '', '', '']);
    };

    const handleMfaSubmit = (e) => {
        e.preventDefault();
        const token = mfaToken.join('');
        if (token.length !== 6) {
            setMfaError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setMfaError('');

        // Simulate checking the MFA token via speakeasy
        setTimeout(() => {
            if (token === '000000') { // Mock fail case
                setMfaError('Invalid verification code');
                setLoading(false);
            } else {
                setIsMfaStep(false);
                setIsLoggedIn(true);
                setLoading(false);

                // Redirect based on role
                const finalRole = selectedRole.toLowerCase();
                if (finalRole === 'hr') {
                    navigate('/hr/analytics');
                } else {
                    navigate('/user-dashboard');
                }
            }
        }, 1200);
    };

    const handleMfaChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newArr = [...mfaToken];
        newArr[index] = value;
        setMfaToken(newArr);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`mfa-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleMfaKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !mfaToken[index] && index > 0) {
            const prevInput = document.getElementById(`mfa-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const BackblurElements = () => (
        <>
            <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        </>
    );

    // Helper component for Role Toggle tabs
    const RoleToggle = () => (
        <div className="flex bg-[#0A0F1C] p-1 rounded-xl mb-8 border border-slate-700/50">
            <button
                type="button"
                onClick={() => setSelectedRole('candidate')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedRole === 'candidate' ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <User className="w-4 h-4" /> Candidate
            </button>
            <button
                type="button"
                onClick={() => setSelectedRole('hr')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${selectedRole === 'hr' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Building2 className="w-4 h-4" /> Enterprise / HR
            </button>
        </div>
    );

    if (isMfaStep) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
                <BackblurElements />
                <div className="w-full max-w-md z-10 animate-fade-in-up">
                    <div className="bg-[#131C31]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <Lock className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
                            <p className="text-slate-400 text-sm">Enter the 6-digit code from your authenticator app to complete sign in.</p>
                        </div>

                        <form onSubmit={handleMfaSubmit} className="space-y-6">
                            <div className="flex justify-between gap-2">
                                {mfaToken.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`mfa-${i}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleMfaChange(i, e.target.value)}
                                        onKeyDown={(e) => handleMfaKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-xl font-bold bg-[#0A0F1C] border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                                    />
                                ))}
                            </div>

                            {mfaError && (
                                <p className="text-sm text-red-400 font-medium text-center bg-red-500/10 p-2 rounded-lg">{mfaError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsMfaStep(false)}
                                className="w-full py-2 text-slate-400 hover:text-white text-sm transition font-medium"
                            >
                                Cancel & return to login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoggedIn && !isSignup) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
                <BackblurElements />
                <div className="w-full max-w-md z-10 animate-fade-in-up">
                    <div className="bg-[#131C31]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500"></div>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:scale-105 transition-transform duration-300">
                                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-3 tracking-tight">SkillTrace</h1>
                            <p className="text-slate-400 font-medium tracking-wide">Verify your skills, elevate your career.</p>
                        </div>

                        <RoleToggle />

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-12 pr-4 py-3 bg-[#0A0F1C] border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2 flex justify-between">
                                    Password
                                    <a href="#" className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors">Forgot password?</a>
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 bg-[#0A0F1C] border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder-slate-600 shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-slate-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-400 text-sm font-bold">!</span>
                                    </div>
                                    <p className="text-sm text-red-400 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1" /></>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-slate-700"></div>
                            <span className="px-4 text-sm text-slate-500">or continue with</span>
                            <div className="flex-1 border-t border-slate-700"></div>
                        </div>

                        {/* Google Button */}
                        <div ref={googleButtonRef} className="w-full flex justify-center py-2"></div>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-slate-400 mt-8">
                            Don't have an account?{' '}
                            <button
                                onClick={() => {
                                    setIsSignup(true);
                                    setError('');
                                    setEmail('');
                                    setPassword('');
                                }}
                                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors ml-1"
                            >
                                Create an account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Signup Form
    if (!isLoggedIn && isSignup) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
                <BackblurElements />
                <div className="w-full max-w-md z-10 animate-fade-in-up my-8">
                    <div className="bg-[#131C31]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400"></div>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-extrabold text-[#F1F5F9] mb-2 tracking-tight">Create Account</h1>
                            <p className="text-slate-400 font-medium">Join SkillTrace and prove your expertise.</p>
                        </div>

                        <RoleToggle />

                        <form onSubmit={handleSignup} className="space-y-5">
                            {/* Full Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full pl-12 pr-4 py-3 bg-[#0A0F1C] border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-12 pr-4 py-3 bg-[#0A0F1C] border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type={showSignupPassword ? "text" : "password"}
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 bg-[#0A0F1C] border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600 shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                                        className="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400 transition-colors"
                                    >
                                        {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 bg-[#0A0F1C] border border-slate-700 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600 shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-400 text-sm font-bold">!</span>
                                    </div>
                                    <p className="text-sm text-red-400 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Signup Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    <>Sign Up <ArrowRight className="w-4 h-4 ml-1" /></>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-slate-700"></div>
                            <span className="px-4 text-sm text-slate-500">or continue with</span>
                            <div className="flex-1 border-t border-slate-700"></div>
                        </div>

                        {/* Google Button */}
                        <div ref={googleButtonRef} className="w-full flex justify-center py-2"></div>

                        {/* Sign In Link */}
                        <p className="text-center text-sm text-slate-400 mt-8">
                            Already have an account?{' '}
                            <button
                                onClick={() => {
                                    setIsSignup(false);
                                    setError('');
                                    setFullName('');
                                    setSignupEmail('');
                                    setSignupPassword('');
                                    setConfirmPassword('');
                                }}
                                className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null; // Will be redirected via useNavigate before reaching here
}
