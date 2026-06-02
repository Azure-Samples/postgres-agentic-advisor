import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Clients from '@/pages/Client/Clients';
import ClientDetail from '@/pages/Client/ClientDetail';
import ChatInterface from '@/pages/Chat/ChatInterface';
import { ToastProvider, Layout } from '@/components';
import { AppInitializationOverlay } from '@/components/AppInitializationOverlay/AppInitializationOverlay';
import { SkeletonBackground } from '@/components/AppInitializationOverlay/SkeletonBackground';
import { useHealthCheck } from '@/api/hooks/useHealthCheck';

function AppRoutes() {
  const { isReady, showOverlay, isError } = useHealthCheck();

  return (
    <>
      {showOverlay && <AppInitializationOverlay isError={isError} />}
      {showOverlay ? (
        <SkeletonBackground />
      ) : (
        isReady && (
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dashboard/:clientName/messages/*" element={<ChatInterface />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:clientId" element={<ClientDetail />} />
                <Route path="clients/:clientName/messages/*" element={<ChatInterface />} />
              </Route>
            </Routes>
          </Router>
        )
      )}
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
