import { useState } from 'react';
import {
  Copy, ExternalLink, Star, Check, ChevronDown, ChevronUp,
  Users, Link2, Loader2,
} from 'lucide-react';
import { SIC_CODE_MAP } from '../data/sicCodes';
import { ANZSIC_CODE_MAP } from '../data/anzsicCodes';
import { getOfficers } from '../lib/companiesHouse';

function formatAddress(addr) {
  if (!addr) return '—';
  return [
    addr.premises, addr.address_line_1, addr.address_line_2,
    addr.locality, addr.region, addr.postal_code,
  ].filter(Boolean).join(', ') || '—';
}

function cleanName(name) {
  return name
    .replace(/\b(limited|ltd\.?|llp\.?|plc\.?|llc\.?|cic\.?|cio\.?|inc\.?|corp\.?|co\.?)$/i, '')
    .trim();
}

function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return y && m && d ? `${d}/${m}/${y}` : str;
}

// "SMITH, John Edward" → "John Edward Smith"
function formatOfficerName(raw) {
  if (!raw) return '';
  const [last = '', first = ''] = raw.split(',').map((p) =>
    p.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  );
  return first ? `${first} ${last}` : last;
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      title="Copy"
      className="p-1 text-gray-600 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

function QuickLink({ href, label, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${className}`}
    >
      <ExternalLink size={11} />
      {label}
    </a>
  );
}

function OfficerRow({ officer, companyName }) {
  const name = formatOfficerName(officer.name);
  const role = officer.officer_role?.replace(/_/g, ' ') || '';
  const since = officer.appointed_on ? formatDate(officer.appointed_on) : null;

  const liSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name + ' ' + companyName)}`;
  const gSearch = `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + companyName)}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-gray-700/50 last:border-0">
      <div>
        <span className="text-sm font-medium text-gray-200">{name}</span>
        <span className="ml-2 text-xs text-gray-500 capitalize">{role}</span>
        {since && <span className="ml-2 text-xs text-gray-600">since {since}</span>}
      </div>
      <div className="flex gap-1.5">
        <QuickLink href={liSearch} label="LinkedIn" className="border-blue-800/60 text-blue-400 hover:bg-blue-900/30" />
        <QuickLink href={gSearch} label="Google" className="border-gray-700 text-gray-400 hover:bg-gray-800" />
      </div>
    </div>
  );
}

function ExpandedRow({ company, apiKey, colSpan }) {
  const isNZ = company._country === 'nz';

  const [officers, setOfficers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch on first render (UK only)
  useState(() => {
    if (isNZ) return;
    setLoading(true);
    getOfficers(apiKey, company.company_number)
      .then((data) => { setOfficers(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  });

  const liCompany = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company.company_name)}`;
  const liPeople = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company.company_name + ' director')}`;
  const googleMaps = `https://www.google.com/maps/search/${encodeURIComponent(formatAddress(company.registered_office_address))}`;
  const chUrl = `https://find-and-update.company-information.service.gov.uk/company/${company.company_number}`;
  const nzbnUrl = `https://www.nzbn.govt.nz/mynzbn/nzbndetails/${company.company_number}/`;

  return (
    <tr>
      <td colSpan={colSpan} className="bg-gray-800/50 px-5 py-4 border-b border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Officers column — UK only */}
          {!isNZ && (
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Users size={13} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Directors &amp; Officers
                </span>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
              )}
              {error && <p className="text-xs text-red-400 py-2">{error}</p>}
              {officers && officers.length === 0 && (
                <p className="text-xs text-gray-600 py-2">No active officers found.</p>
              )}
              {officers && officers.map((o) => (
                <OfficerRow key={o.name + o.appointed_on} officer={o} companyName={company.company_name} />
              ))}
            </div>
          )}

          {/* Quick links column */}
          <div className={isNZ ? 'md:col-span-3' : ''}>
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={13} className="text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Quick Links
              </span>
            </div>
            <div className={`flex gap-1.5 ${isNZ ? 'flex-wrap' : 'flex-col'}`}>
              {isNZ ? (
                <QuickLink href={nzbnUrl} label="NZBN Registry" className="border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/30 justify-start" />
              ) : (
                <QuickLink href={chUrl} label="CH Public Profile" className="border-gray-700 text-gray-300 hover:bg-gray-700 justify-start" />
              )}
              <QuickLink href={liCompany} label="LinkedIn Company" className="border-blue-800/60 text-blue-400 hover:bg-blue-900/30 justify-start" />
              <QuickLink href={liPeople} label="LinkedIn – Find People" className="border-blue-800/60 text-blue-400 hover:bg-blue-900/30 justify-start" />
              <QuickLink href={googleMaps} label="Google Maps" className="border-gray-700 text-gray-400 hover:bg-gray-800 justify-start" />
            </div>
          </div>

        </div>
      </td>
    </tr>
  );
}

export default function ResultsTable({ results, leads, onMarkLead, onUnmarkLead, apiKey }) {
  const [expandedNum, setExpandedNum] = useState(null);

  if (!results || results.length === 0) return null;

  const leadNumbers = new Set(leads.map((l) => l.company_number));
  const COL_COUNT = 9;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/50">
            <th className="w-8 px-2 py-3" />
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Company</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">Reg. No.</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">Incorporated</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Address</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">SIC</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Search</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Lead</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {results.map((company) => {
            const isLead = leadNumbers.has(company.company_number);
            const isExpanded = expandedNum === company.company_number;
            const q = encodeURIComponent(cleanName(company.company_name));
            const googleUrl    = `https://www.google.com/search?q=${q}`;
            const instagramUrl = `https://www.instagram.com/explore/search/keyword/?q=${q}`;
            const facebookUrl  = `https://www.facebook.com/search/top?q=${q}`;
            const sics = company.sic_codes || [];

            return (
              <>
                <tr
                  key={company.company_number}
                  className={`hover:bg-gray-800/40 transition-colors ${isExpanded ? 'bg-gray-800/30' : ''}`}
                >
                  {/* Expand toggle */}
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={() => setExpandedNum(isExpanded ? null : company.company_number)}
                      title={isExpanded ? 'Collapse' : 'Show directors & links'}
                      className={`p-1 rounded transition-colors ${
                        isExpanded
                          ? 'text-blue-400 bg-blue-900/30'
                          : 'text-gray-600 hover:text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </td>

                  {/* Company name */}
                  <td className="px-4 py-3 max-w-[180px]">
                    <div className="flex items-start gap-1">
                      <span className="text-white font-medium leading-snug">{company.company_name}</span>
                      <CopyBtn text={company.company_name} />
                    </div>
                  </td>

                  {/* Number */}
                  <td className="px-4 py-3 font-mono text-gray-400 whitespace-nowrap text-xs">
                    {company.company_number}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {formatDate(company.date_of_creation)}
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] text-xs leading-snug">
                    {formatAddress(company.registered_office_address)}
                  </td>

                  {/* SIC */}
                  <td className="px-4 py-3 max-w-[160px]">
                    {sics.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {sics.map((code) => (
                          <span key={code} className="text-xs text-gray-400">
                            <span className="font-mono text-gray-500">{code}</span>
                            {(SIC_CODE_MAP[code] || ANZSIC_CODE_MAP[code]) && <span className="text-gray-600"> – {SIC_CODE_MAP[code] || ANZSIC_CODE_MAP[code]}</span>}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-gray-600">—</span>}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      company.company_status === 'active'
                        ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {company.company_status || '—'}
                    </span>
                  </td>

                  {/* Search links */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                         className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border border-blue-800/40 transition-colors"
                         title="Search Google">G</a>
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                         className="text-[10px] px-1.5 py-0.5 rounded bg-pink-900/40 text-pink-300 hover:bg-pink-800/60 border border-pink-800/40 transition-colors"
                         title="Search Instagram">IG</a>
                      <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                         className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 hover:bg-indigo-800/60 border border-indigo-800/40 transition-colors"
                         title="Search Facebook">FB</a>
                    </div>
                  </td>

                  {/* Star */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => isLead ? onUnmarkLead(company.company_number) : onMarkLead(company)}
                      title={isLead ? 'Remove from leads' : 'Mark as lead'}
                      className={`inline-flex items-center justify-center p-1.5 transition-colors ${
                        isLead ? 'text-yellow-400 hover:text-gray-400' : 'text-gray-600 hover:text-yellow-400'
                      }`}
                    >
                      <Star size={16} fill={isLead ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <ExpandedRow
                    key={company.company_number + '-expand'}
                    company={company}
                    apiKey={apiKey}
                    colSpan={COL_COUNT}
                  />
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
