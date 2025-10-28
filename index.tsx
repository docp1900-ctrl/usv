
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// FIX: Import LocalizationProvider to make the localization context available to the app.
import { LocalizationProvider } from './i18n/LocalizationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Wrap the App component in the LocalizationProvider. This resolves the error from 'useLocalization' hook being used in child components. */}
    <LocalizationProvider>
      <App />
    </LocalizationProvider>
  </React.StrictMode>
);
