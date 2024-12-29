import React from 'react';
import styled from 'styled-components';
import { Header } from '~/app/ui-components/header';
import ProtectedRoute from '~/app/authentication/ProtectedRoute';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px;
`;

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
  role: string;
  onFileSelect: (file: File) => void;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ 
  children, 
  allowedRoles,
  role,
  onFileSelect
}) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <LayoutContainer>
        <Header 
          brandName="Secure File Share" 
          onFileSelect={onFileSelect}
          role={role}
        />
        <MainContent>
          {children}
        </MainContent>
      </LayoutContainer>
    </ProtectedRoute>
  );
};

export default AuthenticatedLayout; 