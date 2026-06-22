import { useState } from 'react';
import { Download, Trash2, ExternalLink, Copy, Check, Zap, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { SIC_CODE_MAP } from '../data/sicCodes';
import { searchDomain, extractDomain } from '../lib/hunterApi';

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
  // Hunter.io state per company: { status: 'idle'|'loading'|'done'|'error', emails: [], error: null }
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
    const rows = leads.map((lead) => ({
      'Company Name': lead.company_name,
      'Company Number': lead.company_number,
      'Incorporated': formatDate(lead.date_of_creation),
      'Address': formatAddress(lead.registered_office_address),
      'SIC Codes': (lead.sic_codes || [])
        .map((c) => `${c}${SIC_CODE_MAP[c] ? ' – ' + SIC_CODE_MAP[c] : ''}`)
        .join('; '),
      'Status': lead.company_status,
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
          Search for companies and click the star icon to save them here. Then add contact
          details and export to CSV.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </span>
          {!hunterKey && (
            <span className="text-xs text-purple-500/70 flex items-center gap-1">
              <Zap size={11} />
              Add Hunter.io key above to enable email finding
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {['Company', 'Incorporated', 'Address', 'SIC', 'Email', 'Phone', 'Website', 'Notes', ''].map((h) => (
                <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {leads.map((lead) => {
              const meta = lead._meta || {};
              const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(lead.company_name + ' website')}`;
              const sics = lead.sic_codes || [];
              const enrich = enrichMap[lead.company_number] || { status: 'idle', emails: [], error: null };
              const canEnrich = hunterKey && meta.website;

              return (
                <tr key={lead.company_number} className="hover:bg-gray-800/30 transition-colors align-top">
                  {/* Company */}
                  <td className="px-3 py-3 max-w-[180px]">
                    <div className="flex items-start gap-1">
                      <div>
                        <div className="font-medium text-white leading-snug">{lead.company_name}</div>
                        <div className="text-xs font-mono text-gray-500 mt-0.5">{lead.company_number}</div>
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
                        {SIC_CODE_MAP[code] && ` – ${SIC_CODE_MAP[code]}`}
                      </div>
                    ))}
                  </td>

                  {/* Email — with Hunter enrichment */}
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

                      {/* Hunter results */}
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
                              className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded bg-purple-900/20 border border-purple-800/30 hover:bg-purple-900/40 transition-colors group"
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
    </div>
  );
}
