import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme/theme';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import CreateBenefitClassForm from './components/CreateBenefitClassForm';
import BenefitClassSummary from './components/BenefitClassSummary';
import Limits from './components/create/Limits';
import Plans from './components/create/Plans';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Home */}
              <Route path="/" element={<HomePage />} />

              {/* Dental Plan Configuration Routes */}
              <Route path="benefit-classes">
                <Route index element={<CreateBenefitClassForm />} />
                <Route path="create" element={<CreateBenefitClassForm />} />
                <Route path="summary" element={<BenefitClassSummary />} />
              </Route>
              <Route path="limits">
                <Route index element={<Limits />} />
                <Route path="create" element={<Limits />} />
              </Route>
              <Route path="plans">
                <Route index element={<Plans />} />
                <Route path="create" element={<Plans />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
