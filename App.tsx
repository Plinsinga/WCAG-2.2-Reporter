import React, { useState } from 'react';
import { UrlForm } from './components/UrlForm';
import { ReportView } from './components/ReportView';
import { ScanUrl, ReportData } from './types';
import { generateReport } from './services/geminiService';
import { FileText, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [urls, setUrls] = useState<ScanUrl[]>([{ id: crypto.randomUUID(), url: '' }]);
  const [inspectorName, setInspectorName] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const validUrls = urls.filter(u => u.url.trim() !== '');
      if (validUrls.length === 0) {
        throw new Error("Voeg minimaal één geldige URL toe.");
      }

      const generatedReport = await generateReport(validUrls, inspectorName);
      setReport(generatedReport);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Er is een fout opgetreden bij het genereren van het rapport.");
    } finally {
      setIsLoading(false);
    }
  };

  if (report) {
    return (
      <div className="min-h-screen bg-dormio-light">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 no-print shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="font-serif font-bold text-dormio-purple text-xl flex items-center gap-2">
              <span className="bg-dormio-purple text-white p-1 rounded"><FileText size={18} /></span> WCAG Rapport
            </h1>
            <button 
              onClick={() => setReport(null)}
              className="text-sm text-gray-600 hover:text-dormio-red underline transition-colors"
            >
              Nieuw Onderzoek Starten
            </button>
          </div>
        </div>
        <ReportView report={report} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dormio-purple to-[#3D0E24] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-dormio-red opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-dormio-yellow opacity-5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="text-center mb-8 max-w-2xl relative z-10">
        <h1 className="text-5xl font-serif font-bold text-white mb-4">WCAG 2.2 AA Generator</h1>
        <p className="text-dormio-light opacity-90 text-lg font-light">
          Genereer automatisch toegankelijkheidsrapporten voor uw websites en applicaties. 
          Voldoet aan de structuur van professionele audits.
        </p>
      </div>

      {error && (
        <div className="bg-white/10 backdrop-blur text-white border border-red-400/50 p-4 rounded-lg mb-6 max-w-4xl w-full flex items-center gap-2 relative z-10">
          <div className="font-bold text-dormio-red bg-white px-2 rounded">Fout:</div> {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white p-12 rounded-xl shadow-2xl flex flex-col items-center relative z-10">
          <Loader2 className="w-12 h-12 text-dormio-purple animate-spin mb-4" />
          <h3 className="text-2xl font-serif font-bold text-dormio-purple">Rapport Genereren...</h3>
          <p className="text-gray-500 mt-2">De AI analyseert de URL's en stelt het rapport samen.</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-6 overflow-hidden">
            <div className="bg-dormio-red h-1.5 rounded-full animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full">
            <UrlForm 
            urls={urls} 
            setUrls={setUrls}
            inspectorName={inspectorName}
            setInspectorName={setInspectorName}
            onGenerate={handleGenerate} 
            isLoading={isLoading}
            />
        </div>
      )}
      
      <footer className="mt-12 text-dormio-light/50 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} WCAG AI Auditor</p>
      </footer>
    </div>
  );
};

export default App;