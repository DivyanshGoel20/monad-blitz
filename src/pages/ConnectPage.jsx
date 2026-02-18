import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export default function ConnectPage() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors, isPending, error } = useConnect()
  const injectedConnector = connectors[0]

  useEffect(() => {
    if (isConnected) {
      navigate('/game', { replace: true })
    }
  }, [isConnected, navigate])

  const handleConnect = () => {
    if (!injectedConnector || isPending) return
    // Clear any stale connector state so "already connected" doesn't block reconnect
    disconnect()
    setTimeout(() => {
      connect({ connector: injectedConnector })
    }, 50)
  }

  return (
    <div className="connect-page">
      <div className="connect-card">
        <h1 className="connect-title">Monad Pizzeria</h1>
        <p className="connect-subtitle">
          Create the next 10,000 MON pizza
        </p>

        <div className="connect-actions">
          <button
            type="button"
            className="connect-btn"
            onClick={handleConnect}
            disabled={isPending || !injectedConnector}
          >
            {isPending ? 'Connecting…' : 'Connect Wallet'}
          </button>
        </div>

        {!injectedConnector && (
          <p className="connect-error" style={{ marginTop: 12 }}>
            No Web3 wallet found. Install MetaMask or another injected wallet and refresh.
          </p>
        )}
        {error && (
          <p className="connect-error">{error.message}</p>
        )}
      </div>
    </div>
  )
}
