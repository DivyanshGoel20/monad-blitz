import { createConfig, http, injected } from 'wagmi'
import { defineChain } from 'viem'

/**
 * Monad Testnet
 * Chain ID: 10143
 * RPC: Alchemy endpoint (configured in transports)
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
      http: ['https://rpc.testnet.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Scan',
      url: 'https://testnet.monadscan.com',
    },
  },
})

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  transports: {
    [monadTestnet.id]: http('https://monad-testnet.g.alchemy.com/v2/Efa1xpDsuSqeFT7TPlJ_6'),
  },
})
