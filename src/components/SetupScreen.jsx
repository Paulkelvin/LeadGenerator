import { Key, ArrowRight } from 'lucide-react';

const CONFIG = {
  uk: {
    flag: '🇬🇧',
    title: 'Add your Companies House API key',
    description: 'This app connects to the Companies House API to find newly registered UK businesses. You\'ll need a free API key to use it.',
    steps: [
      'Visit developer.company-information.service.gov.uk',
      'Create a free account and sign in',
      'Create an application to get your API key',
      'Paste the key in the bar at the top of this page',
    ],
    btnLabel: 'Get your free API key',
    btnHref: 'https://developer.company-information.service.gov.uk/',
    accent: { icon: 'text-blue-400', bg: 'bg-blue-900/40', border: 'border-blue-700/50', badge: 'bg-blue-800 text-blue-200', btn: 'bg-blue-600 hover:bg-blue-500' },
  },
  nz: {
    flag: '🇳🇿',
    title: 'Add your NZBN API key',
    description: 'This app connects to the NZ NZBN API to find newly registered New Zealand businesses. You\'ll need a free API subscription key.',
    steps: [
      'Visit developer.business.govt.nz',
      'Create a free account and sign in',
      'Subscribe to the NZBN API (free tier)',
      'Paste the subscription key in the bar at the top of this page',
    ],
    btnLabel: 'Get your free NZBN key',
    btnHref: 'https://developer.business.govt.nz/',
    accent: { icon: 'text-emerald-400', bg: 'bg-emerald-900/40', border: 'border-emerald-700/50', badge: 'bg-emerald-800 text-emerald-200', btn: 'bg-emerald-700 hover:bg-emerald-600' },
  },
};

export default function SetupScreen({ country = 'uk' }) {
  const cfg = CONFIG[country] || CONFIG.uk;
  const { accent } = cfg;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md w-full">
        <div className={`w-16 h-16 ${accent.bg} border ${accent.border} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <Key size={28} className={accent.icon} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">{cfg.title}</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">{cfg.description}</p>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-left space-y-4 mb-6">
          <h3 className="font-semibold text-gray-200 text-sm uppercase tracking-wide">
            How to get your free key
          </h3>
          {cfg.steps.map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full ${accent.badge} text-xs font-bold flex items-center justify-center`}>
                {i + 1}
              </span>
              <span className="text-sm text-gray-400">{text}</span>
            </div>
          ))}
        </div>
        <a
          href={cfg.btnHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg transition-colors ${accent.btn}`}
        >
          {cfg.btnLabel}
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
