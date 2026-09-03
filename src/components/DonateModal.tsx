import React, { useState, useEffect } from 'react';
import {
  Heart,
  X,
  Copy,
  Check,
  Smartphone,
  Share2,
  Sparkles,
  ShieldCheck,
  Building2,
  Wallet
} from 'lucide-react';
import { executeShare } from '../utils/shareUtils';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: 'download' | 'navbar' | 'section';
}

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  triggerSource = 'navbar',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'mobile_money' | 'aps' | 'agib'>('wave');
  const [copiedShare, setCopiedShare] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2200);
  };

  const handleShareApp = async () => {
    const result = await executeShare();
    if (result.copied) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[86vh] my-auto z-10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gambia Flag Gradient Bar */}
        <div
          className="h-1.5 sm:h-2 w-full bg-[linear-gradient(to_right,#CE1126_0%,#CE1126_32%,#FFFFFF_38%,#0C1C8C_44%,#0C1C8C_56%,#FFFFFF_62%,#3A7728_68%,#3A7728_100%)] shrink-0"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2.5 sm:gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-rose-500/20">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500/20" />
            </div>
            <div className="min-w-0">
              <h2
                id="donate-modal-title"
                className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight"
              >
                {triggerSource === 'download' ? 'Export Done! Support Creator' : 'Support & Show Appreciation'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Built with care for The Gambia's PURA 9-Digit Numbering Transition.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content (flex-1 min-h-0 enables robust internal scrolling) */}
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 min-h-0 space-y-3.5 sm:space-y-4 text-slate-800 dark:text-slate-200 text-xs sm:text-sm overscroll-contain">
          {/* Download celebratory callout if triggered from download */}
          {triggerSource === 'download' && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2.5 sm:gap-3 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <p className="font-bold text-emerald-800 dark:text-emerald-300">
                  Your upgraded contacts file was generated successfully!
                </p>
                <p className="mt-0.5 text-emerald-700 dark:text-emerald-300/90 leading-relaxed text-[11px] sm:text-xs">
                  If this saved you hours of work, consider sending a small tip to show appreciation.
                </p>
              </div>
            </div>
          )}

          {/* Value proposition & privacy reminder */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Free &amp; 100% On-Device Privacy Guaranteed</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This Web app, which can be installable as a mobile app on all devices is provided 100% free, zero ads, secure data privacy, zero tracking, and Zero paywalls (No Section on the web app asks for Premium, Codes of any sort from you) so every Gambian, Resident and Businesses can migrate seamlessly. Your Support will be so invaluable.
            </p>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Support Method:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('wave')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[68px] min-w-0 overflow-hidden ${
                  selectedMethod === 'wave'
                    ? 'border-[#1DA1F2] bg-[#1DA1F2]/10 dark:bg-[#1DA1F2]/15 ring-2 ring-[#1DA1F2]/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full min-w-0">
                  <span className="font-extrabold text-[11px] sm:text-xs text-[#1DA1F2] leading-tight">Wave</span>
                  {selectedMethod === 'wave' && <Check className="w-3.5 h-3.5 text-[#1DA1F2] shrink-0 mt-0.5" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-1">Mobile App</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('mobile_money')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[68px] min-w-0 overflow-hidden ${
                  selectedMethod === 'mobile_money'
                    ? 'border-[#f47c20] bg-orange-50/70 dark:bg-orange-950/30 ring-2 ring-[#f47c20]/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full min-w-0">
                  <div className="font-extrabold text-[10.5px] sm:text-xs leading-tight min-w-0 flex flex-wrap items-center gap-x-1 break-words">
                    <span className="text-[#f47c20]">QMoney</span>
                    <span className="text-slate-400 font-normal">/</span>
                    <span className="text-[#9D207E]">Afrimoney</span>
                  </div>
                  {selectedMethod === 'mobile_money' && <Check className="w-3.5 h-3.5 text-[#f47c20] shrink-0 mt-0.5" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-1">GSM Wallets</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('aps')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[68px] min-w-0 overflow-hidden ${
                  selectedMethod === 'aps'
                    ? 'border-[#151680] bg-[#151680]/10 dark:bg-[#151680]/20 ring-2 ring-[#151680]/25'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full min-w-0">
                  <span className="font-extrabold text-[11px] sm:text-xs text-[#151680] dark:text-[#8ea2ff] leading-tight">APS</span>
                  {selectedMethod === 'aps' && <Check className="w-3.5 h-3.5 text-[#151680] dark:text-[#8ea2ff] shrink-0 mt-0.5" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-1">Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('agib')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[64px] sm:min-h-[68px] min-w-0 overflow-hidden ${
                  selectedMethod === 'agib'
                    ? 'border-[#74bf51] bg-[#74bf51]/10 dark:bg-[#74bf51]/20 ring-2 ring-[#74bf51]/25'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full min-w-0">
                  <span className="font-extrabold text-[10.5px] sm:text-xs text-[#529433] dark:text-[#74bf51] leading-tight break-words">AGIB Bank</span>
                  {selectedMethod === 'agib' && <Check className="w-3.5 h-3.5 text-[#529433] dark:text-[#74bf51] shrink-0 mt-0.5" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-1">Bank Account</span>
              </button>
            </div>
          </div>

          {/* Method Details Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 space-y-3">
            {selectedMethod === 'wave' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#1DA1F2]" />
                    Wave Mobile Money (The Gambia)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    Active Numbers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">
                        Wave Number 1 (QCell Line)
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                        7-Digit: <strong className="text-xs sm:text-sm font-extrabold">3857626</strong>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                        9-Digit: <strong className="text-xs sm:text-sm font-extrabold text-[#1DA1F2]">833857626</strong>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy('833857626', 'wave_1_9')}
                        className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'wave_1_9' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 9-Dig</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy('3857626', 'wave_1_7')}
                        className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'wave_1_7' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 7-Dig</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold uppercase">
                        Wave Number 2 (Africell Line)
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                        7-Digit: <strong className="text-xs sm:text-sm font-extrabold">2439204</strong>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                        9-Digit: <strong className="text-xs sm:text-sm font-extrabold text-[#1DA1F2]">872439204</strong>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy('872439204', 'wave_2_9')}
                        className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'wave_2_9' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 9-Dig</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy('2439204', 'wave_2_7')}
                        className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'wave_2_7' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 7-Dig</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-500/10 dark:bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                  ⚠️ <strong>Important:</strong> During the PURA 9-digit transition phase, some telecom operators, wallets, or agents may still only accept 7 digits, while others require the updated 9 digits. <strong>Please use whichever digit format your wallet platform or local agent currently supports.</strong>
                </p>
              </div>
            )}

            {selectedMethod === 'mobile_money' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#f47c20]" />
                    <span><span className="text-[#f47c20]">QMoney</span> &amp; <span className="text-[#9D207E]">Afrimoney</span></span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/60 text-[#d46513] dark:text-[#f47c20] border border-orange-200 dark:border-orange-900">
                    QCell / Africell
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#f47c20] font-bold uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#f47c20]" />
                        <span>QMoney (QCell)</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                        7-Digit: <strong className="text-xs sm:text-sm font-extrabold">3857626</strong>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                        9-Digit: <strong className="text-xs sm:text-sm font-extrabold text-[#f47c20]">833857626</strong>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy('833857626', 'qmoney_9')}
                        className="px-2 py-1 rounded bg-[#f47c20]/10 hover:bg-[#f47c20]/20 text-[#d46513] dark:text-[#f47c20] text-[10px] font-bold border border-[#f47c20]/30 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'qmoney_9' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 9-Dig</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy('3857626', 'qmoney_7')}
                        className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'qmoney_7' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 7-Dig</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#9D207E] dark:text-[#d364b4] font-bold uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#9D207E]" />
                        <span>Afrimoney (Africell)</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                        7-Digit: <strong className="text-xs sm:text-sm font-extrabold">2439204</strong>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                        9-Digit: <strong className="text-xs sm:text-sm font-extrabold text-[#9D207E] dark:text-[#d364b4]">872439204</strong>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy('872439204', 'afrimoney_9')}
                        className="px-2 py-1 rounded bg-[#9D207E]/10 hover:bg-[#9D207E]/20 text-[#9D207E] dark:text-[#d364b4] text-[10px] font-bold border border-[#9D207E]/30 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'afrimoney_9' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 9-Dig</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy('2439204', 'afrimoney_7')}
                        className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'afrimoney_7' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 7-Dig</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-500/10 dark:bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                  ⚠️ <strong>Important:</strong> During the PURA 9-digit transition phase, some telecom operators, wallets, or agents may still only accept 7 digits, while others require the updated 9 digits. <strong>Please use whichever digit format your wallet platform or local agent currently supports.</strong>
                </p>
              </div>
            )}

            {selectedMethod === 'aps' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#151680] dark:text-[#8ea2ff]" />
                    APS (Money Transfer)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#151680]/10 text-[#151680] dark:text-[#8ea2ff] border border-[#151680]/20">
                    Transfer
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#151680] dark:text-[#8ea2ff] font-semibold uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#151680]" />
                        <span>APS Number / Phone (Africell Line)</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                        7-Digit: <strong className="text-xs sm:text-sm font-extrabold">2439204</strong>
                      </div>
                      <div className="font-mono text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                        9-Digit: <strong className="text-xs sm:text-sm font-extrabold text-[#151680] dark:text-[#8ea2ff]">872439204</strong>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy('872439204', 'aps_9')}
                        className="px-2 py-1 rounded bg-[#151680]/10 hover:bg-[#151680]/20 text-[#151680] dark:text-[#8ea2ff] text-[10px] font-bold border border-[#151680]/30 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'aps_9' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 9-Dig</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy('2439204', 'aps_7')}
                        className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === 'aps_7' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy 7-Dig</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span><strong>Beneficiary Name:</strong> Abdoulie Jallow</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('Abdoulie Jallow', 'aps_name')}
                      className="text-xs text-[#151680] dark:text-[#8ea2ff] font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'aps_name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'aps_name' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-500/10 dark:bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                  ⚠️ <strong>Important:</strong> During the PURA 9-digit transition phase, some telecom operators, wallets, or agents may still only accept 7 digits, while others require the updated 9 digits. <strong>Please use whichever digit format your wallet platform or local agent currently supports.</strong>
                </p>
              </div>
            )}

            {selectedMethod === 'agib' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#74bf51]" />
                    AGIB Bank (Arab Gambian Islamic Bank)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#74bf51]/15 text-[#3a6b25] dark:text-[#74bf51] border border-[#74bf51]/25">
                    Bank Account
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#3a6b25] dark:text-[#74bf51] font-semibold uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#74bf51]" />
                        <span>Account Number</span>
                      </div>
                      <div className="font-mono text-sm sm:text-base font-extrabold text-[#305c1d] dark:text-[#74bf51] tracking-wide">
                        201020212482185
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('201020212482185', 'agib_account')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#74bf51]/15 hover:bg-[#74bf51]/25 text-[#305c1d] dark:text-[#74bf51] text-xs font-bold border border-[#74bf51]/30 flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      {copiedKey === 'agib_account' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div><strong>Bank:</strong> AGIB Bank (Arab Gambian Islamic Bank)</div>
                    <div className="flex items-center justify-between">
                      <span><strong>Beneficiary Name:</strong> Abdoulie Jallow</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('Abdoulie Jallow', 'agib_name')}
                        className="text-xs text-[#529433] dark:text-[#74bf51] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === 'agib_name' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'agib_name' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Send via AGIB mobile banking, online bank transfer, or direct deposit at any AGIB branch.
                </p>
              </div>
            )}
          </div>

          {/* Alternative Free Support: Share with Friends & Colleagues */}
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2.5 sm:gap-3">
            <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Can't donate right now?
              </span>
              <span className="line-clamp-2 sm:line-clamp-none">
                Share this tool on WhatsApp or Facebook to help fellow Gambians!
              </span>
            </div>
            <button
              type="button"
              onClick={handleShareApp}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share App</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sticky/Fixed Footer Actions inside Card */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
            Thank you for supporting Gambian creators!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer shrink-0 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};


