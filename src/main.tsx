import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Application failed to load</h1><p>Please refresh the page.</p></div>';
  throw new Error('Root element not found');
}

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available - show update notification
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('SW registration failed:', error);
      });
  });
}

// Request notification permission (for future push notifications)
if ('Notification' in window && Notification.permission === 'default') {
  // Uncomment to request notification permission on load
  // Notification.requestPermission();
}

// Handle offline/online events
window.addEventListener('online', () => {
  console.log('Connection restored');
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  document.body.classList.add('offline');
});

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
