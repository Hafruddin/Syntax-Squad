import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FORGE Error Boundary Caught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#f4f6f9',
          fontFamily: 'Segoe UI, sans-serif'
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '8px',
            borderTop: '5px solid #d9381e',
            maxWidth: '650px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#002f56', marginBottom: '10px' }}>FORGE Platform Alert</h2>
            <p style={{ color: '#475569', marginBottom: '15px' }}>
              An error occurred during component rendering. The system has prevented a blank screen.
            </p>
            <div style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#d9381e',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: '#005a9c',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
