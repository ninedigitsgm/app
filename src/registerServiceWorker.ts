/**
 * Register Service Worker for PWA offline capabilities and installability
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; please refresh.
                    window.dispatchEvent(new CustomEvent('pwa-update-available'));
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.debug('[PWA] ServiceWorker registration error (may occur in sandbox iframe):', error);
        });
    });
  }
}
