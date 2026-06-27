import { useState } from 'react';
import { Download, Trash2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { STATE_BADGE_CLASSES, SOCRATA_STATES, FILED_STATES } from '../data/states';

const ALL_STATES = {
  ...SOCRATA_STATES,
  ...Object.fromEntries(FILED_STATES.map((s) => [s.code, s])),
};

const STATUSES = [
  { value: 'new',        label: 'New',         color: 'bg-blue-500' },
  { value: 'contacted',  label: 'Contacted',   color: 'bg-yellow-500' },
  { value: 'responded',  label: 'Responded',   color: 'bg-purple-500' },
  { value: 'qualified',  label: 'Qualified',   color: 'bg-orange-500' },
  { value: 'won',        label: 'Won',         color: 'bg-green-500' },
  { value: 'lost',       label: 'Lost',        color: 'bg-red-500' },
];

function cleanName(name) {
  return name
    .replace(/\b(llc\.?|llp\.?|l\.l\.c\.?|l\.l\.p\.?|inc\.?|corp\.?|corporation|incorporated|limited|ltd\.?|plc\.?|co\.?)$/i, '')
    .trim();
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button onClick={handleCopy} className="p-0.5 rounded text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
    </button>
  );
}

function StateBadge({ stateCode }) {
  const cfg = ALL_STATES[stateCode] || {};
  const color = cfg.color || 'blue';
  const cls = STATE_BADGE_CLASSES[color] || STATE_BADGE_CLASSES.blue;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {cfg.emoji} {stateCode}
    </span>
  );
}

function LeadRow({ lead, onChange, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUSES.find((s) => s.value === (lead.status || 'new')) || STATUSES[0];
  const q = encodeURIComponent(cleanName(lead.companyName));
  const googleUrl = `https://www.google.com/search?q=${q}`;
  const instagramUrl = `https://www.instagram.com/explore/search/keyword/?q=${q}`;
  const facebookUrl = `https://www.facebook.com/search/top?q=${q}`;

  return (
    <>
      <tr
        className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-3 py-3">
          <StateBadge stateCode={lead.state} />
        </td>
        <td className="px-3 py-3 max-w-[180px]">
          <div className="min-w-0">
            <div className="font-medium text-white leading-snug truncate flex items-center gap-1">
              <span className="truncate">{lead.companyName}</span>
              <CopyBtn text={lead.companyName} />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{lead.entityType || ''}</div>
            <div className="flex items-center gap-1 mt-1.5" onClick={(e) => e.stopPropagation()}>
              <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-800/50 hover:bg-blue-800/60 transition-colors">G</a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded text-xs font-medium bg-pink-900/40 text-pink-300 border border-pink-800/50 hover:bg-pink-800/60 transition-colors">IG</a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                className="px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-900/40 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-800/60 transition-colors">FB</a>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap hidden sm:table-cell">
          {lead.formationDate || '—'}
        </td>
        <td className="px-3 py-3 hidden md:table-cell text-gray-400 text-xs max-w-[120px] truncate">
          {lead.city || '—'}
        </td>
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <select
            value={lead.status || 'new'}
            onChange={(e) => onChange({ ...lead, status: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
          <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </td>
        <td className="px-3 py-3 text-center text-gray-600">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-gray-800/60 bg-gray-800/20">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</label>
                <input
                  type="email"
                  value={lead.contactEmail || lead.email || ''}
                  onChange={(e) => onChange({ ...lead, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                <input
                  type="tel"
                  value={lead.phone || ''}
                  onChange={(e) => onChange({ ...lead, phone: e.target.value })}
                  placeholder="+1 555 000 0000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Website</label>
                <input
                  type="url"
                  value={lead.website || ''}
                  onChange={(e) => onChange({ ...lead, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</label>
                <textarea
                  value={lead.notes || ''}
                  onChange={(e) => onChange({ ...lead, notes: e.target.value })}
                  placeholder="Add notes about this lead…"
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 text-xs text-gray-600 space-y-0.5">
                <div>
                  {lead.address && <span className="mr-4">Address: {lead.address}</span>}
                  {lead.zip && <span className="mr-4">ZIP: {lead.zip}</span>}
                  {lead.agentName && <span>Agent: {lead.agentName}</span>}
                </div>
                {(lead.naicsCode || lead.county || lead.ceo || lead.jurisdiction) && (
                  <div>
                    {lead.naicsCode && <span className="mr-4">NAICS: {lead.naicsCode}</span>}
                    {lead.county && <span className="mr-4">{lead.county} County</span>}
                    {lead.ceo && <span className="mr-4">CEO: {lead.ceo}</span>}
                    {lead.jurisdiction && <span>Jurisdiction: {lead.jurisdiction}</span>}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LeadsPanel({ leads, onLeadsChange }) {
  function handleChange(updated) {
    onLeadsChange(leads.map((l) => (l._id === updated._id ? updated : l)));
  }

  function handleRemove(id) {
    onLeadsChange(leads.filter((l) => l._id !== id));
  }

  function handleExport() {
    const rows = leads.map((l) => ({
      State: l.state,
      Company: l.companyName,
      'Entity Type': l.entityType,
      'Formation Date': l.formationDate,
      Status: l.status || 'new',
      City: l.city,
      ZIP: l.zip,
      County: l.county || '',
      Agent: l.agentName,
      CEO: l.ceo || '',
      'Business Email': l.email || '',
      'NAICS Code': l.naicsCode || '',
      Jurisdiction: l.jurisdiction || '',
      Email: l.contactEmail || '',
      Phone: l.phone || '',
      Website: l.website || '',
      Notes: l.notes || '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `us-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <p className="text-lg font-medium text-gray-400">No leads saved yet</p>
        <p className="text-sm mt-1">Star a result in the Search tab to add it here</p>
      </div>
    );
  }

  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: leads.filter((l) => (l.status || 'new') === s.value).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">{leads.length} Lead{leads.length !== 1 ? 's' : ''}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {statusCounts.map((s) => (
              <span key={s.value} className="flex items-center gap-1 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label}: {s.count}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-3 py-2 text-left font-medium w-16">State</th>
              <th className="px-3 py-2 text-left font-medium">Company</th>
              <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">Formed</th>
              <th className="px-3 py-2 text-left font-medium hidden md:table-cell">City</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-center font-medium w-10"></th>
              <th className="px-3 py-2 text-center font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow
                key={lead._id}
                lead={lead}
                onChange={handleChange}
                onRemove={() => handleRemove(lead._id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
