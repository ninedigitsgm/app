import React, { useState, useEffect } from 'react';
import {
  Heart,
  X,
  Copy,
  Check,
  Coffee,
  Smartphone,
  CreditCard,
  Share2,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

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
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'mobile_money' | 'online' | 'bank'>('wave');
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

  const handleShareApp = () => {
    const shareUrl = window.location.origin;
    const shareText = 'Upgrade all Gambian 7-digit contacts to 9-digits safely and for free: ' + shareUrl;
    if (navigator.share) {
      navigator.share({
        title: 'Automatic 9-Digits Contacts Upgrader',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2200);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
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
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Built with care for The Gambia's PURA 9-Digit Numbering Transition.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
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
                  If this tool saved you hours of manual editing, consider sending a small tip to show appreciation and support future community tools.
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
              This Web app, which can be installable as a mobile app on all devices is provided 100% free, zero ads, secure data privacy, zero tracking, and Zero paywalls (No Section on the web app asks for Premium, Codes of any sort from you) so every Gambian, Resident and Businesses can migrate seamlessly. Your Support will be so invaluable if you can, No amount is too small!
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
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  selectedMethod === 'wave'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px] sm:text-xs text-[#1DA1F2] dark:text-blue-400">Wave</span>
                  {selectedMethod === 'wave' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Gambia Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('mobile_money')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  selectedMethod === 'mobile_money'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400">QMoney / Afri</span>
                  {selectedMethod === 'mobile_money' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">GSM Wallets</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('online')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  selectedMethod === 'online'
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px] sm:text-xs text-amber-600 dark:text-amber-400">Card / PayPal</span>
                  {selectedMethod === 'online' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">International</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  selectedMethod === 'bank'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/70 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px] sm:text-xs text-purple-600 dark:text-purple-400">Bank / APS</span>
                  {selectedMethod === 'bank' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Direct Transfer</span>
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
                    Instant &amp; 0% Fee
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Wave Transfer Number
                    </div>
                    <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      +220 310 1010
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('+2203101010', 'wave_number')}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedKey === 'wave_number' ? (
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Open the Wave app on your phone: Send Money: Paste number <strong className="text-slate-700 dark:text-slate-300">+220 310 1010</strong>.
                </p>
              </div>
            )}

            {selectedMethod === 'mobile_money' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    QMoney &amp; Afrimoney
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    QCell / Africell
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">
                        QMoney (QCell)
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        +220 310 1010
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('+2203101010', 'qmoney_number')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer shrink-0"
                      title="Copy QMoney number"
                    >
                      {copiedKey === 'qmoney_number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase">
                        Afrimoney (Africell)
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        +220 700 1010
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('+2207001010', 'afrimoney_number')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer shrink-0"
                      title="Copy Afrimoney number"
                    >
                      {copiedKey === 'afrimoney_number' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'online' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    Buy Me a Coffee / International Card
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    Visa / Mastercard / PayPal
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Support using any international debit or credit card, Apple Pay, Google Pay, or PayPal.
                </p>

                <div className="pt-0.5">
                  <a
                    href="https://buymeacoffee.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Support on Buy Me a Coffee</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    Bank Transfer / Remittance (APS / RIA / Western Union)
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <strong>Beneficiary Name:</strong> Abdoulie Jallow
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <strong>Country:</strong> The Gambia
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span><strong>Phone Contact:</strong> +220 310 1010</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('Abdoulie Jallow (+220 310 1010)', 'bank_info')}
                      className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'bank_info' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'bank_info' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
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
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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

