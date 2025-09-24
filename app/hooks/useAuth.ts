// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  sessionExpiry: number | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    sessionExpiry: null
  });

  // Sprawdź sesję przy załadowaniu
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const sessionData = localStorage.getItem('product_auth_session');
      if (sessionData) {
        const parsed: AuthState = JSON.parse(sessionData);
        
        // Sprawdź czy sesja nie wygasła (domyślnie 24h)
        if (parsed.sessionExpiry && Date.now() < parsed.sessionExpiry) {
          setAuthState(parsed);
          console.log('✅ Session restored from localStorage');
          return true;
        } else {
          // Sesja wygasła
          clearSession();
          console.log('⏰ Session expired, cleared');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      clearSession();
    }
    return false;
  };

  const saveSession = (rememberMe: boolean = true) => {
    const expiryTime = rememberMe 
      ? Date.now() + (24 * 60 * 60 * 1000) // 24 godziny
      : Date.now() + (4 * 60 * 60 * 1000);  // 4 godziny

    const sessionData: AuthState = {
      isLoggedIn: true,
      sessionExpiry: expiryTime
    };

    try {
      localStorage.setItem('product_auth_session', JSON.stringify(sessionData));
      setAuthState(sessionData);
      console.log('💾 Session saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem('product_auth_session');
      setAuthState({
        isLoggedIn: false,
        sessionExpiry: null
      });
      console.log('🗑️ Session cleared');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  };

  const getRemainingTime = (): string => {
    if (!authState.sessionExpiry) return '';
    
    const remaining = authState.sessionExpiry - Date.now();
    if (remaining <= 0) return 'Wygasła';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    isLoggedIn: authState.isLoggedIn,
    sessionExpiry: authState.sessionExpiry,
    saveSession,
    clearSession,
    checkSession,
    getRemainingTime
  };
};
