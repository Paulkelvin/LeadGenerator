import { useState } from 'react';
import { Download, Trash2, ExternalLink, Copy, Check, Zap, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { SIC_CODE_MAP } from '../data/sicCodes';
import { ANZSIC_CODE_MAP } from '../data/anzsicCodes';
import { searchDomain, extractDomain } from '../lib/hunterApi';

const STATUS_CONFIG = {
  new:         { label: 'New',         bg: 'bg-gray-700',       text: 'text-gray-300',   border: 'border-gray-600' },
  parked:      { label: 'Parked',      bg: 'bg-yellow-900/60',  text: 'text-yellow-300', border: 'border-yellow-700/50' },
  has_contact: { label: 'Has Contact', bg: 'bg-blue-900/50',    text: 'text-blue-300',   border: 'border-blue-700/50' },
  contacted:   { label: 'Contacted',   bg: 'bg-purple-900/50',  text: 'text-purple-300', border: 'border-purple-700/50' },
  replied:     { label: 'Replied',     bg: 'bg-cyan-900/50',    text: 'text-cyan-300',   border: 'border-cyan-700/50' },
  won:         { label: 'Won',         bg: 'bg-green-900/50',   text: 'text-green-300',  border: 'border-green-700/50' },
  lost:        { label: 'Lost',        bg: 'bg-red-900/50',     text: 'text-red-400',    border: 'border-red-700/50' },
};

const STATUS_KEYS = Object.keys(STATUS_CONFIG);

function contactDot(meta) {
  if (meta.email || meta.phone) return { color: 'bg-green-500', title: 'Has email or phone' };
  if (meta.website)             return { color: 'bg-yellow-500', title: 'Website only — no direct contact' };
  return                               { color: 'bg-gray-600', title: 'No contact info yet' };
}

function formatAddress(addr) {
  if (!addr) return '';
  return [
    addr.premises, addr.address_line_1, addr.address_line_2,
    addr.locality, addr.region, addr.postal_code,
  ].filter(Boolean).join(', ');
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return y && m && d ? `${d}/${m}/${y}` : str;
}

function formatContactedDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => {
        setCopied(true); setTimeout(() => setCopied(false), 1500);
      })}
      className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function LeadsPanel({ leads, hunterKey, onUpdate, onRemove }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [enrichMap, setEnrichMap] = useState({});

  function setEnrich(companyNumber, patch) {
    setEnrichMap((prev) => ({
      ...prev,
      [companyNumber]: { ...prev[companyNumber], ...patch },
    }));
  }

  async function handleEnrich(lead) {
    const domain = extractDomain(lead._meta?.website || '');
    if (!domain) return;
    setEnrich(lead.company_number, { status: 'loading', emails: [], error: null });
    try {
      const emails = await searchDomain(hunterKey, domain);
      setEnrich(lead.company_number, { status: 'done', emails });
    } catch (err) {
      setEnrich(lead.company_number, { status: 'error', error: err.message, emails: [] });
    }
  }

  function handleField(companyNumber, field, value) {
    onUpdate(companyNumber, { [field]: value });
  }

  function exportCSV() {
    const codeLabel = (code) => SIC_CODE_MAP[code] || ANZSIC_CODE_MAP[code] || '';
    const rows = leads.map((lead) => ({
      'Company Name': lead.company_name,
      'Company Number': lead.company_number,
      'Country': (lead._country || 'uk').toUpperCase(),
      'Incorporated': formatDate(lead.date_of_creation),
      'Address': formatAddress(lead.registered_office_address),
      'SIC/ANZSIC Codes': (lead.sic_codes || [])
        .map((c) => `${c}${codeLabel(c) ? ' – ' + codeLabel(c) : ''}`)
        .join('; '),
      'Company Status': lead.company_status,
      'Pipeline Status': STATUS_CONFIG[lead._meta?.status || 'new']?.label || 'New',
      'Contacted Date': lead._meta?.contacted_at ? formatContactedDate(lead._meta.contacted_at) : '',
      'Contact Email': lead._meta?.email || '',
      'Phone': lead._meta?.phone || '',
      'Website': lead._meta?.website || '',
      'Notes': lead._meta?.notes || '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-5xl mb-4">⭐</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No leads saved yet</h3>
        <p className="text-gray-500 max-w-sm">
          Search for companies and click the star icon to save them here. Then track their
          pipeline status and add contact details.
        </p>
      </div>
    );
  }

  // Summary stats
  const statsSummary = STATUS_KEYS
    .map((key) => {
      const n = leads.filter((l) => (l._meta?.status || 'new') === key).length;
      return n > 0 ? `${n} ${STATUS_CONFIG[key].label.toLowerCase()}` : null;
    })
    .filter(Boolean)
    .join(' · ');

  // Filtered leads for display
  const visibleLeads = statusFilter === 'all'
    ? leads
    : leads.filter((l) => (l._meta?.status || 'new') === statusFilter);

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-3 pb-0 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-sm text-gray-400">
              {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </span>
            {statsSummary && (
              <span className="ml-2 text-xs text-gray-600">— {statsSummary}</span>
            )}
            {!hunterKey && (
              <span className="ml-3 text-xs text-purple-500/70 inline-flex items-center gap-1">
                <Zap size={11} />
                Add Hunter.io key to enable email finding
              </span>
            )}
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Filter tabs */}
        <div className="overflow-x-auto pb-0">
          <div className="flex items-center gap-1 min-w-max pb-3">
            {['all', ...STATUS_KEYS].map((s) => {
              const count = s === 'all'
                ? leads.length
                : leads.filter((l) => (l._meta?.status || 'new') === s).length;
              if (count === 0 && s !== 'all') return null;
              const cfg = STATUS_CONFIG[s];
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap border ${
                    isActive
                      ? s === 'all'
                        ? 'bg-gray-700 text-gray-300 border-gray-600'
                        : `${cfg.bg} ${cfg.text} ${cfg.border}`
                      : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800 border-transparent'
                  }`}
                >
                  {s === 'all' ? 'All' : cfg.label}
                  <span className="ml-1 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {visibleLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <p className="text-gray-500 text-sm">No leads match this filter.</p>
        </div>
      )}

      {visibleLeads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                {['Company', 'Incorporated', 'Address', 'SIC', 'Status', 'Email', 'Phone', 'Website', 'Notes', ''].map((h) => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {visibleLeads.map((lead) => {
                const meta = lead._meta || {};
                const status = meta.status || 'new';
                const cfg = STATUS_CONFIG[status];
                const dot = contactDot(meta);
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(lead.company_name + ' website')}`;
                const sics = lead.sic_codes || [];
                const enrich = enrichMap[lead.company_number] || { status: 'idle', emails: [], error: null };
                const canEnrich = hunterKey && meta.website;
                const codeLabel = (code) => SIC_CODE_MAP[code] || ANZSIC_CODE_MAP[code] || '';

                return (
                  <tr key={lead.company_number} className="hover:bg-gray-800/30 transition-colors align-top">

                    {/* Company */}
                    <td className="px-3 py-3 max-w-[180px]">
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${dot.color}`}
                          title={dot.title}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-white leading-snug">{lead.company_name}</div>
                          <div className="text-xs font-mono text-gray-500 mt-0.5">
                            {(lead._country || 'uk') === 'nz' ? '🇳🇿 ' : '🇬🇧 '}
                            {lead.company_number}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5 flex-shrink-0">
                          <CopyBtn text={lead.company_name} />
                          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-600 hover:text-blue-400 transition-colors" title="Google search">
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(lead.date_of_creation)}
                    </td>

                    {/* Address */}
                    <td className="px-3 py-3 text-gray-400 max-w-[160px] text-xs leading-snug">
                      {formatAddress(lead.registered_office_address) || '—'}
                    </td>

                    {/* SIC */}
                    <td className="px-3 py-3 max-w-[140px]">
                      {sics.map((code) => (
                        <div key={code} className="text-xs text-gray-500 leading-tight">
                          <span className="font-mono">{code}</span>
                          {codeLabel(code) && ` – ${codeLabel(code)}`}
                        </div>
                      ))}
                    </td>

                    {/* Pipeline Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <select
                        value={status}
                        onChange={(e) => onUpdate(lead.company_number, { status: e.target.value })}
                        className={`text-xs px-2 py-1 rounded-md border font-medium cursor-pointer focus:outline-none ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {STATUS_KEYS.map((val) => (
                          <option key={val} value={val} className="bg-gray-900 text-gray-100">
                            {STATUS_CONFIG[val].label}
                          </option>
                        ))}
                      </select>
                      {['contacted', 'replied', 'won', 'lost'].includes(status) && meta.contacted_at && (
                        <div className="text-xs text-gray-600 mt-1">
                          {formatContactedDate(meta.contacted_at)}
                        </div>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-3 py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="email"
                            value={meta.email || ''}
                            onChange={(e) => handleField(lead.company_number, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full min-w-[140px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                          />
                          {canEnrich && (
                            <button
                              onClick={() => handleEnrich(lead)}
                              disabled={enrich.status === 'loading'}
                              title={`Find emails for ${extractDomain(meta.website)}`}
                              className="flex-shrink-0 p-1.5 rounded bg-purple-900/40 text-purple-400 hover:bg-purple-800/50 disabled:opacity-50 transition-colors border border-purple-800/50"
                            >
                              {enrich.status === 'loading'
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Zap size={12} />
                              }
                            </button>
                          )}
                        </div>

                        {enrich.status === 'done' && enrich.emails.length === 0 && (
                          <p className="text-xs text-gray-600">No emails found for {extractDomain(meta.website)}</p>
                        )}
                        {enrich.status === 'error' && (
                          <p className="text-xs text-red-500">{enrich.error}</p>
                        )}
                        {enrich.status === 'done' && enrich.emails.length > 0 && (
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-600">Click to use:</p>
                            {enrich.emails.slice(0, 4).map((e) => (
                              <button
                                key={e.value}
                                onClick={() => handleField(lead.company_number, 'email', e.value)}
                                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded bg-purple-900/20 border border-purple-800/30 hover:bg-purple-900/40 transition-colors"
                              >
                                <span className="text-xs text-purple-300 truncate">{e.value}</span>
                                {e.type === 'personal' && (
                                  <span className="ml-auto flex-shrink-0 text-xs text-purple-600">{e.first_name}</span>
                                )}
                                <span className="flex-shrink-0 text-xs text-purple-700">{e.confidence}%</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3">
                      <input
                        type="tel"
                        value={meta.phone || ''}
                        onChange={(e) => handleField(lead.company_number, 'phone', e.target.value)}
                        placeholder="07700 000000"
                        className="w-full min-w-[120px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>

                    {/* Website */}
                    <td className="px-3 py-3">
                      <input
                        type="url"
                        value={meta.website || ''}
                        onChange={(e) => handleField(lead.company_number, 'website', e.target.value)}
                        placeholder="https://…"
                        className="w-full min-w-[140px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>

                    {/* Notes */}
                    <td className="px-3 py-3">
                      <textarea
                        value={meta.notes || ''}
                        onChange={(e) => handleField(lead.company_number, 'notes', e.target.value)}
                        placeholder="Notes…"
                        rows={2}
                        className="w-full min-w-[160px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </td>

                    {/* Remove */}
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => onRemove(lead.company_number)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
