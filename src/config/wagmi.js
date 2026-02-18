import { createConfig, http, injected } from 'wagmi'
import { defineChain } from 'viem'
import { fallback } from 'viem'

/**
 * Monad Testnet
 * Chain ID: 10143
 * Explorer: https://testnet.monadscan.com
 * Token: MON
 */
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-testnet.monadinfra.com',
        'https://testnet-rpc.monad.xyz',
        'https://rpc.ankr.com/monad_testnet',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Scan',
      url: 'https://testnet.monadscan.com',
    },
  },
})

const rpcTimeout = 15_000

const publicRpcs = [
  http('https://rpc-testnet.monadinfra.com', { timeout: rpcTimeout }),
  http('https://testnet-rpc.monad.xyz', { timeout: rpcTimeout }),
  http('https://rpc.ankr.com/monad_testnet', { timeout: rpcTimeout }),
]

const customRpc = typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONAD_RPC_URL
const customUrl = typeof customRpc === 'string' ? customRpc.trim() || null : null
const transports = customUrl
  ? [http(customUrl, { timeout: rpcTimeout }), ...publicRpcs]
  : publicRpcs

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: fallback(transports),
  },
})
