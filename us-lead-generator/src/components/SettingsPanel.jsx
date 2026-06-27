import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react';
import { SOCRATA_STATES } from '../data/states';
import { getDatasetOverrides, saveDatasetOverrides } from '../lib/storage';

export default function SettingsPanel({ filedApiKey, onSaveFiledKey }) {
  const [keyInput, setKeyInput] = useState(filedApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [overrides, setOverrides] = useState(() => getDatasetOverrides());
  const [testResults, setTestResults] = useState({});

  function handleSaveKey() {
    onSaveFiledKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  function handleOverrideChange(stateCode, value) {
    const next = { ...overrides, [stateCode]: value.trim() || undefined };
    if (!next[stateCode]) delete next[stateCode];
    setOverrides(next);
    saveDatasetOverrides(next);
  }

  async function handleTest(stateCode) {
    setTestResults((prev) => ({ ...prev, [stateCode]: 'loading' }));
    const cfg = SOCRATA_STATES[stateCode];
    const endpoint = overrides[stateCode] || cfg.endpoint;
    try {
      const url = `${endpoint}?$limit=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response');
      setTestResults((prev) => ({
        ...prev,
        [stateCode]: data.length > 0 ? 'ok' : 'empty',
      }));
    } catch (err) {
      setTestResults((prev) => ({ ...prev, [stateCode]: `error: ${err.message}` }));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      {/* Filed.dev API key */}
      <section>
        <h2 className="text-base font-semibold text-white mb-1">Filed.dev API Key</h2>
        <p className="text-sm text-gray-400 mb-4">
          Required for FL, TX, NY, CA, WA, IL, NJ, and GA.{' '}
          <a
            href="https://filed.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Get a free key at filed.dev
          </a>{' '}
          (100 searches/month free).
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="filed_live_…"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              keySaved
                ? 'bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {keySaved ? 'Saved!' : 'Save'}
          </button>
        </div>
        {filedApiKey && (
          <p className="mt-2 text-xs text-green-400">
            ✓ Key is set — Filed.dev states are enabled
          </p>
        )}
      </section>

      {/* Socrata dataset overrides */}
      <section>
        <h2 className="text-base font-semibold text-white mb-1">Socrata Dataset Overrides</h2>
        <p className="text-sm text-gray-400 mb-4">
          Override the default Socrata endpoint URL for any state. Leave blank to use the default.
          Use the Test button to verify the endpoint returns data.
        </p>
        <div className="space-y-4">
          {Object.entries(SOCRATA_STATES).map(([code, cfg]) => {
            const testResult = testResults[code];
            return (
              <div key={code} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cfg.emoji}</span>
                    <span className="font-medium text-white text-sm">{cfg.name}</span>
                  </div>
                  <button
                    onClick={() => handleTest(code)}
                    disabled={testResult === 'loading'}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 rounded text-xs font-medium transition-colors"
                  >
                    {testResult === 'loading' ? (
                      <Loader size={12} className="animate-spin" />
                    ) : null}
                    Test
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2 font-mono break-all">
                  Default: {cfg.endpoint}
                </p>
                <input
                  type="url"
                  value={overrides[code] || ''}
                  onChange={(e) => handleOverrideChange(code, e.target.value)}
                  placeholder="Override URL (optional)"
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                {testResult && testResult !== 'loading' && (
                  <div className={`flex items-center gap-1.5 mt-2 text-xs ${
                    testResult === 'ok' ? 'text-green-400' :
                    testResult === 'empty' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {testResult === 'ok' ? <CheckCircle size={12} /> :
                     testResult === 'empty' ? <CheckCircle size={12} /> :
                     <XCircle size={12} />}
                    {testResult === 'ok' ? 'Connected — data returned' :
                     testResult === 'empty' ? 'Connected — no rows (try a different date range)' :
                     testResult}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Info */}
      <section className="border-t border-gray-800 pt-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">About</h2>
        <div className="text-sm text-gray-500 space-y-1.5">
          <p>Free state APIs: Colorado (Socrata), Oregon (Socrata), Connecticut (Socrata)</p>
          <p>Paid states via Filed.dev: FL, TX, NY, CA, WA, IL, NJ, GA</p>
          <p>Your Filed.dev key is stored locally and sent only to the app's own proxy endpoint.</p>
        </div>
      </section>
    </div>
  );
}
