import { Routes, Route, Navigate } from 'react-router-dom'
import ConnectPage from './pages/ConnectPage'
import GamePage from './pages/GamePage'
import BlockPage from './pages/BlockPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ConnectPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/block" element={<BlockPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
