import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Patch antd v5 for React 19 — suppresses the "antd v5 support React is 16~18"
// warning and fixes minor React 19 incompatibilities. Must be the first import.
import '@ant-design/v5-patch-for-react-19';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyles from './styles/global';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent re-fetching when the browser window/tab regains focus.
      // Data will only be refreshed when explicitly invalidated or when staleTime elapses
      // and the component remounts — not simply because the user switched tabs.
      refetchOnWindowFocus: false,
    },
  },
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
