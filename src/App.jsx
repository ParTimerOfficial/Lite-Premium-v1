import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './lib/ThemeContext';
import { I18nProvider } from './lib/i18n';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Admin from './pages/Admin';
import Community from './pages/Community';
import Toast from './components/Toast';
import { ToastProvider } from './lib/ToastContext';
import { deviceFingerprint } from './lib/deviceFingerprint';
import { collectionEngine } from './lib/collectionEngine';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize device fingerprinting
    const initializeApp = async () => {
      try {
        // Validate device fingerprint
        const validation = await deviceFingerprint.validateFingerprint();
        
        if (!validation.isValid && !validation.isNewDevice) {
          console.warn('Device fingerprint mismatch detected');
          // Could show security warning to user
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setLoading(false);
          setIsInitialized(true);
        });

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          setLoading(false);
          setIsInitialized(true);

          // Initialize collection engine for authenticated users
          if (session) {
            await collectionEngine.initialize(session.user.id);
          } else {
            collectionEngine.stop();
          }
        });

        return () => subscription.unsubscribe();

      } catch (error) {
        console.error('App initialization failed:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/auth" />} />
              <Route path="/shop" element={session ? <Shop session={session} /> : <Navigate to="/auth" />} />
              <Route path="/deposit" element={session ? <Deposit session={session} /> : <Navigate to="/auth" />} />
              <Route path="/withdraw" element={session ? <Withdraw session={session} /> : <Navigate to="/auth" />} />
              <Route path="/community" element={session ? <Community session={session} /> : <Navigate to="/auth" />} />
              <Route path="/admin" element={session ? <Admin session={session} /> : <Navigate to="/auth" />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
            <Toast />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;