import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to protect routes based on user role
 * @param {string} requiredRole - 'hr', 'candidate', or null for all
 */
export function useRoleProtection(requiredRole = null) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('skilltrace_token');
    const userRole = localStorage.getItem('skilltrace_user_role');

    // No token = redirect to login
    if (!token) {
      navigate('/login');
      return;
    }

    // Role mismatch = redirect to appropriate dashboard
    if (requiredRole && userRole?.toLowerCase() !== requiredRole.toLowerCase()) {
      const dashboard = userRole?.toLowerCase() === 'hr' ? '/hr/analytics' : '/user-dashboard';
      navigate(dashboard);
    }
  }, [requiredRole, navigate]);
}

/**
 * Hook to get current user info
 */
export function useCurrentUser() {
  const userRole = localStorage.getItem('skilltrace_user_role');
  const user = JSON.parse(localStorage.getItem('skilltrace_user') || '{}');
  const userName = user.name;
  const userId = user.id;

  return {
    role: userRole,
    name: userName,
    id: userId,
    isHR: userRole?.toLowerCase() === 'hr',
    isCandidate: userRole?.toLowerCase() === 'candidate'
  };
}

export default useRoleProtection;
