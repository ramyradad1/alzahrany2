import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    props: ErrorBoundaryProps;
    state: ErrorBoundaryState = { hasError: false, error: null };

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.props = props;
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-red-500 bg-red-50 dark:bg-red-900/10 min-h-screen flex flex-col items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full">
                        <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
                        <pre className="text-xs overflow-auto font-mono bg-slate-100 dark:bg-slate-900 p-4 rounded max-h-64 whitespace-pre-wrap break-words">
                            {this.state.error?.toString()}
                            {this.state.error?.stack && `\n\n${this.state.error.stack}`}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
