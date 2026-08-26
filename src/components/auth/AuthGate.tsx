import React, { useEffect } from 'react';
import { useAuthStore } from '../../auth/useAuthStore';
import { AuthPage } from './AuthPage';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { user, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
};
