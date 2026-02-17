import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublicClient } from 'wagmi'
import { formatEther } from 'viem'

const EXPLORER_URL = 'https://testnet.monadscan.com'

function formatAddress(addr) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function formatHash(hash) {
  if (!hash) return '—'
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

function getMethodId(input) {
  if (!input || input === '0x' || input.length < 10) return '0x'
  return input.slice(0, 10)
}

function calculateFee(tx, block) {
  if (!tx.gas) return null
  
  // EIP-1559 transaction: use baseFeePerGas + maxPriorityFeePerGas
  if (block?.baseFeePerGas != null && tx.maxPriorityFeePerGas != null) {
    const effectiveGasPrice = block.baseFeePerGas + tx.maxPriorityFeePerGas
    return tx.gas * effectiveGasPrice
  }
  
  // Legacy transaction: use gasPrice
  if (tx.gasPrice) {
    return tx.gas * tx.gasPrice
  }
  
  return null
}

export default function BlockPage() {
  const publicClient = usePublicClient()
  const [blockInput, setBlockInput] = useState('')
  const [block, setBlock] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBlock = async () => {
    if (!publicClient) {
      setError('RPC client not ready. Try again in a moment.')
      return
    }
    setError(null)
    setBlock(null)
    setLoading(true)
    try {
      const trimmed = blockInput.trim()
      const params = { includeTransactions: true }
      if (!trimmed || trimmed.toLowerCase() === 'latest') {
        Object.assign(params, { blockTag: 'latest' })
      } else {
        const num = BigInt(trimmed)
        Object.assign(params, { blockNumber: num })
      }
      const data = await publicClient.getBlock(params)
      setBlock(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch block')
    } finally {
      setLoading(false)
    }
  }

  const txCount = block?.transactions?.length ?? 0
  const transactions = Array.isArray(block?.transactions) ? block.transactions : []

  return (
    <div className="block-page">
      <header className="block-header">
        <Link to="/" className="block-back">
          ← Back
        </Link>
        <h1 className="block-title">Monad Testnet — Block</h1>
        <p className="block-subtitle">Fetch transactions for any block</p>
      </header>

      <section className="block-fetch">
        <div className="block-fetch-row">
          <input
            type="text"
            className="block-input"
            placeholder="Block number or leave empty for latest"
            value={blockInput}
            onChange={(e) => setBlockInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBlock()}
          />
          <button
            type="button"
            className="block-btn"
            onClick={fetchBlock}
            disabled={loading}
          >
            {loading ? 'Fetching…' : 'Fetch block'}
          </button>
        </div>
        {error && <p className="block-error">{error}</p>}
      </section>

      {block && (
        <section className="block-result">
          <div className="block-meta">
            <div className="block-meta-item">
              <span className="block-meta-label">Block number</span>
              <span className="block-meta-value">{String(block.number ?? '—')}</span>
            </div>
            <div className="block-meta-item">
              <span className="block-meta-label">Block hash</span>
              <a
                href={`${EXPLORER_URL}/block/${block.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block-meta-link"
              >
                {formatHash(block.hash)}
              </a>
            </div>
            <div className="block-meta-item">
              <span className="block-meta-label">Timestamp</span>
              <span className="block-meta-value">
                {block.timestamp != null
                  ? new Date(Number(block.timestamp) * 1000).toLocaleString()
                  : '—'}
              </span>
            </div>
            <div className="block-meta-item">
              <span className="block-meta-label">Transactions</span>
              <span className="block-meta-value">{txCount}</span>
            </div>
          </div>

          <h2 className="block-tx-title">Transactions ({txCount})</h2>
          {txCount === 0 ? (
            <p className="block-no-tx">No transactions in this block.</p>
          ) : (
            <div className="block-tx-list">
              {transactions.map((tx, i) => {
                const methodId = getMethodId(tx.input)
                const fee = calculateFee(tx, block)
                return (
                  <div key={tx.hash ?? i} className="block-tx-card">
                    <div className="block-tx-row">
                      <span className="block-tx-label">Hash</span>
                      <a
                        href={`${EXPLORER_URL}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block-tx-link"
                      >
                        {formatHash(tx.hash)}
                      </a>
                    </div>
                    <div className="block-tx-row">
                      <span className="block-tx-label">Method ID</span>
                      <span className="block-tx-value">{methodId}</span>
                    </div>
                    <div className="block-tx-row">
                      <span className="block-tx-label">Transaction Fee</span>
                      <span className="block-tx-value">
                        {fee != null ? `${formatEther(fee)} MON` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
