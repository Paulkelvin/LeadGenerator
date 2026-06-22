import { useState } from 'react';
import { Download, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import Papa from 'papaparse';
import { SIC_CODE_MAP } from '../data/sicCodes';

function formatAddress(addr) {
  if (!addr) return '';
  const parts = [
    addr.premises,
    addr.address_line_1,
    addr.address_line_2,
    addr.locality,
    addr.region,
    addr.postal_code,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ');
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  if (!y || !m || !d) return str;
  return `${d}/${m}/${y}`;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function LeadsPanel({ leads, onUpdate, onRemove }) {
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm text-gray-400">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} saved
        </span>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {[
                'Company',
                'Incorporated',
                'Address',
                'SIC Codes',
                'Contact Email',
                'Phone',
                'Website',
                'Notes',
                '',
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {leads.map((lead) => {
              const meta = lead._meta || {};
              const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
                lead.company_name + ' website'
              )}`;
              const sics = lead.sic_codes || [];

              return (
                <tr key={lead.company_number} className="hover:bg-gray-800/30 transition-colors">
                  {/* Company name */}
                  <td className="px-3 py-3 max-w-[180px]">
                    <div className="flex items-start gap-1">
                      <div>
                        <div className="font-medium text-white leading-snug">
                          {lead.company_name}
                        </div>
                        <div className="text-xs font-mono text-gray-500 mt-0.5">
                          {lead.company_number}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <CopyBtn text={lead.company_name} />
                        <a
                          href={googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-600 hover:text-blue-400 transition-colors"
                          title="Search Google"
                        >
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
                  <td className="px-3 py-3 text-gray-400 max-w-[180px] text-xs leading-snug">
                    {formatAddress(lead.registered_office_address) || '—'}
                  </td>

                  {/* SIC */}
                  <td className="px-3 py-3 max-w-[160px]">
                    {sics.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {sics.map((code) => (
                          <span key={code} className="text-xs text-gray-500">
                            <span className="font-mono">{code}</span>
                            {SIC_CODE_MAP[code] ? ` – ${SIC_CODE_MAP[code]}` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>

                  {/* Editable fields */}
                  {[
                    { key: 'email', placeholder: 'email@example.com', type: 'email' },
                    { key: 'phone', placeholder: '07700 000000', type: 'tel' },
                    { key: 'website', placeholder: 'https://...', type: 'url' },
                  ].map(({ key, placeholder, type }) => (
                    <td key={key} className="px-3 py-3">
                      <input
                        type={type}
                        value={meta[key] || ''}
                        onChange={(e) => handleField(lead.company_number, key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full min-w-[130px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                      />
                    </td>
                  ))}

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
                    <button
                      onClick={() => onRemove(lead.company_number)}
                      title="Remove lead"
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                    >
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
