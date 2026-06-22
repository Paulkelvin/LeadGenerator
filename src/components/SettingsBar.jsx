import { useState } from 'react';
import { Eye, EyeOff, Key, Zap, CheckCircle } from 'lucide-react';

function KeyField({ icon: Icon, label, value, placeholder, accentClass, focusClass, onSave, helpHref, helpLabel }) {
  const [draft, setDraft] = useState(value);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    onSave(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${accentClass}`}>
        <Icon size={13} />
        {label}
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 min-w-0">
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder={placeholder}
            className={`w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none ${focusClass} pr-8`}
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <button
          onClick={save}
          className={`flex-shrink-0 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
            saved ? 'bg-green-700' : accentClass.includes('blue') ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-700 hover:bg-purple-600'
          }`}
        >
          {saved ? <><CheckCircle size={12} />Saved</> : 'Save'}
        </button>
        <a
          href={helpHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs whitespace-nowrap ${accentClass.includes('blue') ? 'text-blue-400 hover:text-blue-300' : 'text-purple-400 hover:text-purple-300'}`}
        >
          {helpLabel}
        </a>
      </div>
    </div>
  );
}

export default function SettingsBar({ apiKey, hunterKey, onSaveApiKey, onSaveHunterKey }) {
  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3">
        <KeyField
          icon={Key}
          label="Companies House"
          value={apiKey}
          placeholder="Paste API key…"
          accentClass="text-blue-400"
          focusClass="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          onSave={onSaveApiKey}
          helpHref="https://developer.company-information.service.gov.uk/"
          helpLabel="Get key →"
        />
        <KeyField
          icon={Zap}
          label="Hunter.io"
          value={hunterKey}
          placeholder="Optional — for email finding"
          accentClass="text-purple-400"
          focusClass="focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          onSave={onSaveHunterKey}
          helpHref="https://hunter.io/"
          helpLabel="Get key →"
        />
      </div>
    </div>
  );
}
