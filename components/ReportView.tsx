import React from 'react';
import { ReportData, WcagResult, WcagLevel } from '../types';
import { Printer, CheckCircle, XCircle, MinusCircle, Compass, FileText, MousePointerClick, Copy } from 'lucide-react';

interface ReportViewProps {
  report: ReportData;
}

export const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  const currentDate = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusIcon = (status: WcagResult) => {
    switch (status) {
      case WcagResult.PASS:
        return <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />;
      case WcagResult.FAIL:
        return <XCircle className="w-5 h-5 text-dormio-red inline mr-2" />;
      default:
        return <MinusCircle className="w-5 h-5 text-gray-400 inline mr-2" />;
    }
  };

  const getStatusClass = (status: WcagResult) => {
    switch (status) {
      case WcagResult.PASS:
        return 'bg-green-50 text-green-800 border-green-100';
      case WcagResult.FAIL:
        return 'bg-red-50 text-dormio-red border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const handleCopyToClipboard = () => {
    const reportElement = document.getElementById('report-content');
    
    if (reportElement) {
      const range = document.createRange();
      const selection = window.getSelection();
      
      if (selection) {
        selection.removeAllRanges();
        range.selectNodeContents(reportElement);
        selection.addRange(range);
        
        try {
          document.execCommand('copy');
          alert('Het rapport is gekopieerd! Open nu Google Docs of Word en plak de inhoud (Ctrl+V / Cmd+V).');
        } catch (err) {
          console.error('Kopiëren mislukt', err);
          alert('Kon niet automatisch kopiëren. Selecteer de tekst handmatig.');
        }
        
        selection.removeAllRanges();
      }
    }
  };

  const DormioCircles = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={`w-64 h-64 opacity-20 ${className}`}>
      <circle cx="70" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="130" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="60" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  return (
    <div id="report-content" className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-screen my-8 print:shadow-none print:my-0 print:max-w-none font-sans">
      
      {/* Cover Page */}
      <div className="min-h-[297mm] flex flex-col relative overflow-hidden page-break bg-gradient-to-br from-dormio-purple to-[#901B3B] text-white p-16">
        {/* Background Gradient Effect */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-t from-dormio-red to-transparent opacity-30 blur-3xl rounded-full translate-y-1/3 translate-x-1/3"></div>

        <div className="flex-grow flex flex-col justify-center relative z-10">
          <h1 className="text-6xl font-serif font-bold mb-6 leading-tight">
            WCAG 2.2 <br/>
            <span className="italic">gebruikerstest</span>
          </h1>
          <h2 className="text-3xl font-serif opacity-90">{report.meta.website}</h2>
          <div className="w-20 h-1 bg-dormio-red mt-8"></div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 text-sm opacity-90">
          <div>
            <p className="font-bold text-dormio-red uppercase tracking-wider mb-1">Opdrachtgever</p>
            <p className="font-serif text-xl">{report.meta.client}</p>
          </div>
          <div>
            <p className="font-bold text-dormio-red uppercase tracking-wider mb-1">Datum</p>
            <p className="font-serif text-xl">{currentDate}</p>
          </div>
          <div>
            <p className="font-bold text-dormio-red uppercase tracking-wider mb-1">Versie</p>
            <p className="font-serif text-xl">{report.meta.version}</p>
          </div>
          <div>
             <p className="font-bold text-dormio-red uppercase tracking-wider mb-1">Inspecteur</p>
            <p className="font-serif text-xl">{report.meta.inspector}</p>
          </div>
        </div>
      </div>

      {/* Summary Page */}
      <div className="p-16 min-h-[297mm] page-break bg-white">
        <div className="flex items-center gap-6 mb-12">
            <div className="relative">
                 <DormioCircles className="w-32 h-32 text-dormio-purple opacity-40 absolute -top-10 -left-10" />
                 <div className="relative z-10 bg-dormio-purple text-white p-4 rounded-full shadow-lg">
                    <FileText size={32} />
                 </div>
            </div>
            <div>
                 <h2 className="text-4xl font-serif font-bold text-dormio-purple">Samenvatting</h2>
                 <p className="text-gray-500 mt-1 uppercase tracking-widest text-sm font-bold">Overzicht bevindingen</p>
            </div>
        </div>
        
        <div className="prose prose-lg text-gray-700 leading-relaxed mb-12 max-w-none">
          {report.executiveSummary}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* WCAG 2.1 Card */}
          <div className="bg-dormio-light rounded-xl p-8 border border-white shadow-sm">
            <h4 className="text-2xl font-serif text-dormio-purple mb-6">WCAG 2.1 <span className="text-base font-sans font-normal opacity-70">(A + AA)</span></h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white pb-2">
                    <span className="font-medium text-gray-600">Niveau A</span>
                    <span className="font-bold text-dormio-purple">{report.summary.wcag21.levelA.passed} / {report.summary.wcag21.levelA.total}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white pb-2">
                    <span className="font-medium text-gray-600">Niveau AA</span>
                    <span className="font-bold text-dormio-purple">{report.summary.wcag21.levelAA.passed} / {report.summary.wcag21.levelAA.total}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-dormio-red">Totaal Score</span>
                    <span className="text-2xl font-serif font-bold text-dormio-purple">{Math.round((report.summary.wcag21.total.passed / report.summary.wcag21.total.total) * 100)}%</span>
                </div>
            </div>
          </div>

          {/* WCAG 2.2 Card */}
          <div className="bg-dormio-light rounded-xl p-8 border border-white shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-dormio-yellow opacity-20 rounded-bl-full"></div>
            <h4 className="text-2xl font-serif text-dormio-purple mb-6">WCAG 2.2 <span className="text-base font-sans font-normal opacity-70">(Nieuw)</span></h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white pb-2">
                    <span className="font-medium text-gray-600">Niveau A</span>
                    <span className="font-bold text-dormio-purple">{report.summary.wcag22.levelA.passed} / {report.summary.wcag22.levelA.total}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white pb-2">
                    <span className="font-medium text-gray-600">Niveau AA</span>
                    <span className="font-bold text-dormio-purple">{report.summary.wcag22.levelAA.passed} / {report.summary.wcag22.levelAA.total}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-dormio-red">Totaal Score</span>
                    <span className="text-2xl font-serif font-bold text-dormio-purple">{Math.round((report.summary.wcag22.total.passed / report.summary.wcag22.total.total) * 100)}%</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Principles & Findings */}
      {report.principles.map((principle, pIndex) => (
        <div key={principle.id} className="min-h-[297mm] page-break bg-white">
            {/* Header Section */}
            <div className="bg-dormio-light p-16 pb-12 relative overflow-hidden">
                <DormioCircles className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-96 h-96 text-dormio-purple opacity-10" />
                
                <div className="relative z-10 flex items-start gap-6">
                    <div className="bg-white p-4 rounded-full shadow-md text-dormio-purple">
                        {pIndex === 0 && <Compass size={40} />}
                        {pIndex === 1 && <FileText size={40} />}
                        {pIndex === 2 && <MousePointerClick size={40} />}
                        {pIndex === 3 && <CheckCircle size={40} />}
                    </div>
                    <div>
                        <span className="text-dormio-red font-bold tracking-widest uppercase text-sm">Principe {pIndex + 1}</span>
                        <h2 className="text-5xl font-serif font-bold text-dormio-purple mt-2">{principle.name}.</h2>
                        <p className="text-gray-600 mt-4 text-lg max-w-2xl">{principle.description}</p>
                    </div>
                </div>
            </div>

            <div className="p-16 pt-8 space-y-8">
            {principle.criteria.map((criterion, index) => (
              <div key={criterion.id} className="relative pl-12 pb-8 border-l-2 border-gray-100 last:border-l-0">
                {/* Number Circle */}
                <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-white shadow-sm ${criterion.result === WcagResult.PASS ? 'bg-green-600' : 'bg-dormio-red'}`}>
                    {index + 1}
                </div>

                <div className="flex items-baseline gap-4 mb-2 pt-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {criterion.name} <span className="text-sm font-normal text-gray-500 ml-2">({criterion.id})</span>
                  </h3>
                   <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${criterion.level === WcagLevel.A ? 'bg-gray-200 text-gray-600' : 'bg-gray-800 text-white'}`}>
                    Niveau {criterion.level}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">{criterion.description}</p>

                {/* Findings only if failed */}
                {criterion.result === WcagResult.FAIL && criterion.findings.length > 0 ? (
                  <div className="mt-6 grid gap-6">
                    {criterion.findings.map((finding, fIndex) => (
                      <div key={fIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-dormio-red"></div>
                        <h4 className="font-serif font-bold text-dormio-purple text-lg mb-2">Aandachtspunt</h4>
                        <p className="mb-4 text-gray-700">{finding.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                                <span className="font-bold text-gray-900 block mb-1">Locatie</span>
                                <span className="text-blue-600 break-all">{finding.location}</span>
                            </div>
                             <div className="bg-gray-50 p-3 rounded">
                                <span className="font-bold text-gray-900 block mb-1">Technisch detail</span>
                                <span className="text-gray-600">{finding.technicalDetails}</span>
                            </div>
                        </div>

                        <div className="mt-4 bg-green-50 p-4 rounded text-sm border border-green-100">
                          <span className="font-bold text-green-800 block mb-1 flex items-center gap-2"><CheckCircle size={14}/> Oplossing</span>
                          <span className="text-green-900">{finding.solution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle size={14} /> Voldoet
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 no-print z-50">
          <button
            onClick={handleCopyToClipboard}
            className="bg-white text-dormio-purple border-2 border-dormio-purple p-4 rounded-full shadow-lg hover:bg-dormio-light transition-all flex items-center gap-2 group"
            title="Kopieer voor Word/Google Docs"
          >
            <Copy className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium font-serif">Kopieer voor Docs</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-dormio-purple text-white p-4 rounded-full shadow-lg hover:bg-dormio-darkpurple transition-all flex items-center gap-2 group"
            title="Print / Opslaan als PDF"
          >
            <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-medium font-serif">Opslaan als PDF</span>
          </button>
      </div>
    </div>
  );
};