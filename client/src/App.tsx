import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateServicePage } from './pages/CreateServicePage';
import { MyServicesPage } from './pages/MyServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ChatsPage } from './pages/ChatsPage';
import { ChatDetailPage } from './pages/ChatDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/create"
              element={
                <ProtectedRoute>
                  <CreateServicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-services"
              element={
                <ProtectedRoute>
                  <MyServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/:id"
              element={
                <ProtectedRoute>
                  <ServiceDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <ChatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/:id"
              element={
                <ProtectedRoute>
                  <ChatDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
