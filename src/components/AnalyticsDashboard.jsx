import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('skilltrace_token');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, gapRes, trendRes] = await Promise.all([
        axios.get('/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/analytics/skill-gaps', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/analytics/trends', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDashboardData(dashRes.data);
      setSkillGaps(gapRes.data);
      setTrends(trendRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const stats = dashboardData?.stats || {};
  const skillBreakdown = dashboardData?.skillBreakdown || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Performance Analytics</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold">Challenges Attempted</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.challenges_attempted || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold">Average Score</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{parseFloat(stats.avg_score || 0).toFixed(1)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold">Highest Score</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">{parseFloat(stats.highest_score || 0).toFixed(1)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold">Total Submissions</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{stats.total_submissions || 0}</div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Skills Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Skill Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Coding', value: skillBreakdown.coding },
                { label: 'Debugging', value: skillBreakdown.debugging },
                { label: 'Decision Making', value: skillBreakdown.decision_making },
                { label: 'Communication', value: skillBreakdown.communication },
                { label: 'Integrity', value: skillBreakdown.integrity }
              ].map((skill) => (
                <div key={skill.label}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{skill.label}</span>
                    <span className="text-gray-600">{parseFloat(skill.value || 0).toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(parseFloat(skill.value || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Performance Trend</h2>
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Trend Status:</span>
                <span className={`text-lg font-bold ${trends?.trend === 'improving' ? 'text-green-600' :
                    trends?.trend === 'declining' ? 'text-red-600' :
                      'text-yellow-600'
                  }`}>
                  {trends?.trend === 'improving' && '📈 Improving'}
                  {trends?.trend === 'declining' && '📉 Declining'}
                  {trends?.trend === 'stable' && '➡️ Stable'}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Total Attempts:</strong> {trends?.insights?.totalAttempts || 0}</p>
              <p><strong>Avg Integrity:</strong> {parseFloat(trends?.insights?.averageIntegrity || 0).toFixed(1)}/100</p>
              <p><strong>Timeframe:</strong> {trends?.timeframe}</p>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        {skillGaps?.recommendations && skillGaps.recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Skill Gap Analysis & Recommendations</h2>
            <div className="space-y-3">
              {skillGaps.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold capitalize">{rec.skill}</h3>
                      <p className="text-sm text-gray-700 mt-1">{rec.recommendation}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-bold ${rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                      }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Submissions */}
        {dashboardData?.recentSubmissions && dashboardData.recentSubmissions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Challenge</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Score</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{sub.title}</td>
                      <td className="py-3 capitalize">{sub.type}</td>
                      <td className="py-3">
                        <span className={`font-bold ${parseFloat(sub.overall_score) >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(sub.overall_score || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
