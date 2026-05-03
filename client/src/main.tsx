import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './context/UserContext.tsx'

// Global error logger for production debugging
window.onerror = (msg, url, line) => {
  console.error("CRITICAL ERROR:", msg, "at", url, ":", line);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding: 20px; color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2; rounded: 8px; margin: 20px; font-family: sans-serif;">
      <h1 style="font-size: 1.25rem; font-bold; margin-bottom: 8px;">Something went wrong</h1>
      <p style="font-size: 0.875rem;">The application failed to load. Please check the console for details.</p>
      <pre style="font-size: 0.75rem; margin-top: 12px; overflow: auto;">${msg}</pre>
    </div>`;
  }
};

console.log("VoteSaathi: Initializing at " + new Date().toISOString());
console.log("VoteSaathi: Base URL is " + import.meta.env.BASE_URL);

const container = document.getElementById('root');
if (!container) {
  console.error("VoteSaathi: Root element #root not found!");
} else {
  try {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <UserProvider>
          <App />
        </UserProvider>
      </StrictMode>,
    );
    console.log("VoteSaathi: Mount successful.");
  } catch (err) {
    console.error("VoteSaathi: Mount failed:", err);
  }
}

// Fallback check if nothing renders
setTimeout(() => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    console.warn("VoteSaathi: Root is still empty after 2s. Attempting emergency render.");
    root.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Loading VoteSaathi...</h1><p>If this stays, check your internet connection or console for errors.</p></div>';
  }
}, 2000);
