import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './store';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', borderRadius: '12px' },
          success: { style: { background: '#10B981', color: '#fff' } },
          error:   { style: { background: '#EF4444', color: '#fff' } },
        }} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
