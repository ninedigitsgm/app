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
          // Check for updates periodically every hour
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60 * 60 * 1000);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; prompt refresh
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
