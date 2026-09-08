import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary/ErrorBoundary';
import { AppRoutes } from './routes';

/**
 * Root Application Component with Global Context Providers
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider position="top-right">
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <AppRoutes />
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

