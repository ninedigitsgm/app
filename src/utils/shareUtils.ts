/**
 * Centralized share utility for consistent social previews across Android, iOS, and Web.
 */

export const getCanonicalShareUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // In local development, cloud containers, or preview iframes, always share the live canonical domain
    if (
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.includes('run.app') ||
      host.includes('googleusercontent') ||
      host.includes('aistudio') ||
      host.includes('webcontainer')
    ) {
      return 'https://ninedigits.gm/';
    }
    return `${window.location.origin}/`;
  }
  return 'https://ninedigits.gm/';
};

export const SHARE_TITLE = 'Automatic Nine Digits Contacts Upgrader';
export const SHARE_DESCRIPTION = 'Upgrade all Gambian 7-digit contacts to 9-digits safely, instantly, and for free';

export interface ShareResult {
  shared: boolean;
  copied: boolean;
}

export const executeShare = async (): Promise<ShareResult> => {
  const url = getCanonicalShareUrl();
  const text = SHARE_DESCRIPTION;
  const title = SHARE_TITLE;

  // On Android and iOS Web Share, passing title, text, and url separately ensures
  // the OS share sheet formats the link cleanly without duplicating the URL in WhatsApp/messages.
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, copied: false };
    } catch {
      // User dismissed share sheet or share failed: fall back to clipboard
    }
  }

  // Fallback to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return { shared: false, copied: true };
    } else if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { shared: false, copied: true };
    }
  } catch {
    // Clipboard failed
  }

  return { shared: false, copied: false };
};
