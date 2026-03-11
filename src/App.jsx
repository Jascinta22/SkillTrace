import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import ChallengeViewer from './pages/ChallengeViewer';
import HRDashboard from './pages/HRDashboard';
import Results from './pages/Results';
import UserDashboard from './pages/UserDashboard';
import SkillSelection from './pages/SkillSelection';
import LevelProgression from './pages/LevelProgression';
import CodingChallenge from './pages/CodingChallenge';
import ScenarioChallenge from './pages/ScenarioChallenge';
import AIMentor from './pages/AIMentor';
import SecurityPage from './pages/Security';
import CompliancePage from './pages/Compliance';
import QuizAssessment from './pages/QuizAssessment';
import NotFound from './pages/NotFound';
import LiveProctoring from './pages/LiveProctoring';
import ChallengeBuilder from './pages/ChallengeBuilder';
import EnterpriseSettings from './pages/EnterpriseSettings';
import Leaderboard from './pages/Leaderboard';
import RiskReports from './pages/RiskReports';
import DetailedAnalytics from './pages/DetailedAnalytics';
import VoiceInterview from './pages/VoiceInterview';
import IdentityVerification from './pages/IdentityVerification';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to their respective dashboard if they try to access the wrong role's routes
    return <Navigate to={user.role === 'hr' ? '/hr/analytics' : '/user-dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="font-sans text-[#F1F5F9] bg-[#0F172A] min-h-screen selection:bg-[#06B6D4] selection:text-[#0F172A]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/solve/:challengeId" element={
            <ProtectedRoute>
              <ChallengeViewer />
            </ProtectedRoute>
          } />
          <Route path="/results" element={<Results />} />
          {/* HR Routes */}
          <Route path="/hr/analytics" element={
            <ProtectedRoute role="hr">
              <HRDashboard />
            </ProtectedRoute>
          } />

          {/* Future/Enterprise Features */}
          <Route path="/hr/proctoring/:id" element={
            <ProtectedRoute role="hr">
              <LiveProctoring />
            </ProtectedRoute>
          } />
          <Route path="/hr/challenge-builder" element={
            <ProtectedRoute role="hr">
              <ChallengeBuilder />
            </ProtectedRoute>
          } />
          <Route path="/hr/leaderboard" element={
            <ProtectedRoute role="hr">
              <Leaderboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/risk-reports" element={
            <ProtectedRoute role="hr">
              <RiskReports />
            </ProtectedRoute>
          } />
          <Route path="/hr/detailed-report" element={
            <ProtectedRoute role="hr">
              <DetailedAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/hr/settings" element={
            <ProtectedRoute role="hr">
              <EnterpriseSettings />
            </ProtectedRoute>
          } />

          {/* Soft Skills & Security */}
          <Route path="/voice-interview" element={<VoiceInterview />} />
          <Route path="/identity-verification" element={<IdentityVerification />} />

          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/skill-selection" element={<SkillSelection />} />
          <Route path="/skill/:skillId" element={<LevelProgression />} />
          <Route path="/level/:levelId/lessons" element={<CodingChallenge />} />
          <Route path="/coding-challenge/:challengeId" element={<CodingChallenge />} />
          <Route path="/scenario-challenge/:scenarioId" element={<ScenarioChallenge />} />
          <Route path="/ai-mentor" element={<AIMentor />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/quiz-assessment" element={<QuizAssessment />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
