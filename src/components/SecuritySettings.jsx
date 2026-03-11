import { useState } from 'react';
import axios from 'axios';

export default function SecuritySettings() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaType, setMfaType] = useState('totp');
  const [setupStep, setSetupStep] = useState(null); // 'setup', 'verify', 'complete'
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token_from_storage = localStorage.getItem('skilltrace_token');

  // Get MFA Status
  const checkMFAStatus = async () => {
    try {
      const response = await axios.get('/api/mfa/status', {
        headers: { Authorization: `Bearer ${token_from_storage}` }
      });
      setMfaEnabled(response.data.mfaEnabled);
      setMfaType(response.data.mfaType || 'totp');
    } catch (err) {
      setError('Failed to fetch MFA status');
    }
  };

  // Setup MFA
  const handleSetupMFA = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/mfa/setup', { mfaType }, {
        headers: { Authorization: `Bearer ${token_from_storage}` }
      });
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setSetupStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  // Enable MFA
  const handleEnableMFA = async () => {
    if (!token) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/mfa/enable', { secret, token, mfaType }, {
        headers: { Authorization: `Bearer ${token_from_storage}` }
      });
      setBackupCodes(response.data.backupCodes);
      setSetupStep('complete');
      setSuccess('MFA enabled successfully!');
      setMfaEnabled(true);
      setTimeout(() => {
        setSetupStep(null);
        setSecret('');
        setQrCode('');
        setToken('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Disable MFA
  const handleDisableMFA = async () => {
    if (!window.confirm('Are you sure you want to disable MFA?')) return;

    setLoading(true);
    setError('');
    try {
      await axios.delete('/api/mfa/disable', {
        headers: { Authorization: `Bearer ${token_from_storage}` }
      });
      setMfaEnabled(false);
      setSuccess('MFA disabled successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Security Settings</h2>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-4">{success}</div>}

      {/* MFA Status */}
      <div className="mb-8 p-4 border rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Multi-Factor Authentication (MFA)</h3>
            <p className="text-gray-600 mt-2">
              Status: <span className={mfaEnabled ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </p>
          </div>
          {mfaEnabled && (
            <button
              onClick={handleDisableMFA}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Disable MFA
            </button>
          )}
        </div>
      </div>

      {/* Setup Flow */}
      {!mfaEnabled && !setupStep && (
        <div className="mb-8">
          <label className="block mb-4">
            <span className="text-gray-700 font-semibold">Select MFA Type:</span>
            <select
              value={mfaType}
              onChange={(e) => setMfaType(e.target.value)}
              className="mt-2 block w-full p-2 border rounded"
            >
              <option value="totp">Authenticator App (TOTP)</option>
              <option value="sms">SMS (Coming Soon)</option>
              <option value="email">Email (Coming Soon)</option>
            </select>
          </label>
          <button
            onClick={handleSetupMFA}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Setup MFA'}
          </button>
        </div>
      )}

      {/* Setup Step 1: Scan QR Code */}
      {setupStep === 'setup' && (
        <div className="mb-8 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-4">Step 1: Scan QR Code</h3>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
          </p>
          {qrCode && (
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">Or enter this code manually:</p>
          <code className="bg-gray-200 p-2 rounded block text-center font-mono mb-4">{secret}</code>
          <button
            onClick={() => setSetupStep('verify')}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Next: Verify Code
          </button>
        </div>
      )}

      {/* Setup Step 2: Verify Code */}
      {setupStep === 'verify' && (
        <div className="mb-8 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-4">Step 2: Verify Code</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter the 6-digit code from your authenticator app:
          </p>
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            className="block w-full p-2 border rounded mb-4 text-center font-mono text-2xl tracking-widest"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSetupStep('setup')}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleEnableMFA}
              disabled={loading || token.length !== 6}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* Backup Codes */}
      {setupStep === 'complete' && (
        <div className="mb-8 p-4 border rounded-lg bg-green-50">
          <h3 className="font-semibold mb-4 text-green-700">✓ MFA Enabled Successfully!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Save these backup codes in a safe place. You can use them if you lose access to your authenticator:
          </p>
          <div className="bg-white p-4 rounded border grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code, idx) => (
              <code key={idx} className="font-mono text-sm">{code}</code>
            ))}
          </div>
          <button
            onClick={() => {
              const text = backupCodes.join('\n');
              navigator.clipboard.writeText(text);
              alert('Backup codes copied to clipboard!');
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            Copy Codes
          </button>
          <button
            onClick={() => {
              setSetupStep(null);
              setBackupCodes([]);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
