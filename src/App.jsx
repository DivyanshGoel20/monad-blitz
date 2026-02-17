import { Routes, Route, Navigate } from 'react-router-dom'
import ConnectPage from './pages/ConnectPage'
import GamePage from './pages/GamePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ConnectPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
