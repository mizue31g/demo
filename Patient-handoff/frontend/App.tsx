import React, { Component, ReactNode, ErrorInfo, useEffect } from 'react';
import { AppProvider, useAppContext, ToastProvider, useToast } from './context/AppContext';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';
import { CymbalHealthIcon, XIcon } from './components/icons';

// --- Global Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Replaced the constructor-based state initialization with a class property initializer.
  // The previous implementation was causing TypeScript errors where `state` and `props` were not recognized.
  // This is the modern and correct way to initialize state in a React class component.
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-surface text-on-surface">
          <h1 className="text-2xl font-bold text-error mb-4">Something went wrong.</h1>
          <p className="text-on-surface-variant">We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-full hover:shadow-md transition-shadow">
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Toast Notification Components ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 5000);
    return () => { clearTimeout(timer); };
  }, [onClose]);

  const typeClasses = {
    success: 'bg-primary-container text-on-primary-container',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-secondary-container text-on-secondary-container',
  };

  return (
    <div className={`relative w-full max-w-sm p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all animate-fade-in-right ${typeClasses[type]}`}>
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};


const AppContent: React.FC = () => {
    const { view } = useAppContext();
    
    return (
        <div className="h-screen flex flex-col bg-surface text-on-surface">
            <header className="bg-surface-container-lowest border-b border-outline-variant shrink-0 z-10">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <CymbalHealthIcon />
                    </div>
                    <div className="text-sm font-medium text-on-surface-variant">
                        User: 佐藤医師
                    </div>
                </div>
            </header>
            <main className="flex-grow min-h-0">
                <div className="h-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
                    {view === 'editor' ? <DocumentEditor /> : <Dashboard />}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AppContent />
          <ToastContainer />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;