import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Play, Trash2, HelpCircle, ShieldCheck, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { SAMPLE_RAW_DATA, SAMPLE_VCF_DATA } from '../lib/demoData';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImportProgressState {
  isProcessing: boolean;
  current: number;
  total: number;
  filename: string;
}

interface ImportSectionProps {
  onImportFile: (content: string, filename: string) => void;
  onProcessRaw: (rawText: string) => void;
  onClearAll: () => void;
  onFileError?: (errorMsg: string) => void;
  totalRecords: number;
  importProgress?: ImportProgressState | null;
}

export const ImportSection: React.FC<ImportSectionProps> = ({
  onImportFile,
  onProcessRaw,
  onClearAll,
  onFileError,
  totalRecords,
  importProgress,
}) => {
  const [rawText, setRawText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndReadFile = (file: File) => {
    setErrorMessage(null);

    // 5MB Max Limit Check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const msg = `File size exceeds the 5MB limit (${fileSizeMB} MB). Please choose a smaller file.`;
      setErrorMessage(msg);
      if (onFileError) {
        onFileError(msg);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportFile(content, file.name);
      }
    };
    reader.onerror = () => {
      const msg = 'Failed to read the file. Please check file permissions or format.';
      setErrorMessage(msg);
      if (onFileError) onFileError(msg);
    };
    reader.readAsText(file, 'UTF-8');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndReadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndReadFile(file);
    }
  };

  const handleLoadSampleData = () => {
    setErrorMessage(null);
    setRawText(SAMPLE_RAW_DATA);
    onProcessRaw(SAMPLE_RAW_DATA);
  };

  const handleLoadSampleVCF = () => {
    setErrorMessage(null);
    onImportFile(SAMPLE_VCF_DATA, 'sample_contacts.vcf');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* 2. Import your contacts */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                2. Import your Contacts File
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Max 5 MB
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Upload your exported Apple/Android <b>.vcf</b> (vCard) or spreadsheet <b>.csv</b> file.
          </p>

          {/* Real-time Import Progress Bar if file is processing */}
          {importProgress && importProgress.isProcessing && (
            <div className="mb-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 animate-fade-in space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span>Processing {importProgress.filename}...</span>
                </div>
                <span>
                  {importProgress.total > 0
                    ? `${Math.round((importProgress.current / importProgress.total) * 100)}%`
                    : 'Parsing...'}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: importProgress.total > 0
                      ? `${Math.min(100, Math.round((importProgress.current / importProgress.total) * 100))}%`
                      : '50%',
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-blue-700 dark:text-blue-300">
                <span>{importProgress.current.toLocaleString()} contacts scanned</span>
                <span>{importProgress.total.toLocaleString()} total</span>
              </div>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 mb-3 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="fileInput"
              accept=".vcf,.csv,text/vcard,text/csv,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Click to select or drag & drop contact file
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Supports .VCF (vCard 2.1/3.0/4.0) & .CSV (up to 5MB max)
            </div>
          </div>

          {/* Privacy & Security Guarantee in Plain English */}
          <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 mb-3 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold">100% Private & Stays on Your Device:</span>{' '}
              <span className="text-emerald-800 dark:text-emerald-300">
                Your contacts never leave your phone or computer. Everything is updated directly in your browser with zero server uploads or external data storage.
              </span>
            </div>
          </div>

          {/* Error notice if file was too large */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            id="demoBtn"
            onClick={handleLoadSampleData}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Load Sample Contacts
          </button>

          <button
            onClick={handleLoadSampleVCF}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
          >
            Load Sample VCF
          </button>

          {totalRecords > 0 && (
            <button
              id="clearBtn"
              onClick={onClearAll}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 ml-auto flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All ({totalRecords})
            </button>
          )}
        </div>
      </div>

      {/* 3. Or paste raw records */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                3. Or Paste Raw Records
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {rawText ? `${rawText.split('\n').filter(Boolean).length} lines` : 'Empty'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Paste contacts line by line in <code>Name, Phone Number</code> format.
          </p>

          <textarea
            id="rawInput"
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const target = e.currentTarget;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const nextText = rawText.substring(0, start) + '\t' + rawText.substring(end);
                setRawText(nextText);
                // Set cursor position after the inserted tab on the next tick
                setTimeout(() => {
                  target.selectionStart = target.selectionEnd = start + 1;
                }, 0);
              }
            }}
            placeholder="Fatou Jobe, 7123456&#10;Baboucarr Sallah, 3123456&#10;Modou Lamin Ceesay, 6889900&#10;Lamin Touray, 9912345&#10;Gamtel HQ, 4291224"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed mb-2"
          />

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Format: <b>Contact Name, Phone Number</b> (separated by comma or tab)</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            id="processBtn"
            onClick={() => onProcessRaw(rawText)}
            disabled={!rawText.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Process Pasted Records
          </button>

          {rawText && (
            <button
              onClick={() => setRawText('')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 px-2 py-1 cursor-pointer"
            >
              Clear Text
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
