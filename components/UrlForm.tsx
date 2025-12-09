import React, { useState, useEffect } from 'react';
import { ScanUrl, SavedUrlSet } from '../types';
import { Plus, Trash2, Lock, Globe, Save, FolderOpen, X, Clock, User, MoreVertical, KeyRound } from 'lucide-react';

interface UrlFormProps {
  urls: ScanUrl[];
  setUrls: React.Dispatch<React.SetStateAction<ScanUrl[]>>;
  inspectorName: string;
  setInspectorName: (name: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const UrlForm: React.FC<UrlFormProps> = ({ urls, setUrls, inspectorName, setInspectorName, onGenerate, isLoading }) => {
  // Saved Sets State
  const [savedSets, setSavedSets] = useState<SavedUrlSet[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wcag_saved_sets');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  
  // UI State for row menus and expanded credentials
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedCredentials, setExpandedCredentials] = useState<Set<string>>(new Set());

  // Persist to localstorage whenever savedSets changes
  useEffect(() => {
    localStorage.setItem('wcag_saved_sets', JSON.stringify(savedSets));
  }, [savedSets]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const addUrl = () => {
    if (urls.length < 10) {
      setUrls([...urls, { id: crypto.randomUUID(), url: '' }]);
    }
  };

  const removeUrl = (id: string) => {
    setUrls(urls.filter((u) => u.id !== id));
    // Cleanup expanded state
    const newExpanded = new Set(expandedCredentials);
    newExpanded.delete(id);
    setExpandedCredentials(newExpanded);
  };

  const updateUrl = (id: string, field: keyof ScanUrl, value: string) => {
    setUrls(urls.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const toggleCredentials = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing menu immediately if triggered from inside
    const newSet = new Set(expandedCredentials);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCredentials(newSet);
    setOpenMenuId(null);
  };

  const handleMenuClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Saved Sets Logic
  const handleSaveSet = () => {
    if (!newSetName.trim()) return;
    
    const newSet: SavedUrlSet = {
      id: crypto.randomUUID(),
      name: newSetName.trim(),
      urls: urls,
      createdAt: new Date().toISOString(),
    };

    setSavedSets([newSet, ...savedSets]);
    setNewSetName('');
    setShowSaveInput(false);
  };

  const handleLoadSet = (set: SavedUrlSet) => {
    // We regenerate IDs to avoid potential conflicts
    const freshUrls = set.urls.map(u => ({ ...u, id: crypto.randomUUID() }));
    setUrls(freshUrls);
    
    // Auto-expand credentials if they exist in the saved set
    const idsWithCreds = freshUrls.filter(u => u.username || u.password).map(u => u.id);
    setExpandedIdsFromLoad(idsWithCreds);

    setShowLoadMenu(false);
  };

  const setExpandedIdsFromLoad = (ids: string[]) => {
      setExpandedCredentials(new Set(ids));
  }

  const handleDeleteSet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Weet je zeker dat je deze set wilt verwijderen?')) {
      setSavedSets(savedSets.filter(s => s.id !== id));
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl border-0 max-w-4xl mx-auto my-8 min-h-[500px]">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-serif font-bold text-dormio-purple">Start Onderzoek</h2>
          <span className="bg-dormio-light text-dormio-purple text-xs font-bold px-3 py-1 rounded-full border border-dormio-purple/10">
            {urls.length}/10 URL's
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm text-gray-500">Voer maximaal 10 URL's in voor de WCAG 2.2 AA controle.</p>
          <button 
            onClick={() => setShowLoadMenu(!showLoadMenu)}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${showLoadMenu ? 'bg-dormio-light text-dormio-purple' : 'text-gray-500 hover:text-dormio-purple hover:bg-dormio-light'}`}
          >
            <FolderOpen size={16} />
            <span>Opgeslagen sets ({savedSets.length})</span>
          </button>
        </div>
      </div>

      {/* Load Menu Area */}
      {showLoadMenu && (
        <div className="mb-6 bg-dormio-light border border-dormio-purple/10 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-dormio-purple font-serif">Kies een set om te laden</h3>
            <button onClick={() => setShowLoadMenu(false)} className="text-gray-400 hover:text-dormio-red transition-colors">
              <X size={16} />
            </button>
          </div>
          
          {savedSets.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nog geen opgeslagen sets.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {savedSets.map((set) => (
                <div 
                  key={set.id}
                  onClick={() => handleLoadSet(set)}
                  className="bg-white p-4 rounded-lg border border-transparent shadow-sm hover:border-dormio-purple/30 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-800 group-hover:text-dormio-purple">{set.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {new Date(set.createdAt).toLocaleDateString('nl-NL')}
                        <span className="mx-1">•</span> {set.urls.length} URL's
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSet(set.id, e)}
                      className="text-gray-300 hover:text-dormio-red p-1 rounded hover:bg-red-50 transition-colors"
                      title="Set verwijderen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspector Input */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-bold text-gray-700 mb-2">Naam Inspecteur</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type="text"
                className="pl-10 w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-dormio-purple focus:border-dormio-purple block p-2.5 outline-none transition-shadow"
                placeholder="Vul uw naam in voor op het rapport"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
            />
        </div>
      </div>

      {/* URLs List */}
      <div className="space-y-4">
        {urls.map((item) => (
          <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all hover:border-dormio-purple/30 group relative">
            <div className="flex gap-3 items-center">
              <div className="flex-grow flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400 group-hover:text-dormio-purple transition-colors flex-shrink-0" />
                  <input
                    type="url"
                    placeholder="https://www.voorbeeld.nl/pagina"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-dormio-purple focus:border-dormio-purple block p-2.5 outline-none transition-shadow"
                    value={item.url}
                    onChange={(e) => updateUrl(item.id, 'url', e.target.value)}
                  />
              </div>

              <div className="relative flex-shrink-0">
                  <button
                    onClick={(e) => handleMenuClick(item.id, e)}
                    className={`p-2 rounded-lg transition-colors ${openMenuId === item.id ? 'bg-dormio-purple text-white' : 'text-gray-400 hover:text-dormio-purple hover:bg-dormio-light'}`}
                    title="Opties"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={(e) => toggleCredentials(item.id, e)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-dormio-purple flex items-center gap-2 transition-colors"
                      >
                         <KeyRound size={16} /> 
                         {expandedCredentials.has(item.id) ? 'Verberg inloggegevens' : 'Inloggegevens'}
                      </button>
                    </div>
                  )}
              </div>

              <button
                onClick={() => removeUrl(item.id)}
                disabled={urls.length === 1}
                className="p-2 text-gray-400 hover:text-dormio-red hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Verwijder URL"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Collapsible Credentials Section */}
            {expandedCredentials.has(item.id) && (
              <div className="mt-4 pl-0 sm:pl-7 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                  <div className="absolute -top-2 right-12 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Lock size={12} /> Inloggegevens voor audit
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Gebruikersnaam</label>
                      <input
                        type="text"
                        placeholder="Gebruikersnaam"
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-dormio-purple focus:border-dormio-purple block p-2 outline-none transition-shadow"
                        value={item.username || ''}
                        onChange={(e) => updateUrl(item.id, 'username', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Wachtwoord</label>
                      <input
                        type="text" 
                        placeholder="Wachtwoord"
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-dormio-purple focus:border-dormio-purple block p-2 outline-none transition-shadow"
                        value={item.password || ''}
                        onChange={(e) => updateUrl(item.id, 'password', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Input Area */}
      {showSaveInput && (
        <div className="mt-4 p-4 bg-dormio-light border border-dormio-purple/10 rounded-lg flex flex-col sm:flex-row gap-3 items-end sm:items-center animate-in fade-in slide-in-from-bottom-2">
          <div className="flex-grow w-full">
            <label className="block text-xs font-bold text-dormio-purple mb-1">Naam voor deze set</label>
            <input 
              type="text" 
              autoFocus
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="Bijv. Webshop Check Q1"
              className="w-full bg-white text-gray-900 border-gray-300 rounded-md text-sm focus:ring-dormio-purple focus:border-dormio-purple p-2 border"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSet()}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
              onClick={() => setShowSaveInput(false)}
              className="flex-1 sm:flex-none py-2 px-3 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuleren
            </button>
            <button 
              onClick={handleSaveSet}
              disabled={!newSetName.trim()}
              className="flex-1 sm:flex-none py-2 px-4 text-sm text-white bg-dormio-purple rounded-md hover:bg-dormio-darkpurple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <Save size={14} /> Opslaan
            </button>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={addUrl}
            disabled={urls.length >= 10}
            className="text-dormio-purple bg-dormio-light hover:bg-dormio-purple/10 font-bold rounded-lg text-sm px-4 py-3 inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-dormio-purple/10"
          >
            <Plus className="w-4 h-4" />
            URL Toevoegen
          </button>
          
          {!showSaveInput && (
            <button
              onClick={() => setShowSaveInput(true)}
              className="text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold rounded-lg text-sm px-4 py-3 inline-flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Set Opslaan
            </button>
          )}
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading || urls.some(u => !u.url)}
          className="text-white bg-dormio-red hover:bg-red-700 font-bold rounded-lg text-sm px-8 py-3 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Rapport Genereren...' : 'Genereer Rapport'}
        </button>
      </div>
    </div>
  );
};