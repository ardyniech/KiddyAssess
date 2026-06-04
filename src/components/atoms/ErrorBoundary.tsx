import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { motion } from "motion/react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Mohon maaf, aplikasi mengalami kendala teknis tak terduga.
            </p>

            <button
              id="reset-app-button"
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              Muat Ulang Aplikasi
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
