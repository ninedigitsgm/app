import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  MessageCircle, 
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quick' | 'qr'>('quick');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gambia-contacts.app';
  const shareTitle = 'Automatic 9-Digits Contacts Upgrader - The Gambia';
  const shareText = 'Upgrade all Gambian 7-digit contacts to 9-digits safely and for free';

  useEffect(() => {
    if (isOpen) {
      // Generate QR Code data URL
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
        .then((url: string) => {
          setQrDataUrl(url);
        })
        .catch((err: unknown) => {
          console.error('Failed to generate QR code', err);
        });
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'gambia-9digit-upgrader-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ': ' + shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gambia Flag Strip Accent */}
        <div 
          className="h-1.5 w-full bg-[linear-gradient(to_right,#CE1126_0%,#CE1126_32%,#FFFFFF_38%,#0C1C8C_44%,#0C1C8C_56%,#FFFFFF_62%,#3A7728_68%,#3A7728_100%)]" 
          aria-hidden="true" 
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Share Gambia 9-Digits Upgrader
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help friends and family upgrade their contacts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-5 border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Quick Share
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Code
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {activeTab === 'quick' ? (
            <>
              {/* Native Mobile Share Button (if supported) */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Share via Phone Apps</span>
              </button>

              {/* Direct App Buttons */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-5 h-5 mb-1 text-blue-600 dark:text-blue-400" />
                  <span>Facebook</span>
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-50 hover:bg-sky-100/80 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-5 h-5 mb-1 text-sky-600 dark:text-sky-400" />
                  <span>X / Twitter</span>
                </a>
              </div>

              {/* Copy URL Input Box */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  App Link
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 px-2 py-1 outline-hidden select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
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
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center space-y-3">
              {/* QR Code Canvas / Image Display */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code for Gambia 9-Digits Contacts Upgrader"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR Code...
                  </div>
                )}
                {/* Center Badge Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow-md border border-slate-200">
                  <span className="text-xl" role="img" aria-label="Gambia flag">🇬🇲</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Scan with any smartphone camera to open the 9-Digits Contacts Upgrader instantly.
              </p>

              <div className="flex items-center gap-2 pt-1 w-full">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>100% free, private &amp; works completely in your browser</span>
          </div>
        </div>
      </div>
    </div>
  );
};
