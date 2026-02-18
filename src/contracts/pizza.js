import { pizzaAbi } from './pizzaAbi'

const raw = typeof import.meta !== 'undefined' && import.meta.env?.VITE_PIZZA_CONTRACT_ADDRESS
export const PIZZA_CONTRACT_ADDRESS = typeof raw === 'string' ? raw.trim() || undefined : undefined

export const pizzaContract = PIZZA_CONTRACT_ADDRESS
  ? { address: PIZZA_CONTRACT_ADDRESS, abi: pizzaAbi }
  : null
