"use client";

import React, { Component, ReactNode } from "react";
import { eventTracker } from "@/services/eventTracker";
import { generateUUID } from "@/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Capturar snapshot de stores relevantes
    let storeState: Record<string, any> = {};
    try {
      if (typeof window !== "undefined") {
        const cartStore = localStorage.getItem("cart-store");
        const chatStore = localStorage.getItem("chat-store");
        const sessionStore = localStorage.getItem("session-store");

        storeState = {
          cart: cartStore ? JSON.parse(cartStore) : null,
          chat: chatStore ? JSON.parse(chatStore) : null,
          session: sessionStore ? JSON.parse(sessionStore) : null,
        };
      }
    } catch (e) {
      console.error("Failed to capture store state:", e);
    }

    // Track error con contexto completo
    eventTracker.track({
      id: generateUUID(),
      type: "ERROR",
      category: "system",
      data: {
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: "runtime",
        componentStack: errorInfo.componentStack || undefined,
        userJourney: eventTracker.getUserJourney(),
        storeState,
        severity: "critical",
      },
    });

    // Flush inmediato para errores críticos
    eventTracker.flush(true);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-500 text-4xl">
                error
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Algo salió mal
              </h1>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido
              notificado y estamos trabajando para solucionarlo.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 mb-4">
                <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-xs text-red-700 dark:text-red-300 mt-2 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-[#8E2653] hover:bg-[#7E2653] text-white rounded-lg transition-colors"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
