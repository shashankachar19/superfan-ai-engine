import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({error}: any) {
  return (
    <div role="alert" className="text-white p-8">
      <p>Something went wrong:</p>
      <pre className="text-red-500">{error.message}</pre>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)
