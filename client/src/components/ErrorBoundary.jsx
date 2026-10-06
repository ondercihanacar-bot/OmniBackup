import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-rose-200 shadow-xl space-y-5 text-center animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-800">
              Bu Sekme Yüklenirken Bir Hata Oluştu
            </h2>
            <p className="text-xs text-slate-500">
              Uygulamanın diğer sekmeleri ve yedekleme motoru normal şekilde çalışmaya devam ediyor.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-3 bg-slate-900 text-rose-300 font-mono text-xs rounded-xl text-left overflow-x-auto max-h-36">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (typeof this.props.onReset === 'function') {
                  this.props.onReset();
                }
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tekrar Dene</span>
            </button>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (typeof this.props.onNavigateDashboard === 'function') {
                  this.props.onNavigateDashboard();
                }
              }}
              className="btn-acronis-primary px-5 py-2 text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard'a Dön</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
