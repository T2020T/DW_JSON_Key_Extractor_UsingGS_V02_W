import React, { useState, useCallback, useEffect, useRef } from 'react';
import { IconUpload, IconCopy, IconFileText, IconTable, IconPdf, IconPrinter, IconX, IconChevronDown, IconCheck, IconHelp } from './components/Icons';

// Enhance window object for jsPDF libraries loaded via CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

type Mode = 'json' | 'url';

const fileTypeCategories = {
  Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  Documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.rtf'],
  Audio: ['.mp3', '.wav', '.aac', '.ogg', '.flac'],
  Video: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  Archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
};

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('json');

  // State for JSON Extractor
  const [jsonInput, setJsonInput] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [keySearch, setKeySearch] = useState<string>('');
  const [filteredKeys, setFilteredKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [extractedValues, setExtractedValues] = useState<any[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  
  // State for URL Extractor
  const [textInput, setTextInput] = useState<string>('');
  const [rawUrls, setRawUrls] = useState<string[]>([]);
  const [extractedUrls, setExtractedUrls] = useState<string[]>([]);
  const [sortedUrls, setSortedUrls] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('asc');
  const [showUniqueUrls, setShowUniqueUrls] = useState<boolean>(true);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [isFiletypeFilterOpen, setIsFiletypeFilterOpen] = useState<boolean>(false);
  const [copiedUrls, setCopiedUrls] = useState<boolean>(false);
  const [regexFilter, setRegexFilter] = useState<string>('');
  const [isRegexValid, setIsRegexValid] = useState<boolean>(true);
  const [showRegexHelp, setShowRegexHelp] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filetypeFilterRef = useRef<HTMLDivElement>(null);

  // --- JSON Extractor Logic ---

  const getAllKeys = useCallback((data: any): string[] => {
    const keys = new Set<string>();
    const findKeys = (current: any) => {
      if (current === null || typeof current !== 'object') return;
      if (Array.isArray(current)) {
        current.forEach(item => findKeys(item));
      } else {
        Object.keys(current).forEach(key => {
          keys.add(key);
          findKeys(current[key]);
        });
      }
    };
    findKeys(data);
    return Array.from(keys).sort();
  }, []);

  const getValuesForKey = useCallback((data: any, key: string): any[] => {
    const values: any[] = [];
    const findValues = (current: any) => {
      if (current === null || typeof current !== 'object') return;
      if (Array.isArray(current)) {
        current.forEach(item => findValues(item));
      } else {
        Object.keys(current).forEach(k => {
          if (k === key) values.push(current[k]);
          findValues(current[k]);
        });
      }
    };
    findValues(data);
    return values;
  }, []);

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJsonInput = e.target.value;
    setJsonInput(newJsonInput);

    if (newJsonInput.trim() === '') {
      setParsedJson(null);
      setAllKeys([]);
      setSelectedKey('');
      setExtractedValues([]);
      setJsonError(null);
      setKeySearch('');
      return;
    }

    try {
      const json = JSON.parse(newJsonInput);
      setParsedJson(json);
      setAllKeys(getAllKeys(json));
      setSelectedKey('');
      setKeySearch('');
      setJsonError(null);
    } catch (err) {
      setJsonError('Invalid JSON format.');
      setParsedJson(null);
      setAllKeys([]);
      setSelectedKey('');
      setKeySearch('');
    }
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJsonInput(text);
        try {
          const json = JSON.parse(text);
          setParsedJson(json);
          setAllKeys(getAllKeys(json));
          setSelectedKey('');
          setKeySearch('');
          setJsonError(null);
        } catch (err) {
          setJsonError('Invalid JSON format in the uploaded file.');
          setParsedJson(null);
          setAllKeys([]);
          setSelectedKey('');
          setKeySearch('');
        }
      };
      reader.readAsText(file);
    }
  };
  
  useEffect(() => {
    if (selectedKey && parsedJson) {
      setExtractedValues(getValuesForKey(parsedJson, selectedKey));
    } else {
      setExtractedValues([]);
    }
  }, [selectedKey, parsedJson, getValuesForKey]);

  useEffect(() => {
    const lowercasedFilter = keySearch.toLowerCase();
    setFilteredKeys(
      allKeys.filter(key => key.toLowerCase().includes(lowercasedFilter))
    );
  }, [keySearch, allKeys]);


  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const createPrintWindow = (title: string, contentHtml: string) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 1rem; }
                pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f6f8fa; padding: 1rem; border-radius: 6px; border: 1px solid #d1d5da; font-family: monospace; }
                ul { list-style-type: none; padding: 0; }
                li { padding: 0.25rem 0; border-bottom: 1px solid #eee; word-break: break-all; }
              </style>
            </head>
            <body>${contentHtml}<script>window.addEventListener('load', () => window.print());</script></body>
          </html>
        `);
        printWindow.document.close();
      }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(extractedValues, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };
  const handleSaveTxt = () => downloadFile('extracted_values.txt', JSON.stringify(extractedValues, null, 2), 'text/plain');
  const handleSaveCsv = () => {
    const header = `"${selectedKey}"\n`;
    const rows = extractedValues.map(value => `"${typeof value === 'object' ? JSON.stringify(value).replace(/"/g, '""') : String(value).replace(/"/g, '""')}"`).join('\n');
    downloadFile('extracted_values.csv', header + rows, 'text/csv');
  };
  const handleSavePdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('Courier'); doc.setFontSize(10);
    doc.text(`Values for key: "${selectedKey}"`, 10, 10);
    const content = JSON.stringify(extractedValues, null, 2);
    doc.text(doc.splitTextToSize(content, 180), 10, 20);
    doc.save('extracted_values.pdf');
  };
  const handlePrint = () => {
    const content = JSON.stringify(extractedValues, null, 2).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    createPrintWindow(`Print Extracted Values - ${selectedKey}`, `<h2>Values for key: "${selectedKey}"</h2><pre>${content}</pre>`);
  };

  // --- URL Extractor Logic ---
  
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };
  
  const handleUrlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setTextInput(event.target?.result as string);
      reader.readAsText(file);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (filetypeFilterRef.current && !filetypeFilterRef.current.contains(event.target as Node)) {
            setIsFiletypeFilterOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // This regex is more robust to avoid capturing trailing punctuation like commas, periods, or parts of HTML tags.
    const urlRegex = /(?:https?|ftp):\/\/[^\s<>()"]*[^\s<>()".,;:?!']/gi;
    setRawUrls(textInput.match(urlRegex) || []);
  }, [textInput]);

    const handleRegexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRegex = e.target.value;
        setRegexFilter(newRegex);
        if (newRegex === '') {
            setIsRegexValid(true);
            return;
        }
        try {
            new RegExp(newRegex);
            setIsRegexValid(true);
        } catch (error) {
            setIsRegexValid(false);
        }
    };

  useEffect(() => {
      let processedUrls = showUniqueUrls ? Array.from(new Set(rawUrls)) : [...rawUrls];

      if (selectedFileTypes.length > 0) {
          processedUrls = processedUrls.filter(url => {
              try {
                  const path = new URL(url).pathname.toLowerCase();
                  return selectedFileTypes.some(ext => path.endsWith(ext));
              } catch {
                  return false;
              }
          });
      }
      
      if (regexFilter && isRegexValid) {
        try {
            const regex = new RegExp(regexFilter, 'i');
            processedUrls = processedUrls.filter(url => regex.test(url));
        } catch {} // Should be caught by isRegexValid, but included for safety
      }
      
      setExtractedUrls(processedUrls);
  }, [rawUrls, showUniqueUrls, selectedFileTypes, regexFilter, isRegexValid]);

  useEffect(() => {
    const getUrlDetail = (url: string, part: 'protocol' | 'hostname' | 'extension') => {
      try {
        const urlObj = new URL(url);
        if (part === 'extension') {
          const path = urlObj.pathname;
          const ext = path.substring(path.lastIndexOf('.'));
          return ext.length > 1 ? ext : 'zz_no_extension'; // Sort no-extension last
        }
        return urlObj[part];
      } catch {
        return '';
      }
    };

    let sorted = [...extractedUrls];
    switch (sortOption) {
      case 'asc': sorted.sort((a, b) => a.localeCompare(b)); break;
      case 'desc': sorted.sort((a, b) => b.localeCompare(a)); break;
      case 'domain': sorted.sort((a, b) => getUrlDetail(a, 'hostname').localeCompare(getUrlDetail(b, 'hostname'))); break;
      case 'protocol': sorted.sort((a, b) => getUrlDetail(a, 'protocol').localeCompare(getUrlDetail(b, 'protocol'))); break;
      case 'filetype': sorted.sort((a, b) => getUrlDetail(a, 'extension').localeCompare(getUrlDetail(b, 'extension'))); break;
    }
    setSortedUrls(sorted);
  }, [extractedUrls, sortOption]);

  const handleCopyUrls = () => {
    const urlListString = sortedUrls.join('\n');
    navigator.clipboard.writeText(urlListString);
    setCopiedUrls(true);
    setTimeout(() => setCopiedUrls(false), 2000);
  };
  const handleSaveUrlsTxt = () => downloadFile('extracted_urls.txt', sortedUrls.join('\n'), 'text/plain');
  const handleSaveUrlsCsv = () => downloadFile('extracted_urls.csv', 'URL\n' + sortedUrls.map(url => `"${url.replace(/"/g, '""')}"`).join('\n'), 'text/csv');
  const handleSaveUrlsPdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    (doc as any).autoTable({
        head: [['Extracted URLs']],
        body: sortedUrls.map(url => [url]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [38, 44, 58] }
    });
    doc.save('extracted_urls.pdf');
  };
  const handlePrintUrls = () => {
    const content = `<h2>Extracted URLs (${sortedUrls.length})</h2><ul>${sortedUrls.map(url => `<li>${url.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`).join('')}</ul>`;
    createPrintWindow('Print Extracted URLs', content);
  };
  
  const handleFileTypeChange = (ext: string) => {
    setSelectedFileTypes(prev => prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]);
  };

  const TabButton: React.FC<{ currentMode: Mode, targetMode: Mode, children: React.ReactNode }> = ({ currentMode, targetMode, children }) => (
    <button onClick={() => setMode(targetMode)} className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${currentMode === targetMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}>
        {children}
    </button>
  );

  const RegexCheatsheet: React.FC = () => (
    <div className="p-4 bg-gray-900 rounded-lg border-2 border-gray-700 text-gray-400 text-xs space-y-4 transition-all duration-300">
        <h4 className="font-bold text-gray-200 text-sm">Regex Cheatsheet</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <p className="font-bold text-gray-300 mb-1">Characters</p>
                <p><code><span className="text-teal-400">.</span></code> - Any character (except newline)</p>
                <p><code><span className="text-teal-400">\d</span></code> - Any digit (0-9)</p>
                <p><code><span className="text-teal-400">\w</span></code> - Word character (a-z, A-Z, 0-9, _)</p>
                <p><code><span className="text-teal-400">\s</span></code> - Whitespace character</p>
                <p><code><span className="text-teal-400">[abc]</span></code> - Matches 'a', 'b', or 'c'</p>
                <p><code><span className="text-teal-400">[^abc]</span></code> - Not 'a', 'b', or 'c'</p>
            </div>
            <div>
                <p className="font-bold text-gray-300 mb-1">Anchors</p>
                <p><code><span className="text-teal-400">^</span></code> - Start of the string</p>
                <p><code><span className="text-teal-400">$</span></code> - End of the string</p>
                <p><code><span className="text-teal-400">\b</span></code> - Word boundary</p>
            </div>
            <div>
                <p className="font-bold text-gray-300 mb-1">Quantifiers</p>
                <p><code><span className="text-teal-400">*</span></code> - 0 or more times</p>
                <p><code><span className="text-teal-400">+</span></code> - 1 or more times</p>
                <p><code><span className="text-teal-400">?</span></code> - 0 or 1 time</p>
                <p><code><span className="text-teal-400">{`{3}`}</span></code> - Exactly 3 times</p>
                <p><code><span className="text-teal-400">{`{2,4}`}</span></code> - 2 to 4 times</p>
            </div>
             <div>
                <p className="font-bold text-gray-300 mb-1">Grouping & Logic</p>
                <p><code><span className="text-teal-400">(...)</span></code> - Capture group</p>
                <p><code><span className="text-teal-400">a|b</span></code> - Matches 'a' or 'b'</p>
                 <p className="font-bold text-gray-300 mt-2 mb-1">Escaping</p>
                 <p><code><span className="text-teal-400">\</span></code> - Escape special chars (e.g., <code>\.</code> for a literal dot)</p>
            </div>
        </div>
        <div>
            <p className="font-bold text-gray-300 mb-1">URL Examples</p>
            <p><code><span className="text-teal-400">google</span></code> - Contains "google"</p>
            <p><code><span className="text-teal-400">^https</span></code> - Starts with "https"</p>
            <p><code><span className="text-teal-400">\.(com|org)$</span></code> - Ends with ".com" or ".org"</p>
            <p><code><span className="text-teal-400">/users/\d+</span></code> - Matches e.g., /users/12345</p>
        </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Data Extractor Pro
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Extract keys from JSON or URLs from any text. Simple, powerful, and fast.
          </p>
        </header>

        <div className="border-b border-gray-700">
            <TabButton currentMode={mode} targetMode='json'>JSON Key Extractor</TabButton>
            <TabButton currentMode={mode} targetMode='url'>URL Extractor</TabButton>
        </div>

        {mode === 'json' && (
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-800 p-6 rounded-b-lg">
              {/* JSON Input Section */}
              <div className="flex flex-col gap-4">
                 <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-gray-700 pb-2">1. Provide JSON Data</h2>
                <div className="relative">
                  <textarea value={jsonInput} onChange={handleJsonInputChange} placeholder="Paste your JSON here..." className={`w-full h-80 p-4 bg-gray-900 border-2 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${jsonError ? 'border-red-500' : 'border-gray-700'}`}/>
                  {jsonInput && <button onClick={() => { setJsonInput(''); handleJsonInputChange({ target: { value: '' } } as any); }} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors" aria-label="Clear input"><IconX /></button>}
                </div>
                {jsonError && <p className="text-red-400 text-sm">{jsonError}</p>}
                <div className="flex items-center justify-center"><span className="text-gray-500">OR</span></div>
                <input type="file" accept=".json" onChange={handleJsonFileChange} className="hidden" ref={fileInputRef} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"><IconUpload /> Upload a .json file</button>
              </div>

              {/* JSON Output Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-gray-700 pb-2">2. Select Key & Get Values</h2>
                {allKeys.length > 0 && (
                  <div className="relative">
                    <input type="text" value={keySearch} onChange={(e) => setKeySearch(e.target.value)} placeholder={`Search from ${allKeys.length} keys...`} className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    {keySearch && <button onClick={() => setKeySearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" aria-label="Clear search"><IconX /></button>}
                  </div>
                )}
                <div className="relative">
                   <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} disabled={allKeys.length === 0} className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">{allKeys.length === 0 ? 'No keys found' : filteredKeys.length === 0 ? 'No matching keys found' : `${filteredKeys.length} of ${allKeys.length} keys... Select a key`}</option>
                    {filteredKeys.map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><IconChevronDown /></div>
                </div>
                <div className="relative bg-gray-900 border-2 border-gray-700 rounded-lg p-4 h-80 overflow-auto">
                    {extractedValues.length > 0 && (
                        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors" aria-label="Copy output">
                            {copiedJson ? <IconCheck /> : <IconCopy />}
                        </button>
                    )}
                    <pre className="text-sm text-teal-300 whitespace-pre-wrap break-all">{extractedValues.length > 0 ? JSON.stringify(extractedValues, null, 2) : <span className="text-gray-500">Extracted values will appear here...</span>}</pre>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <ActionButton icon={<IconCopy/>} text="Copy" onClick={handleCopy} disabled={!extractedValues.length}/>
                    <ActionButton icon={<IconFileText/>} text="TXT" onClick={handleSaveTxt} disabled={!extractedValues.length}/>
                    <ActionButton icon={<IconTable/>} text="CSV" onClick={handleSaveCsv} disabled={!extractedValues.length}/>
                    <ActionButton icon={<IconPdf/>} text="PDF" onClick={handleSavePdf} disabled={!extractedValues.length}/>
                    <ActionButton icon={<IconPrinter/>} text="Print" onClick={handlePrint} disabled={!extractedValues.length}/>
                </div>
              </div>
            </main>
        )}
        
        {mode === 'url' && (
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-800 p-6 rounded-b-lg">
                {/* URL Input Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-gray-700 pb-2">1. Provide Any Text</h2>
                    <div className="relative">
                        <textarea value={textInput} onChange={handleTextInputChange} placeholder="Paste any text containing URLs here..." className="w-full h-80 p-4 bg-gray-900 border-2 border-gray-700 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"/>
                        {textInput && <button onClick={() => setTextInput('')} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors" aria-label="Clear input"><IconX /></button>}
                    </div>
                    <div className="flex items-center justify-center"><span className="text-gray-500">OR</span></div>
                    <input type="file" onChange={handleUrlFileChange} className="hidden" ref={fileInputRef} />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"><IconUpload /> Upload a file</button>
                </div>
                
                {/* URL Output Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-gray-700 pb-2">2. Get Extracted URLs</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="relative">
                               <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} disabled={extractedUrls.length === 0} className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                <option value="asc">Sort: Ascending</option><option value="desc">Sort: Descending</option><option value="domain">Sort by Domain</option><option value="protocol">Sort by Protocol</option><option value="filetype">Sort by File Type</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><IconChevronDown /></div>
                           </div>
                           <div className="relative" ref={filetypeFilterRef}>
                                <button onClick={() => setIsFiletypeFilterOpen(o => !o)} disabled={rawUrls.length === 0} className="w-full text-left px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span>{selectedFileTypes.length > 0 ? `Filter by Type (${selectedFileTypes.length})` : 'Filter by File Type'}</span><IconChevronDown/>
                                </button>
                                {isFiletypeFilterOpen && (
                                    <div className="absolute z-10 top-full mt-2 w-full max-h-60 overflow-y-auto bg-gray-900 border-2 border-gray-700 rounded-lg p-2 shadow-lg">
                                        <button onClick={() => setSelectedFileTypes([])} className="text-xs text-blue-400 hover:underline mb-2">Clear All</button>
                                        {Object.entries(fileTypeCategories).map(([category, exts]) => (
                                            <div key={category} className="mb-2"><p className="text-sm font-bold text-gray-400 mb-1">{category}</p>
                                            {exts.map(ext => (<label key={ext} className="flex items-center gap-2 text-sm text-gray-300 hover:bg-gray-800 p-1 rounded-md cursor-pointer"><input type="checkbox" checked={selectedFileTypes.includes(ext)} onChange={() => handleFileTypeChange(ext)} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>{ext}</label>))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                           </div>
                        </div>
                        <div className="relative flex items-center">
                           <input type="text" value={regexFilter} onChange={handleRegexChange} placeholder="Filter with Custom Regex..." className={`w-full pl-4 pr-10 py-3 bg-gray-900 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${!isRegexValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'}`} disabled={rawUrls.length === 0}/>
                           <button onClick={() => setShowRegexHelp(o => !o)} className="absolute right-3 text-gray-400 hover:text-white" aria-label="Toggle Regex Help"><IconHelp/></button>
                        </div>
                        {!isRegexValid && <p className="text-red-400 text-xs mt-1">Invalid Regex pattern.</p>}
                        {showRegexHelp && <RegexCheatsheet />}
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"><input type="checkbox" checked={showUniqueUrls} onChange={e => setShowUniqueUrls(e.target.checked)} disabled={rawUrls.length === 0} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 disabled:opacity-50"/>Show unique URLs only</label>
                        </div>
                    </div>
                    <div className="relative bg-gray-900 border-2 border-gray-700 rounded-lg p-4 h-80 overflow-auto mt-4">
                        <div className="text-gray-400 text-sm mb-2">{sortedUrls.length} URL(s) found</div>
                        {sortedUrls.length > 0 && (
                            <button onClick={handleCopyUrls} className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 hover:text-white transition-colors" aria-label="Copy URLs">
                                {copiedUrls ? <IconCheck /> : <IconCopy />}
                            </button>
                        )}
                        {sortedUrls.length > 0 ? (
                            <ul className="text-sm text-teal-300 space-y-1">{sortedUrls.map((url, index) => <li key={index} className="break-all">{url}</li>)}</ul>
                        ) : <span className="text-gray-500">Extracted URLs will appear here...</span>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        <ActionButton icon={<IconCopy/>} text="Copy" onClick={handleCopyUrls} disabled={!sortedUrls.length}/>
                        <ActionButton icon={<IconFileText/>} text="TXT" onClick={handleSaveUrlsTxt} disabled={!sortedUrls.length}/>
                        <ActionButton icon={<IconTable/>} text="CSV" onClick={handleSaveUrlsCsv} disabled={!sortedUrls.length}/>
                        <ActionButton icon={<IconPdf/>} text="PDF" onClick={handleSaveUrlsPdf} disabled={!sortedUrls.length}/>
                        <ActionButton icon={<IconPrinter/>} text="Print" onClick={handlePrintUrls} disabled={!sortedUrls.length}/>
                    </div>
                </div>
            </main>
        )}
      </div>
    </div>
  );
};

interface ActionButtonProps {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
    disabled: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center justify-center gap-1 p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 disabled:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
        {icon}
        <span className="text-xs font-medium">{text}</span>
    </button>
);

export default App;