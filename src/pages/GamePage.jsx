import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useDisconnect, usePublicClient } from 'wagmi'
import { formatEther } from 'viem'

const ALL_INGREDIENTS = {
  sauce: [
    { id: 'tomato', label: 'Tomato', icon: '🍅' },
    { id: 'alfredo', label: 'Alfredo', icon: '🥛' },
    { id: 'pesto', label: 'Pesto', icon: '🌿' },
    { id: 'bbq', label: 'BBQ', icon: '🍖' },
    { id: 'buffalo', label: 'Buffalo', icon: '🌶️' },
    { id: 'garlic', label: 'Garlic', icon: '🧄' },
    { id: 'white', label: 'White', icon: '⚪' },
    { id: 'marinara', label: 'Marinara', icon: '🥫' },
  ],
  cheese: [
    { id: 'mozzarella', label: 'Mozzarella', icon: '🧀' },
    { id: 'cheddar', label: 'Cheddar', icon: '🧀' },
    { id: 'parmesan', label: 'Parmesan', icon: '🧀' },
    { id: 'ricotta', label: 'Ricotta', icon: '🧀' },
  ],
  topping: [
    { id: 'pepperoni', label: 'Pepperoni', icon: '🍖' },
    { id: 'mushrooms', label: 'Mushrooms', icon: '🍄' },
    { id: 'onions', label: 'Onions', icon: '🧅' },
    { id: 'sausage', label: 'Sausage', icon: '🌭' },
    { id: 'bacon', label: 'Bacon', icon: '🥓' },
    { id: 'olives', label: 'Olives', icon: '🫒' },
    { id: 'peppers', label: 'Peppers', icon: '🫑' },
    { id: 'pineapple', label: 'Pineapple', icon: '🍍' },
  ],
}

const SAUCE_GRADIENTS = {
  tomato:
    'radial-gradient(circle at 30% 0, rgba(248, 113, 113, 0.95) 0, rgba(220, 38, 38, 0.9) 35%, rgba(127, 29, 29, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  alfredo:
    'radial-gradient(circle at 30% 0, rgba(254, 243, 199, 0.95) 0, rgba(251, 191, 36, 0.9) 35%, rgba(180, 83, 9, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  pesto:
    'radial-gradient(circle at 30% 0, rgba(190, 242, 100, 0.95) 0, rgba(101, 163, 13, 0.9) 35%, rgba(54, 83, 20, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  bbq:
    'radial-gradient(circle at 30% 0, rgba(248, 171, 120, 0.95) 0, rgba(180, 83, 9, 0.9) 35%, rgba(124, 45, 18, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  buffalo:
    'radial-gradient(circle at 30% 0, rgba(252, 165, 165, 0.95) 0, rgba(220, 38, 38, 0.9) 35%, rgba(153, 27, 27, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  garlic:
    'radial-gradient(circle at 30% 0, rgba(254, 240, 138, 0.95) 0, rgba(234, 179, 8, 0.9) 35%, rgba(133, 77, 14, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  white:
    'radial-gradient(circle at 30% 0, rgba(255, 255, 255, 0.95) 0, rgba(229, 231, 235, 0.9) 35%, rgba(156, 163, 175, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
  marinara:
    'radial-gradient(circle at 30% 0, rgba(248, 150, 108, 0.95) 0, rgba(185, 60, 39, 0.9) 35%, rgba(120, 35, 20, 0.95) 75%, rgba(0, 0, 0, 0.9) 100%)',
}

// Cheese and toppings inside the sauce with clear gaps between each piece
// Cheese: 3×3 grid at 28% / 50% / 72% (~22% gap between pieces)
const CHEESE_SPREAD = [
  { top: '28%', left: '28%' }, { top: '28%', left: '50%' }, { top: '28%', left: '72%' },
  { top: '50%', left: '28%' }, { top: '50%', left: '50%' }, { top: '50%', left: '72%' },
  { top: '72%', left: '28%' }, { top: '72%', left: '50%' }, { top: '72%', left: '72%' },
]
// Toppings: ring + middle row, offset from cheese so layers don’t stack (~20% gaps)
const TOPPING_SPREAD = [
  { top: '32%', left: '35%' }, { top: '32%', left: '65%' }, { top: '38%', left: '32%' }, { top: '38%', left: '68%' },
  { top: '50%', left: '35%' }, { top: '50%', left: '65%' }, { top: '62%', left: '32%' }, { top: '62%', left: '68%' },
  { top: '68%', left: '50%' }, { top: '38%', left: '50%' },
]

const EXPLORER_URL = 'https://testnet.monadscan.com'

function formatHash(hash) {
  if (!hash) return '—'
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

function formatAddress(addr) {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function getMethodId(input) {
  if (!input || input === '0x' || input.length < 10) return '0x'
  return input.slice(0, 10)
}

function calculateFee(tx, block) {
  if (!tx.gas) return null
  if (block?.baseFeePerGas != null && tx.maxPriorityFeePerGas != null) {
    const effectiveGasPrice = block.baseFeePerGas + tx.maxPriorityFeePerGas
    return tx.gas * effectiveGasPrice
  }
  if (tx.gasPrice) {
    return tx.gas * tx.gasPrice
  }
  return null
}

/** Format fee for display: null/undefined → "0 MON", otherwise round to 3 decimals and append " MON". */
function formatFeeMon(fee, formatEtherFn) {
  if (fee == null) return '0.000 MON'
  const raw = fee === 0n ? '0' : formatEtherFn(fee)
  const num = parseFloat(raw)
  const rounded = Number.isNaN(num) ? '0.000' : Number(num).toFixed(3)
  return `${rounded} MON`
}

/** Fee as numeric value for console: null → 0, otherwise rounded to 3 decimals. */
function feeAsNumber(fee, formatEtherFn) {
  if (fee == null) return 0
  const raw = fee === 0n ? '0' : formatEtherFn(fee)
  const num = parseFloat(raw)
  return Number.isNaN(num) ? 0 : parseFloat(Number(num).toFixed(3))
}

/** Build array of transaction hashes and fees in order: sauces, then cheeses, then toppings. */
function buildTxHashesAndFees(blocks, formatEtherFn) {
  const out = []
  const categories = [
    { key: 'sauce', label: 'sauce' },
    { key: 'cheese', label: 'cheese' },
    { key: 'topping', label: 'topping' },
  ]
  for (const { key, label } of categories) {
    const block = blocks[key]
    const txs = Array.isArray(block?.transactions) ? block.transactions : []
    for (const tx of txs) {
      const fee = calculateFee(tx, block)
      out.push({ type: label, hash: tx.hash, fee: feeAsNumber(fee, formatEtherFn) })
    }
  }
  return out
}

// Map method ID to ingredient (deterministic based on method ID hash)
function mapMethodIdToIngredient(methodId, category) {
  if (!methodId || methodId === '0x') return null
  const items = ALL_INGREDIENTS[category]
  if (!items || items.length === 0) return null
  
  // Use method ID as seed for deterministic mapping
  const hash = parseInt(methodId.slice(2, 10), 16)
  const index = hash % items.length
  return items[index]
}

export default function GamePage() {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const publicClient = usePublicClient()
  const [timeLeft, setTimeLeft] = useState(60)
  const [selectedTxHash, setSelectedTxHash] = useState({ sauce: null, cheese: null, topping: null })
  const [blocks, setBlocks] = useState({ sauce: null, cheese: null, topping: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [customerOrder, setCustomerOrder] = useState({ sauce: null, cheese: null, topping: null })

  useEffect(() => {
    if (!isConnected) navigate('/', { replace: true })
  }, [isConnected, navigate])

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : prev))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  // Fetch latest block (sauce) and two previous (cheese, topping) on mount
  useEffect(() => {
    const fetchBlocks = async () => {
      if (!publicClient) return
      setLoading(true)
      setError(null)
      try {
        const latestBlock = await publicClient.getBlock({ blockTag: 'latest' })
        const latestNum = Number(latestBlock.number)
        // Sauce = latest, Cheese = latest - 1, Topping = latest - 2
        const sauceBlockNum = BigInt(latestNum)
        const cheeseBlockNum = BigInt(Math.max(1, latestNum - 1))
        const toppingBlockNum = BigInt(Math.max(1, latestNum - 2))

        const [sauceBlock, cheeseBlock, toppingBlock] = await Promise.all([
          publicClient.getBlock({ blockNumber: sauceBlockNum, includeTransactions: true }),
          publicClient.getBlock({ blockNumber: cheeseBlockNum, includeTransactions: true }),
          publicClient.getBlock({ blockNumber: toppingBlockNum, includeTransactions: true }),
        ])

        setBlocks({ sauce: sauceBlock, cheese: cheeseBlock, topping: toppingBlock })

        // Generate random customer order from transactions
        const sauceTxs = Array.isArray(sauceBlock.transactions) ? sauceBlock.transactions : []
        const cheeseTxs = Array.isArray(cheeseBlock.transactions) ? cheeseBlock.transactions : []
        const toppingTxs = Array.isArray(toppingBlock.transactions) ? toppingBlock.transactions : []

        const orderSauce = sauceTxs.length > 0 ? sauceTxs[Math.floor(Math.random() * sauceTxs.length)] : null
        const orderCheese = cheeseTxs.length > 0 ? cheeseTxs[Math.floor(Math.random() * cheeseTxs.length)] : null
        const orderTopping = toppingTxs.length > 0 ? toppingTxs[Math.floor(Math.random() * toppingTxs.length)] : null

        setCustomerOrder({
          sauce: orderSauce ? mapMethodIdToIngredient(getMethodId(orderSauce.input), 'sauce') : null,
          cheese: orderCheese ? mapMethodIdToIngredient(getMethodId(orderCheese.input), 'cheese') : null,
          topping: orderTopping ? mapMethodIdToIngredient(getMethodId(orderTopping.input), 'topping') : null,
        })
      } catch (err) {
        setError(err.message || 'Failed to fetch blocks')
      } finally {
        setLoading(false)
      }
    }

    fetchBlocks()
  }, [publicClient])

  // Log transaction hashes and fees (sauces, cheeses, toppings) to console when blocks are loaded
  useEffect(() => {
    if (!blocks.sauce || !blocks.cheese || !blocks.topping) return
    const arr = buildTxHashesAndFees(blocks, formatEther)
    console.log('Transaction hashes and fees (sauce → cheese → topping):', arr)
  }, [blocks.sauce, blocks.cheese, blocks.topping])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  const selectedSauce = selectedTxHash.sauce
    ? (() => {
        const tx = blocks.sauce?.transactions?.find((t) => t.hash === selectedTxHash.sauce)
        return tx ? mapMethodIdToIngredient(getMethodId(tx.input), 'sauce') : null
      })()
    : null

  const selectedCheese = selectedTxHash.cheese
    ? (() => {
        const tx = blocks.cheese?.transactions?.find((t) => t.hash === selectedTxHash.cheese)
        return tx ? mapMethodIdToIngredient(getMethodId(tx.input), 'cheese') : null
      })()
    : null

  const selectedTopping = selectedTxHash.topping
    ? (() => {
        const tx = blocks.topping?.transactions?.find((t) => t.hash === selectedTxHash.topping)
        return tx ? mapMethodIdToIngredient(getMethodId(tx.input), 'topping') : null
      })()
    : null

  const handleTxClick = (txHash, category) => {
    setSelectedTxHash((prev) => ({
      ...prev,
      [category]: prev[category] === txHash ? null : txHash,
    }))
  }

  const handleResetPizza = () => {
    setSelectedTxHash({ sauce: null, cheese: null, topping: null })
    setTimeLeft(60)
  }

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''

  // Build legend mapping grouped by category
  const legendByCategory = useMemo(() => {
    const groups = { sauce: [], cheese: [], topping: [] }
    const categories = ['sauce', 'cheese', 'topping']
    categories.forEach((cat) => {
      const block = blocks[cat]
      if (block?.transactions) {
        block.transactions.forEach((tx) => {
          if (tx.hash && tx.input) {
            const ingredient = mapMethodIdToIngredient(getMethodId(tx.input), cat)
            if (ingredient) {
              groups[cat].push({ hash: tx.hash, ...ingredient })
            }
          }
        })
      }
    })
    return groups
  }, [blocks])

  return (
    <div className="game-shell">
      <header className="game-header">
        <h1 className="game-title">Monad Pizza Forge</h1>
        <p className="game-subtitle">Build the perfect pizza from on-chain ingredients.</p>
        {isConnected && (
          <div className="wallet-bar">
            <span className="wallet-address">{shortAddress}</span>
            <button type="button" className="btn btn-wallet" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        )}
      </header>

      <main className="game-stage-new">
        <div className="oven-backdrop">
          <div className="oven-arch">
            <div className="oven-inner-glow" />
          </div>
          <div className="oven-shelf" />
        </div>

        {/* Left: Transaction cards in 3 layers */}
        <section className="panel panel-transactions">
          <div className="transactions-header">
            <h2 className="panel-title">Transactions</h2>
            {loading && <span className="loading-text">Loading blocks…</span>}
            {error && <span className="error-text">{error}</span>}
          </div>
          <div className="transactions-layers">
            {/* Sauce layer */}
            <div className="transaction-layer">
              <h3 className="layer-title">Sauce Block #{blocks.sauce?.number ? String(blocks.sauce.number) : '—'}</h3>
              <div className="transaction-cards">
                {blocks.sauce?.transactions?.map((tx) => {
                  const isSelected = selectedTxHash.sauce === tx.hash
                  const fee = calculateFee(tx, blocks.sauce)
                  return (
                    <div key={tx.hash} className="tx-card-wrap">
                      <button
                        type="button"
                        className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`}
                        onClick={() => handleTxClick(tx.hash, 'sauce')}
                      >
                        <div className="tx-row">
                          <span className="tx-label">Hash</span>
                          <span className="tx-value tx-hash">{formatHash(tx.hash)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">Method ID</span>
                          <span className="tx-value">{getMethodId(tx.input)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">From</span>
                          <span className="tx-value">{formatAddress(tx.from)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">To</span>
                          <span className="tx-value">{tx.to ? formatAddress(tx.to) : 'Contract'}</span>
                        </div>
                      </button>
                      <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cheese layer */}
            <div className="transaction-layer">
              <h3 className="layer-title">Cheese Block #{blocks.cheese?.number ? String(blocks.cheese.number) : '—'}</h3>
              <div className="transaction-cards">
                {blocks.cheese?.transactions?.map((tx) => {
                  const isSelected = selectedTxHash.cheese === tx.hash
                  const fee = calculateFee(tx, blocks.cheese)
                  return (
                    <div key={tx.hash} className="tx-card-wrap">
                      <button
                        type="button"
                        className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`}
                        onClick={() => handleTxClick(tx.hash, 'cheese')}
                      >
                        <div className="tx-row">
                          <span className="tx-label">Hash</span>
                          <span className="tx-value tx-hash">{formatHash(tx.hash)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">Method ID</span>
                          <span className="tx-value">{getMethodId(tx.input)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">From</span>
                          <span className="tx-value">{formatAddress(tx.from)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">To</span>
                          <span className="tx-value">{tx.to ? formatAddress(tx.to) : 'Contract'}</span>
                        </div>
                      </button>
                      <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Topping layer */}
            <div className="transaction-layer">
              <h3 className="layer-title">Topping Block #{blocks.topping?.number ? String(blocks.topping.number) : '—'}</h3>
              <div className="transaction-cards">
                {blocks.topping?.transactions?.map((tx) => {
                  const isSelected = selectedTxHash.topping === tx.hash
                  const fee = calculateFee(tx, blocks.topping)
                  return (
                    <div key={tx.hash} className="tx-card-wrap">
                      <button
                        type="button"
                        className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`}
                        onClick={() => handleTxClick(tx.hash, 'topping')}
                      >
                        <div className="tx-row">
                          <span className="tx-label">Hash</span>
                          <span className="tx-value tx-hash">{formatHash(tx.hash)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">Method ID</span>
                          <span className="tx-value">{getMethodId(tx.input)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">From</span>
                          <span className="tx-value">{formatAddress(tx.from)}</span>
                        </div>
                        <div className="tx-row">
                          <span className="tx-label">To</span>
                          <span className="tx-value">{tx.to ? formatAddress(tx.to) : 'Contract'}</span>
                        </div>
                      </button>
                      <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Center: Pizza */}
        <section className="panel panel-play-area">
          <div className="play-top-row">
            <div className="timer-chip">
              <span className="timer-label">Time</span>
              <span className="timer-value">
                {mm}:{ss}
              </span>
            </div>
          </div>
          <div className="pizza-station">
            <div className="pizza-board-shadow" />
            <div className="pizza-board">
              <div className="pizza-dough">
                <div className="pizza-base" />
                {selectedSauce && (
                  <div
                    className="pizza-sauce"
                    style={{
                      background: SAUCE_GRADIENTS[selectedSauce.id] ?? SAUCE_GRADIENTS['tomato'],
                    }}
                  />
                )}
                <div className="pizza-highlight" />
                <div className="pizza-toppings-layer" aria-hidden="true">
                  {selectedCheese &&
                    CHEESE_SPREAD.map((pos, i) => (
                      <div key={`cheese-${i}`} className="pizza-cheese" style={pos}>
                        <span>{selectedCheese.icon}</span>
                      </div>
                    ))}
                  {selectedTopping &&
                    TOPPING_SPREAD.map((pos, i) => (
                      <div key={`topping-${i}`} className="pizza-topping" style={pos}>
                        <span>{selectedTopping.icon}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="play-actions">
            <button className="btn btn-secondary" type="button" onClick={handleResetPizza}>
              Reset Pizza
            </button>
            <button className="btn btn-primary" type="button">
              Send to Oven
            </button>
          </div>
        </section>

        {/* Right: Order and Legend */}
        <section className="panel panel-right">
          {/* Top right: Customer Order */}
          <div className="order-section">
            <h2 className="panel-title">Customer Order</h2>
            <div className="order-card">
              <div className="order-item-row">
                <span className="order-label">Sauce:</span>
                <span className="order-value">
                  {customerOrder.sauce ? `${customerOrder.sauce.icon} ${customerOrder.sauce.label}` : '—'}
                </span>
              </div>
              <div className="order-item-row">
                <span className="order-label">Cheese:</span>
                <span className="order-value">
                  {customerOrder.cheese ? `${customerOrder.cheese.icon} ${customerOrder.cheese.label}` : '—'}
                </span>
              </div>
              <div className="order-item-row">
                <span className="order-label">Topping:</span>
                <span className="order-value">
                  {customerOrder.topping ? `${customerOrder.topping.icon} ${customerOrder.topping.label}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom right: Legend */}
          <div className="legend-section">
            <h2 className="panel-title">Legend</h2>
            <div className="legend-card">
              {legendByCategory.sauce.length === 0 &&
              legendByCategory.cheese.length === 0 &&
              legendByCategory.topping.length === 0 ? (
                <p className="legend-empty">No transactions loaded yet.</p>
              ) : (
                <>
                  <div className="legend-group">
                    <h4 className="legend-category-label">Sauce</h4>
                    <div className="legend-list">
                      {legendByCategory.sauce.slice(0, 12).map((item) => (
                        <div key={item.hash} className="legend-item">
                          <span className="legend-hash">{formatHash(item.hash)}</span>
                          <span className="legend-separator">→</span>
                          <span className="legend-ingredient">{item.icon} {item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="legend-group">
                    <h4 className="legend-category-label">Cheese</h4>
                    <div className="legend-list">
                      {legendByCategory.cheese.slice(0, 12).map((item) => (
                        <div key={item.hash} className="legend-item">
                          <span className="legend-hash">{formatHash(item.hash)}</span>
                          <span className="legend-separator">→</span>
                          <span className="legend-ingredient">{item.icon} {item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="legend-group">
                    <h4 className="legend-category-label">Toppings</h4>
                    <div className="legend-list">
                      {legendByCategory.topping.slice(0, 12).map((item) => (
                        <div key={item.hash} className="legend-item">
                          <span className="legend-hash">{formatHash(item.hash)}</span>
                          <span className="legend-separator">→</span>
                          <span className="legend-ingredient">{item.icon} {item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
