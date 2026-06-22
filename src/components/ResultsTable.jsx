import { useState } from 'react';
import { Copy, ExternalLink, Star, StarOff, Check } from 'lucide-react';
import { SIC_CODE_MAP } from '../data/sicCodes';

function formatAddress(addr) {
  if (!addr) return '—';
  const parts = [
    addr.premises,
    addr.address_line_1,
    addr.address_line_2,
    addr.locality,
    addr.region,
    addr.postal_code,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ') || '—';
}

function formatDate(str) {
  if (!str) return '—';
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
      title="Copy company name"
      className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

export default function ResultsTable({ results, leads, onMarkLead, onUnmarkLead }) {
  if (!results || results.length === 0) return null;

  const leadNumbers = new Set(leads.map((l) => l.company_number));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/50">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Company
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
              Reg. Number
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
              Incorporated
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Address
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
              SIC Codes
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Status
            </th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Search
            </th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Lead
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {results.map((company) => {
            const isLead = leadNumbers.has(company.company_number);
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
              company.company_name + ' website'
            )}`;
            const sics = company.sic_codes || [];

            return (
              <tr
                key={company.company_number}
                className="hover:bg-gray-800/40 transition-colors group"
              >
                {/* Company name */}
                <td className="px-4 py-3 max-w-[200px]">
                  <div className="flex items-start gap-1">
                    <span className="text-white font-medium leading-snug">
                      {company.company_name}
                    </span>
                    <CopyBtn text={company.company_name} />
                  </div>
                </td>

                {/* Number */}
                <td className="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">
                  {company.company_number}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                  {formatDate(company.date_of_creation)}
                </td>

                {/* Address */}
                <td className="px-4 py-3 text-gray-400 max-w-[220px] text-xs leading-snug">
                  {formatAddress(company.registered_office_address)}
                </td>

                {/* SIC codes */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {sics.length > 0 ? (
                      sics.map((code) => (
                        <span key={code} className="text-xs text-gray-400 leading-tight">
                          <span className="font-mono text-gray-500">{code}</span>
                          {SIC_CODE_MAP[code] ? (
                            <span className="text-gray-500"> – {SIC_CODE_MAP[code]}</span>
                          ) : null}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      company.company_status === 'active'
                        ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {company.company_status || '—'}
                  </span>
                </td>

                {/* Website search */}
                <td className="px-4 py-3 text-center">
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Search for website on Google"
                    className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink size={15} />
                  </a>
                </td>

                {/* Mark as lead */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() =>
                      isLead ? onUnmarkLead(company.company_number) : onMarkLead(company)
                    }
                    title={isLead ? 'Remove from leads' : 'Mark as lead'}
                    className={`inline-flex items-center justify-center p-1.5 transition-colors ${
                      isLead
                        ? 'text-yellow-400 hover:text-gray-400'
                        : 'text-gray-600 hover:text-yellow-400'
                    }`}
                  >
                    {isLead ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
