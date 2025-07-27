import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from './store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ApiKeysPage from './pages/ApiKeysPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/layout/Layout';
import { Toaster } from './components/ui/toaster';
import { useGetCurrentUserQuery } from './store/api/authApi';
import { setCredentials, logout } from './store/slices/authSlice';

function App() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const { data: currentUser, error } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (token && currentUser && !user) {
      dispatch(setCredentials({ user: currentUser, token }));
    }
    if (error && 'status' in error && error.status === 401) {
      dispatch(logout());
    }
  }, [currentUser, error, token, user, dispatch]);

  if (!token) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/api-keys" element={<ApiKeysPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  );
}

export default App;