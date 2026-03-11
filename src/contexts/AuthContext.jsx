import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Upon refresh, check if we have a token stored
        const loadUserFromStorage = () => {
            const storedUser = localStorage.getItem('skilltrace_user');
            const token = localStorage.getItem('skilltrace_token');

            if (storedUser && token) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser({
                        uid: parsedUser.id,
                        email: parsedUser.email,
                        name: parsedUser.name,
                        role: parsedUser.role,
                        // Mock metrics for the dashboard
                        joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                        skillsLearning: Math.floor(Math.random() * 5),
                        challengesCompleted: Math.floor(Math.random() * 10),
                        skillScore: Math.floor(Math.random() * 100),
                        aiDependencyScore: Math.floor(Math.random() * 100)
                    });
                } catch (e) {
                    console.error("Failed to parse user from local storage.");
                    logout();
                }
            }
            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    const signup = async (email, password, role, name) => {
        try {
            const response = await axios.post(`${API_URL}/register`, { email, password, role, name });
            const data = response.data;
            // Since our backend register doesn't return a token in our current implementation, we need to explicitly login
            return await loginWithEmail(email, password, role);
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Registration failed.');
        }
    };

    const loginWithEmail = async (email, password, role) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            const { token, user: loggedInUser, message } = response.data;

            if (loggedInUser.role !== role) {
                // If the user tries to log in as HR but they are a candidate in the DB, block it.
                // Wait for any UI toast to show error.
                throw new Error(`This user is registered as a ${loggedInUser.role}, not ${role}.`);
            }

            localStorage.setItem('skilltrace_token', token);
            localStorage.setItem('skilltrace_user_role', loggedInUser.role);
            localStorage.setItem('skilltrace_user', JSON.stringify(loggedInUser));

            setUser({
                uid: loggedInUser.id,
                email: loggedInUser.email,
                name: loggedInUser.name,
                role: loggedInUser.role,
                joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                skillsLearning: Math.floor(Math.random() * 5),
                challengesCompleted: Math.floor(Math.random() * 10),
                skillScore: Math.floor(Math.random() * 100),
                aiDependencyScore: Math.floor(Math.random() * 100)
            });

            return loggedInUser;
        } catch (err) {
            throw new Error(err.response?.data?.error || err.message || 'Login failed.');
        }
    };

    const loginWithGoogle = async (idToken) => {
        try {
            const response = await axios.post(`${API_URL}/google`, { idToken });
            const { token, user: loggedInUser } = response.data;

            localStorage.setItem('skilltrace_token', token);
            localStorage.setItem('skilltrace_user_role', loggedInUser.role);
            localStorage.setItem('skilltrace_user', JSON.stringify(loggedInUser));

            setUser({
                uid: loggedInUser.id,
                email: loggedInUser.email,
                name: loggedInUser.name,
                role: loggedInUser.role,
                picture: loggedInUser.picture,
                joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                skillsLearning: Math.floor(Math.random() * 5),
                challengesCompleted: Math.floor(Math.random() * 10),
                skillScore: Math.floor(Math.random() * 100),
                aiDependencyScore: Math.floor(Math.random() * 100)
            });

            return loggedInUser;
        } catch (err) {
            throw new Error(err.response?.data?.error || err.message || 'Google login failed.');
        }
    };

    const logout = () => {
        localStorage.removeItem('skilltrace_token');
        localStorage.removeItem('skilltrace_user_role');
        localStorage.removeItem('skilltrace_user');
        setUser(null);
    };

    const value = {
        user,
        signup,
        loginWithEmail,
        loginWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
