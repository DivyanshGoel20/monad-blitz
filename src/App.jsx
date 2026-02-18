import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import ConnectPage from './pages/ConnectPage'
import GamePage from './pages/GamePage'

export default function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/" element={<ConnectPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  )
}
