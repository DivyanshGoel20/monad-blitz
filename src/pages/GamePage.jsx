import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useDisconnect, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { formatEther } from 'viem'
import { pizzaContract, PIZZA_CONTRACT_ADDRESS } from '../contracts/pizza'
import { pizzaAbi } from '../contracts/pizzaAbi'

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

/** Fisher–Yates shuffle; returns a new array. */
function shuffleArray(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
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

// Map txn hash to ingredient using same formula as contract (_hashToTopping / _hashToSauce / _hashToCheese)
function hashToIngredient(hash, category) {
  const items = ALL_INGREDIENTS[category]
  if (!items?.length || !hash) return null
  const h = typeof hash === 'string' ? (hash.startsWith('0x') ? BigInt(hash) : BigInt('0x' + hash)) : BigInt(hash)
  const index = Number(h % BigInt(items.length))
  return items[Math.min(index, items.length - 1)]
}

/** Ensure bytes32 for contract: 0x + 64 hex chars */
function toBytes32(hexHash) {
  if (!hexHash) return undefined
  const clean = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash
  return '0x' + clean.padStart(64, '0').slice(-64)
}

export default function GamePage() {
  const navigate = useNavigate()
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const MONAD_TESTNET_ID = 10143
  const publicClient = usePublicClient()
  const { mutate: writePizzaMutate, isPending: isWritePending, error: writeError } = useWriteContract()
  const [pendingFinalizeHash, setPendingFinalizeHash] = useState(null)
  const [pendingStartRoundHash, setPendingStartRoundHash] = useState(null)

  const { data: finalizeReceipt } = useWaitForTransactionReceipt({ hash: pendingFinalizeHash })
  const { data: startRoundReceipt } = useWaitForTransactionReceipt({ hash: pendingStartRoundHash })

  const [selectedTxHash, setSelectedTxHash] = useState({ sauce: null, cheese: null, topping: null })
  const [blocks, setBlocks] = useState({ sauce: null, cheese: null, topping: null })
  const [loadingBlocks, setLoadingBlocks] = useState(false)
  const [error, setError] = useState(null)
  const [startRoundFeedback, setStartRoundFeedback] = useState(null)
  const [showBakingGif, setShowBakingGif] = useState(false)

  const contractAddress = pizzaContract?.address ?? undefined
  const contractAbi = pizzaContract?.abi ?? undefined
  const contractEnabled = !!contractAddress && !!contractAbi

  const readContractConfig = { address: contractAddress, abi: contractAbi, query: { enabled: contractEnabled } }
  const { data: owner } = useReadContract({
    ...readContractConfig,
    functionName: 'owner',
  })
  const { data: currentRoundId = 0n, refetch: refetchCurrentRoundId } = useReadContract({
    ...readContractConfig,
    functionName: 'currentRoundId',
  })
  const { data: currentRoundOrder, refetch: refetchCurrentRoundOrder } = useReadContract({
    ...readContractConfig,
    functionName: 'currentRoundOrder',
  })
  const { data: roundDeadline = 0n, refetch: refetchRoundDeadline } = useReadContract({
    ...readContractConfig,
    functionName: 'roundDeadline',
  })
  const { data: roundStartTime = 0n } = useReadContract({
    ...readContractConfig,
    functionName: 'roundStartTime',
  })
  const { data: roundOptionLengths, refetch: refetchOptionLengths } = useReadContract({
    ...readContractConfig,
    functionName: 'getRoundOptionLengths',
  })
  const { data: lastWinner, refetch: refetchLastWinner } = useReadContract({
    ...readContractConfig,
    functionName: 'lastWinner',
  })
  const { data: lastWinnerTimeTaken = 0n, refetch: refetchLastWinnerTimeTaken } = useReadContract({
    ...readContractConfig,
    functionName: 'lastWinnerTimeTaken',
  })
  const { data: lastWinnerTotalFee = 0n, refetch: refetchLastWinnerTotalFee } = useReadContract({
    ...readContractConfig,
    functionName: 'lastWinnerTotalFee',
  })
  const { data: lastFinalizedRoundId = 0n, refetch: refetchLastFinalizedRoundId } = useReadContract({
    ...readContractConfig,
    functionName: 'lastFinalizedRoundId',
  })

  useEffect(() => {
    if (!finalizeReceipt || !pendingFinalizeHash) return
    refetchLastWinner()
    refetchLastWinnerTimeTaken()
    refetchLastWinnerTotalFee()
    refetchLastFinalizedRoundId()
    setPendingFinalizeHash(null)
    const t = setTimeout(() => window.location.reload(), 1500)
    return () => clearTimeout(t)
  }, [finalizeReceipt, pendingFinalizeHash, refetchLastWinner, refetchLastWinnerTimeTaken, refetchLastWinnerTotalFee, refetchLastFinalizedRoundId])

  useEffect(() => {
    if (!startRoundReceipt || !pendingStartRoundHash) return
    setPendingStartRoundHash(null)
    const t = setTimeout(() => window.location.reload(), 1500)
    return () => clearTimeout(t)
  }, [startRoundReceipt, pendingStartRoundHash])

  useEffect(() => {
    if (lastFinalizedRoundId != null && currentRoundId != null && Number(lastFinalizedRoundId) === Number(currentRoundId) && Number(currentRoundId) > 0) {
      setShowBakingGif(false)
    }
  }, [lastFinalizedRoundId, currentRoundId])

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()
  const hasRound = currentRoundId != null && Number(currentRoundId) > 0

  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    if (!hasRound || !roundDeadline) return
    const tick = () => {
      const now = Math.floor(Date.now() / 1000)
      const left = Math.max(0, Number(roundDeadline) - now)
      setTimeLeft(left)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hasRound, roundDeadline])

  const lengths = roundOptionLengths != null
    ? (Array.isArray(roundOptionLengths)
        ? roundOptionLengths
        : [roundOptionLengths?.toppingLen, roundOptionLengths?.sauceLen, roundOptionLengths?.cheeseLen])
    : []
  const toppingLen = Math.max(0, Number(lengths[0]) || 0)
  const sauceLen = Math.max(0, Number(lengths[1]) || 0)
  const cheeseLen = Math.max(0, Number(lengths[2]) || 0)

  const [roundOptionData, setRoundOptionData] = useState({ sauce: [], cheese: [], topping: [] })
  useEffect(() => {
    if (!contractAddress || !contractAbi || !publicClient || (!toppingLen && !sauceLen && !cheeseLen)) return
    const read = async (name, index) => {
      const [hashRes, feeRes] = await Promise.all([
        publicClient.readContract({ address: contractAddress, abi: contractAbi, functionName: `currentRound${name}Hashes`, args: [BigInt(index)] }),
        publicClient.readContract({ address: contractAddress, abi: contractAbi, functionName: `currentRound${name}Fees`, args: [BigInt(index)] }),
      ])
      return { hash: hashRes, fee: feeRes }
    }
    const run = async () => {
      try {
        const sauce = await Promise.all(Array.from({ length: sauceLen }, (_, i) => read('Sauce', i)))
        const cheese = await Promise.all(Array.from({ length: cheeseLen }, (_, i) => read('Cheese', i)))
        const topping = await Promise.all(Array.from({ length: toppingLen }, (_, i) => read('Topping', i)))
        setRoundOptionData({ sauce, cheese, topping })
      } catch (e) {
        console.error('Failed to load round options:', e)
        setRoundOptionData({ sauce: [], cheese: [], topping: [] })
      }
    }
    run()
  }, [contractAddress, contractAbi, publicClient, toppingLen, sauceLen, cheeseLen])

  const customerOrder = useMemo(() => {
    if (!currentRoundOrder || !hasRound) return { sauce: null, cheese: null, topping: null }
    const arr = Array.isArray(currentRoundOrder) ? currentRoundOrder : [currentRoundOrder.topping, currentRoundOrder.sauce, currentRoundOrder.cheese]
    const [toppingIdx, sauceIdx, cheeseIdx] = arr
    return {
      sauce: ALL_INGREDIENTS.sauce[Number(sauceIdx)] ?? null,
      cheese: ALL_INGREDIENTS.cheese[Number(cheeseIdx)] ?? null,
      topping: ALL_INGREDIENTS.topping[Number(toppingIdx)] ?? null,
    }
  }, [currentRoundOrder, hasRound])

  const handleStartRound = () => {
    setStartRoundFeedback('Preparing…')
    setError(null)
    if (!pizzaContract?.address || !blocks.sauce?.transactions?.length || !blocks.cheese?.transactions?.length || !blocks.topping?.transactions?.length) {
      setError('Fetch blocks first and ensure each block has transactions')
      setStartRoundFeedback(null)
      return
    }
    const toHash = (tx) => (typeof tx.hash === 'string' ? tx.hash : '0x' + tx.hash.toString(16))
    const toFee = (tx, block) => {
      const fee = calculateFee(tx, block)
      return fee != null ? fee : 0n
    }
    const withBytes32 = (tx, block) => {
      const h = toBytes32(toHash(tx))
      return h ? { hash: h, fee: toFee(tx, block) } : null
    }
    const toPairs = (block) => (block?.transactions ?? [])
      .map((tx) => withBytes32(tx, block))
      .filter(Boolean)
    const saucePairs = toPairs(blocks.sauce)
    const cheesePairs = toPairs(blocks.cheese)
    const toppingPairs = toPairs(blocks.topping)
    const sauceHashes = saucePairs.map((p) => p.hash)
    const sauceFees = saucePairs.map((p) => p.fee)
    const cheeseHashes = cheesePairs.map((p) => p.hash)
    const cheeseFees = cheesePairs.map((p) => p.fee)
    const toppingHashes = toppingPairs.map((p) => p.hash)
    const toppingFees = toppingPairs.map((p) => p.fee)
    if (!sauceHashes.length || !cheeseHashes.length || !toppingHashes.length) {
      setError('Could not encode transaction hashes. Try fetching blocks again.')
      setStartRoundFeedback(null)
      return
    }
    setStartRoundFeedback('Open your wallet to sign…')
    const variables = {
      address: pizzaContract.address,
      abi: pizzaAbi,
      functionName: 'createCustomerOrder',
      args: [toppingHashes, toppingFees, sauceHashes, sauceFees, cheeseHashes, cheeseFees],
      chainId: MONAD_TESTNET_ID,
    }
    writePizzaMutate(variables, {
      onSuccess: (hash) => {
        setStartRoundFeedback(null)
        setPendingStartRoundHash(hash)
      },
      onError: (err) => {
        const msg = err?.shortMessage ?? err?.message ?? err?.cause?.message ?? 'Failed to start round'
        setError(typeof msg === 'string' ? msg : 'Failed to start round')
        setStartRoundFeedback(null)
      },
      onSettled: () => setStartRoundFeedback(null),
    })
  }

  const handleFinalizeRound = () => {
    if (!pizzaContract?.address) return
    setError(null)
    writePizzaMutate(
      {
        address: pizzaContract.address,
        abi: pizzaAbi,
        functionName: 'finalizeRound',
        args: [],
        chainId: MONAD_TESTNET_ID,
      },
      {
        onSuccess: (hash) => {
          setPendingFinalizeHash(hash)
          setTimeout(() => {
            refetchCurrentRoundId()
            refetchCurrentRoundOrder()
            refetchRoundDeadline()
            refetchOptionLengths()
          }, 500)
        },
        onError: (err) => {
          const msg = err?.shortMessage ?? err?.message ?? err?.cause?.message ?? 'Failed to finalize round'
          setError(typeof msg === 'string' ? msg : 'Failed to finalize round')
        },
      }
    )
  }

  const handleSendToOven = () => {
    if (!pizzaContract?.address || !selectedTxHash.sauce || !selectedTxHash.cheese || !selectedTxHash.topping) {
      setError('Select one option per category')
      return
    }
    if (timeLeft <= 0) {
      setError('Submission period has ended')
      return
    }
    setError(null)
    writePizzaMutate(
      {
        address: pizzaContract.address,
        abi: pizzaAbi,
        functionName: 'buildOrder',
        args: [toBytes32(selectedTxHash.topping), toBytes32(selectedTxHash.sauce), toBytes32(selectedTxHash.cheese)],
        chainId: MONAD_TESTNET_ID,
      },
      {
        onSuccess: () => setShowBakingGif(true),
        onError: (err) => {
          const msg = err?.shortMessage ?? err?.message ?? err?.cause?.message ?? 'Failed to submit build'
          setError(typeof msg === 'string' ? msg : 'Failed to submit build')
        },
      }
    )
  }

  useEffect(() => {
    if (!isConnected) navigate('/', { replace: true })
  }, [isConnected, navigate])

  const fetchBlocks = async () => {
    setError(null)
    if (chainId != null && chainId !== MONAD_TESTNET_ID) {
      setError('Switch your wallet to Monad Testnet to fetch blocks.')
      return
    }
    if (!publicClient) {
      setError('Network not ready. Connect your wallet and switch to Monad Testnet.')
      return
    }
    setLoadingBlocks(true)
    try {
      const latestBlock = await publicClient.getBlock({ blockTag: 'latest' })
      const latestNum = Number(latestBlock.number)
      // Fetch blocks sequentially to avoid RPC rate limits
      const sauceBlock = await publicClient.getBlock({
        blockNumber: BigInt(latestNum),
        includeTransactions: true,
      })
      const cheeseBlock = await publicClient.getBlock({
        blockNumber: BigInt(Math.max(1, latestNum - 1)),
        includeTransactions: true,
      })
      const toppingBlock = await publicClient.getBlock({
        blockNumber: BigInt(Math.max(1, latestNum - 2)),
        includeTransactions: true,
      })
      setBlocks({ sauce: sauceBlock, cheese: cheeseBlock, topping: toppingBlock })
    } catch (err) {
      const msg = err?.shortMessage ?? err?.message ?? err?.cause?.message ?? String(err)
      setError(msg || 'Failed to fetch blocks')
    } finally {
      setLoadingBlocks(false)
    }
  }

  const selectedSauce = selectedTxHash.sauce ? hashToIngredient(selectedTxHash.sauce, 'sauce') : null
  const selectedCheese = selectedTxHash.cheese ? hashToIngredient(selectedTxHash.cheese, 'cheese') : null
  const selectedTopping = selectedTxHash.topping ? hashToIngredient(selectedTxHash.topping, 'topping') : null

  const handleTxClick = (txHash, category) => {
    setSelectedTxHash((prev) => ({
      ...prev,
      [category]: prev[category] === txHash ? null : txHash,
    }))
  }

  const handleResetPizza = () => {
    setSelectedTxHash({ sauce: null, cheese: null, topping: null })
  }

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''

  // Legend: txn hash → ingredient using contract formula (hashToTopping / hashToSauce / hashToCheese); order randomized per category
  const legendByCategory = useMemo(() => {
    const groups = { sauce: [], cheese: [], topping: [] }
    if (!hasRound) return groups
    ;['sauce', 'cheese', 'topping'].forEach((cat) => {
      const list = roundOptionData[cat] || []
      list.forEach(({ hash, fee }) => {
        const ingredient = hashToIngredient(hash, cat)
        if (hash && ingredient) groups[cat].push({ hash: typeof hash === 'string' ? hash : '0x' + hash.toString(16), fee, ...ingredient })
      })
      groups[cat] = shuffleArray(groups[cat])
    })
    return groups
  }, [hasRound, roundOptionData])

  return (
    <div className="game-shell">
      {showBakingGif && (
        <div className="baking-gif-overlay" aria-hidden="true">
          <div className="baking-gif-backdrop" />
          <div className="baking-gif-wrap">
            <iframe
              src="https://tenor.com/embed/10919962664205650525"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="Pizza baking"
              className="baking-gif-iframe"
            />
            <p className="baking-gif-label">Pizza in the oven… waiting for round to be finalized.</p>
          </div>
        </div>
      )}
      <header className="game-header">
        <h1 className="game-title">Monad Pizza Forge</h1>
        <p className="game-subtitle">Build the perfect pizza from on-chain ingredients.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          <span>Contract: {PIZZA_CONTRACT_ADDRESS ? `${PIZZA_CONTRACT_ADDRESS.slice(0, 10)}…` : 'Not set'}</span>
          <span>Chain: {chainId === MONAD_TESTNET_ID ? 'Monad Testnet' : chainId != null ? `ID ${chainId} (switch to Monad Testnet)` : '—'}</span>
        </div>
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

        {/* Left: Round options (txn hashes) or blocks for owner to start round */}
        <section className="panel panel-transactions">
          <div className="transactions-header">
            <h2 className="panel-title">{hasRound ? 'Round options' : 'Transactions'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              {!PIZZA_CONTRACT_ADDRESS && (
                <span className="error-text">Set VITE_PIZZA_CONTRACT_ADDRESS in .env and restart dev server</span>
              )}
              {loadingBlocks && <span className="loading-text">Loading blocks…</span>}
              {(error || writeError?.message) && (
                <span className="error-text">{error || writeError?.message}</span>
              )}
            </div>
          </div>
          {!hasRound && (
            <div className="transactions-header" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={fetchBlocks} disabled={loadingBlocks}>
                {loadingBlocks ? 'Loading…' : 'Fetch blocks'}
              </button>
              {isOwner && PIZZA_CONTRACT_ADDRESS && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStartRound}
                    disabled={!blocks.sauce?.transactions?.length || !blocks.cheese?.transactions?.length || !blocks.topping?.transactions?.length || isWritePending}
                  >
                    {isWritePending ? 'Starting…' : 'Start round'}
                  </button>
                  {(startRoundFeedback || isWritePending) && (
                    <span className="loading-text" style={{ fontSize: 12 }}>
                      {startRoundFeedback || 'Confirm in your wallet'}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
          {hasRound && isOwner && PIZZA_CONTRACT_ADDRESS && (
            <div className="transactions-header" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinalizeRound}
                disabled={isWritePending}
              >
                {isWritePending ? 'Finalizing…' : 'Finalize round'}
              </button>
            </div>
          )}
          {hasRound && timeLeft <= 0 && isOwner && PIZZA_CONTRACT_ADDRESS && (
            <div className="transactions-header" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={fetchBlocks} disabled={loadingBlocks}>
                {loadingBlocks ? 'Loading…' : 'Fetch blocks'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartRound}
                disabled={!blocks.sauce?.transactions?.length || !blocks.cheese?.transactions?.length || !blocks.topping?.transactions?.length || isWritePending}
              >
                {isWritePending ? 'Starting…' : 'Start new round'}
              </button>
              {(startRoundFeedback || isWritePending) && (
                <span className="loading-text" style={{ fontSize: 12 }}>
                  {startRoundFeedback || 'Confirm in your wallet'}
                </span>
              )}
            </div>
          )}
          <div className="transactions-layers">
            {hasRound ? (
              <>
                <div className="transaction-layer transaction-layer--sauce">
                  <h3 className="layer-title">Sauce</h3>
                  <div className="transaction-cards">
                    {roundOptionData.sauce.map(({ hash, fee }, i) => {
                      const h = typeof hash === 'string' ? hash : '0x' + hash.toString(16)
                      const isSelected = selectedTxHash.sauce === h
                      return (
                        <div key={i} className="tx-card-wrap">
                          <button type="button" className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`} onClick={() => handleTxClick(h, 'sauce')}>
                            <div className="tx-row">
                              <span className="tx-value tx-hash">{formatHash(h)}</span>
                            </div>
                          </button>
                          <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="transaction-layer transaction-layer--cheese">
                  <h3 className="layer-title">Cheese</h3>
                  <div className="transaction-cards">
                    {roundOptionData.cheese.map(({ hash, fee }, i) => {
                      const h = typeof hash === 'string' ? hash : '0x' + hash.toString(16)
                      const isSelected = selectedTxHash.cheese === h
                      return (
                        <div key={i} className="tx-card-wrap">
                          <button type="button" className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`} onClick={() => handleTxClick(h, 'cheese')}>
                            <div className="tx-row">
                              <span className="tx-value tx-hash">{formatHash(h)}</span>
                            </div>
                          </button>
                          <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="transaction-layer transaction-layer--topping">
                  <h3 className="layer-title">Toppings</h3>
                  <div className="transaction-cards">
                    {roundOptionData.topping.map(({ hash, fee }, i) => {
                      const h = typeof hash === 'string' ? hash : '0x' + hash.toString(16)
                      const isSelected = selectedTxHash.topping === h
                      return (
                        <div key={i} className="tx-card-wrap">
                          <button type="button" className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`} onClick={() => handleTxClick(h, 'topping')}>
                            <div className="tx-row">
                              <span className="tx-value tx-hash">{formatHash(h)}</span>
                            </div>
                          </button>
                          <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="transaction-layer transaction-layer--sauce">
                  <h3 className="layer-title">Sauce Block #{blocks.sauce?.number ?? '—'}</h3>
                  <div className="transaction-cards">
                    {blocks.sauce?.transactions?.map((tx) => {
                      const isSelected = selectedTxHash.sauce === tx.hash
                      const fee = calculateFee(tx, blocks.sauce)
                      return (
                        <div key={tx.hash} className="tx-card-wrap">
                          <button type="button" className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`} onClick={() => handleTxClick(tx.hash, 'sauce')}>
                            <div className="tx-row">
                              <span className="tx-value tx-hash">{formatHash(tx.hash)}</span>
                            </div>
                          </button>
                          <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                        </div>
                      )
                    }) ?? []}
                  </div>
                </div>
                <div className="transaction-layer transaction-layer--cheese">
                  <h3 className="layer-title">Cheese Block #{blocks.cheese?.number ?? '—'}</h3>
                  <div className="transaction-cards">
                    {blocks.cheese?.transactions?.map((tx) => {
                      const isSelected = selectedTxHash.cheese === tx.hash
                      const fee = calculateFee(tx, blocks.cheese)
                      return (
                        <div key={tx.hash} className="tx-card-wrap">
                          <button type="button" className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`} onClick={() => handleTxClick(tx.hash, 'cheese')}>
                            <div className="tx-row">
                              <span className="tx-value tx-hash">{formatHash(tx.hash)}</span>
                            </div>
                          </button>
                          <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                        </div>
                      )
                    }) ?? []}
                  </div>
                </div>
                <div className="transaction-layer transaction-layer--topping">
                  <h3 className="layer-title">Topping Block #{blocks.topping?.number ?? '—'}</h3>
                  <div className="transaction-cards">
                    {blocks.topping?.transactions?.map((tx) => {
                      const isSelected = selectedTxHash.topping === tx.hash
                      const fee = calculateFee(tx, blocks.topping)
                      return (
                        <div key={tx.hash} className="tx-card-wrap">
                          <button type="button" className={`transaction-card${isSelected ? ' transaction-card--selected' : ''}`} onClick={() => handleTxClick(tx.hash, 'topping')}>
                            <div className="tx-row">
                              <span className="tx-value tx-hash">{formatHash(tx.hash)}</span>
                            </div>
                          </button>
                          <div className="tx-fee-below">{formatFeeMon(fee, formatEther)}</div>
                        </div>
                      )
                    }) ?? []}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Center: Pizza */}
        <section className="panel panel-play-area">
          <div className="play-top-row">
            <div className="timer-chip">
              <span className="timer-label">Time left</span>
              <span className="timer-value">
                {hasRound ? `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}` : '—'}
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
          <div className="play-actions" style={{ minHeight: 80 }}>
            <p className="legend-empty" style={{ marginBottom: 6 }}>
              {hasRound ? '' : null}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn-secondary" type="button" onClick={handleResetPizza} aria-label="Reset pizza selection">
                Reset Pizza
              </button>
              <button
              className="btn btn-primary"
              type="button"
              onClick={handleSendToOven}
              disabled={!hasRound || timeLeft <= 0 || !selectedTxHash.sauce || !selectedTxHash.cheese || !selectedTxHash.topping || isWritePending}
            >
              {isWritePending ? 'Submitting…' : 'Send to Oven'}
            </button>
            </div>
          </div>
          {!hasRound && PIZZA_CONTRACT_ADDRESS && (
            <p className="legend-empty" style={{ marginTop: 8 }}>No active round. Owner can start one with &quot;Start round&quot;.</p>
          )}
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

          {/* Winner (after finalize) */}
          {lastFinalizedRoundId != null && Number(lastFinalizedRoundId) > 0 && (
            <div className="order-section" style={{ marginTop: 16 }}>
              <h2 className="panel-title">Last round winner</h2>
              <div className="order-card">
                <div className="order-item-row">
                  <span className="order-label">Round</span>
                  <span className="order-value">{String(lastFinalizedRoundId)}</span>
                </div>
                <div className="order-item-row">
                  <span className="order-label">Winner</span>
                  <span className="order-value tx-hash" title={typeof lastWinner === 'string' ? lastWinner : ''}>
                    {lastWinner != null && String(lastWinner).toLowerCase() !== '0x0000000000000000000000000000000000000000'
                      ? (typeof lastWinner === 'string' ? `${lastWinner.slice(0, 6)}…${lastWinner.slice(-4)}` : '—')
                      : 'No correct submissions'}
                  </span>
                </div>
                <div className="order-item-row">
                  <span className="order-label">Time</span>
                  <span className="order-value">{lastWinnerTimeTaken != null ? `${Number(lastWinnerTimeTaken)}s` : '—'}</span>
                </div>
                <div className="order-item-row">
                  <span className="order-label">Total fee</span>
                  <span className="order-value">{lastWinnerTotalFee != null ? formatFeeMon(lastWinnerTotalFee, formatEther) : '—'}</span>
                </div>
              </div>
            </div>
          )}

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
                  <div className="legend-group legend-group--sauce">
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
                  <div className="legend-group legend-group--cheese">
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
                  <div className="legend-group legend-group--topping">
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
