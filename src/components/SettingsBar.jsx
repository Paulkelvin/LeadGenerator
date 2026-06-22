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

  const isBlue = accentClass.includes('blue');
  const isPurple = accentClass.includes('purple');
  const btnClass = saved
    ? 'bg-green-700'
    : isBlue
    ? 'bg-blue-600 hover:bg-blue-500'
    : isPurple
    ? 'bg-purple-700 hover:bg-purple-600'
    : 'bg-emerald-700 hover:bg-emerald-600';

  return (
    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
      <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium whitespace-nowrap flex-shrink-0 ${accentClass}`}>
        <Icon size={13} />
        {label}
      </div>
      <div className={`flex sm:hidden flex-shrink-0 ${accentClass}`}>
        <Icon size={14} />
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
        <div className="relative flex-1 min-w-0">
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder={placeholder}
            className={`w-full block bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none ${focusClass} pr-8`}
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
          className={`flex-shrink-0 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${btnClass}`}
        >
          {saved ? <><CheckCircle size={12} />Saved</> : 'Save'}
        </button>
        <a
          href={helpHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden sm:block flex-shrink-0 text-xs whitespace-nowrap ${
            isBlue ? 'text-blue-400 hover:text-blue-300'
            : isPurple ? 'text-purple-400 hover:text-purple-300'
            : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          {helpLabel}
        </a>
      </div>
    </div>
  );
}

export default function SettingsBar({ apiKey, nzApiKey, hunterKey, onSaveApiKey, onSaveNzApiKey, onSaveHunterKey }) {
  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-2.5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <KeyField
            icon={Key}
            label="🇬🇧 Companies House"
            value={apiKey}
            placeholder="UK Companies House API key…"
            accentClass="text-blue-400"
            focusClass="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            onSave={onSaveApiKey}
            helpHref="https://developer.company-information.service.gov.uk/"
            helpLabel="Get key →"
          />
          <KeyField
            icon={Key}
            label="🇳🇿 NZ NZBN"
            value={nzApiKey}
            placeholder="NZ NZBN API key…"
            accentClass="text-emerald-400"
            focusClass="focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            onSave={onSaveNzApiKey}
            helpHref="https://developer.business.govt.nz/"
            helpLabel="Get key →"
          />
        </div>
        <KeyField
          icon={Zap}
          label="Hunter.io"
          value={hunterKey}
          placeholder="Hunter.io key (optional — for email finding)"
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
