import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, CheckCircle, AlertCircle, Lock, Trash2 } from 'lucide-react';

export default function CompliancePage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [gdprRequests, setGdprRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('audit');
  const token = localStorage.getItem('skilltrace_token');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setLoading(true);
    setError('');
    try {
      const logsRes = await axios.get('/api/compliance/audit-logs?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleGDPRDeletion = async (requestId) => {
    if (!window.confirm('Are you sure you want to execute this GDPR deletion? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.put(`/api/compliance/gdpr/${requestId}/execute`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User data deleted successfully');
      fetchComplianceData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to execute deletion');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading compliance data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Compliance & Audit Management</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 font-semibold transition ${activeTab === 'audit'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <FileText className="inline mr-2 w-5 h-5" />
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('gdpr')}
            className={`px-4 py-2 font-semibold transition ${activeTab === 'gdpr'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Lock className="inline mr-2 w-5 h-5" />
            GDPR Requests
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 font-semibold transition ${activeTab === 'policies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <CheckCircle className="inline mr-2 w-5 h-5" />
            Data Retention Policies
          </button>
        </div>

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">System Audit Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Timestamp</th>
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-left py-3 px-2">Action</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 text-xs text-gray-600">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">{log.user_id || 'System'}</td>
                        <td className="py-3 px-2 font-medium">{log.action}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-gray-600">{log.ip_address}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GDPR Requests Tab */}
        {activeTab === 'gdpr' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">GDPR Data Deletion Requests</h2>
            <div className="space-y-4">
              {gdprRequests.length > 0 ? (
                gdprRequests.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">Request ID: {req.id}</h3>
                        <p className="text-sm text-gray-600">User: {req.user_id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold ${req.request_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.request_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            req.request_status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {req.request_status.toUpperCase()}
                      </span>
                    </div>
                    {req.request_reason && (
                      <p className="text-sm mb-3 text-gray-700">Reason: {req.request_reason}</p>
                    )}
                    <div className="text-xs text-gray-600 mb-3">
                      Requested: {new Date(req.requested_at).toLocaleString()}
                    </div>
                    {req.request_status === 'pending' && (
                      <button
                        onClick={() => handleGDPRDeletion(req.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm font-semibold"
                      >
                        <Trash2 className="inline w-4 h-4 mr-2" />
                        Execute Deletion
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No GDPR requests found</p>
              )}
            </div>
          </div>
        )}

        {/* Data Retention Policies Tab */}
        {activeTab === 'policies' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Data Retention Policies</h2>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Submissions</h3>
                <p className="text-sm text-gray-600 mt-2">Retained for 365 days • Auto-delete: Enabled</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Behavior Logs</h3>
                <p className="text-sm text-gray-600 mt-2">Retained for 90 days • Auto-delete: Enabled</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Audit Logs</h3>
                <p className="text-sm text-gray-600 mt-2">Retained for 2 years • Auto-delete: Disabled</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
