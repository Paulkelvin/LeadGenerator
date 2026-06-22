import { Key, ArrowRight } from 'lucide-react';

export default function SetupScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md w-full">
        <div className="w-16 h-16 bg-blue-900/40 border border-blue-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Key size={28} className="text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Add your API key to get started</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          This app connects to the Companies House API to find newly registered UK businesses.
          You'll need a free API key to use it.
        </p>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-left space-y-4 mb-6">
          <h3 className="font-semibold text-gray-200 text-sm uppercase tracking-wide">
            How to get your free key
          </h3>
          {[
            { step: '1', text: 'Visit developer.company-information.service.gov.uk' },
            { step: '2', text: 'Create a free account and sign in' },
            { step: '3', text: 'Create an application to get your API key' },
            { step: '4', text: 'Paste the key in the bar at the top of this page' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-800 text-blue-200 text-xs font-bold flex items-center justify-center">
                {step}
              </span>
              <span className="text-sm text-gray-400">{text}</span>
            </div>
          ))}
        </div>
        <a
          href="https://developer.company-information.service.gov.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
        >
          Get your free API key
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
