import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ComplianceSettings() {
  const [consents, setConsents] = useState([]);
  const [gdprStatus, setGdprStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('skilltrace_token');

  const consentTypes = [
    { key: 'privacy_policy', label: 'Privacy Policy', description: 'I agree to the privacy policy' },
    { key: 'data_processing', label: 'Data Processing', description: 'I agree to my data being processed' },
    { key: 'analytics', label: 'Analytics', description: 'Allow us to track analytics for improvement' },
    { key: 'marketing', label: 'Marketing', description: 'I agree to receive marketing communications' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consentRes, gdprRes] = await Promise.all([
        axios.get('/api/compliance/consent-records', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/compliance/gdpr/deletion-status', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setConsents(consentRes.data.records || []);
      setGdprStatus(gdprRes.data);
    } catch (err) {
      setError('Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (consentType, consentGiven) => {
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/compliance/consent', {
        consentType,
        consentGiven,
        version: '1.0'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Consent ${consentGiven ? 'granted' : 'withdrawn'} successfully`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update consent');
    }
  };

  const handleRequestDeletion = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account and all data.')) return;

    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/compliance/gdpr/deletion-request', {
        reason: 'User requested deletion'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Deletion request submitted. Your data will be deleted within 30 days.');
      setGdprStatus(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit deletion request');
    }
  };

  const handleExportData = async () => {
    setError('');
    try {
      const response = await axios.get('/api/compliance/export-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setSuccess('Your data has been exported');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to export data');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Privacy & Compliance Settings</h1>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-4">{success}</div>}

      {/* Consent Management */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Consent Management</h2>
        <p className="text-gray-600 mb-4">Manage your consent preferences below:</p>

        <div className="space-y-4">
          {consentTypes.map((type) => {
            const consentRecord = consents.find(c => c.consent_type === type.key);
            const isConsented = consentRecord?.consent_given || false;

            return (
              <div key={type.key} className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  {consentRecord && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(consentRecord.consented_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isConsented}
                      onChange={(e) => handleConsentChange(type.key, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="ml-2 text-sm">{isConsented ? 'Given' : 'Not Given'}</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Your Data Rights (GDPR)</h2>

        {/* Current Deletion Status */}
        {gdprStatus?.request && (
          <div className={`p-4 rounded mb-4 ${gdprStatus.request.request_status === 'completed' ? 'bg-gray-50' :
              gdprStatus.request.request_status === 'processing' ? 'bg-yellow-50' :
                'bg-blue-50'
            }`}>
            <p className="font-semibold mb-2">Deletion Request Status: <span className="capitalize text-lg">
              {gdprStatus.request.request_status}
            </span></p>
            <p className="text-sm text-gray-600">
              Requested: {new Date(gdprStatus.request.requested_at).toLocaleString()}
            </p>
            {gdprStatus.request.processed_at && (
              <p className="text-sm text-gray-600">
                Processed: {new Date(gdprStatus.request.processed_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Export Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📥 Right to Access</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download a copy of all your personal data in a portable format.
            </p>
            <button
              onClick={handleExportData}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Export My Data
            </button>
          </div>

          {/* Delete Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🗑️ Right to Be Forgotten</h3>
            <p className="text-sm text-gray-600 mb-4">
              Request complete deletion of your account and all associated data.
            </p>
            <button
              onClick={handleRequestDeletion}
              disabled={gdprStatus?.request?.request_status === 'pending'}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gdprStatus?.request?.request_status === 'pending' ? 'Deletion Pending' : 'Request Deletion'}
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-semibold mb-2">📋 Data Deletion Timeline:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your deletion request will be processed within 30 days</li>
            <li>All personal data will be permanently deleted</li>
            <li>Aggregated analytics data may be retained for reporting purposes</li>
            <li>You will receive a confirmation email once deletion is complete</li>
          </ul>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Privacy Information</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">🔐 Data Encryption</h3>
            <p className="text-gray-600">
              All your data is encrypted in transit (TLS) and at rest using AES-256 encryption.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📊 Audit Logs</h3>
            <p className="text-gray-600">
              All access to your data is logged and can be reviewed for security purposes. Only authorized HR personnel can access logs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🌍 Data Retention</h3>
            <p className="text-gray-600">
              Your data is retained for the duration of your engagement plus 1 year for legal and compliance purposes, unless you request deletion earlier.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✉️ Contact</h3>
            <p className="text-gray-600">
              For privacy concerns, please contact: privacy@simuwork.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
