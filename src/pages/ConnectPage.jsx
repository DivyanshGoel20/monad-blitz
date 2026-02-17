import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConnect, useAccount } from 'wagmi'

export default function ConnectPage() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const injectedConnector = connectors[0]

  useEffect(() => {
    if (isConnected) {
      navigate('/game', { replace: true })
    }
  }, [isConnected, navigate])

  return (
    <div className="connect-page">
      <div className="connect-card">
        <h1 className="connect-title">Monad Pizza Forge</h1>
        <p className="connect-subtitle">
          Connect your wallet on Monad Testnet to start building pizzas.
        </p>

        <div className="connect-actions">
          <button
            type="button"
            className="connect-btn"
            onClick={() => injectedConnector && connect({ connector: injectedConnector })}
            disabled={isPending || !injectedConnector}
          >
            {isPending ? 'Connecting…' : 'Connect Wallet'}
          </button>
        </div>

        {error && (
          <p className="connect-error">{error.message}</p>
        )}
      </div>
    </div>
  )
}
