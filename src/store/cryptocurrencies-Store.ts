import { defineStore } from 'pinia'
import type BitcoinData from '../types/Coinbase'
import cryptocurrenciesService from '../service/cryptocurrenciesService'
import { ref } from 'vue'
import type { CryptoData } from '../types/CoinBaseId'

export const useCryptocurrenciesStore = defineStore('Cryptocurrencies-store', () => {
  const Coinbase = ref<BitcoinData[]>([])
  const CoinbaseId = ref<CryptoData[]>([])




async function GetCryptocurrencies(): Promise<BitcoinData[]> {
  const data = await cryptocurrenciesService.GetCryptocurrencies()
  Coinbase.value = data
  console.log('Dados das moedas:', Coinbase.value)
  return data
}

async function GetCryptocurrenciesByid(symbol: string): Promise<CryptoData[]> {
  const data = await cryptocurrenciesService.GetCryptocurrenciesByid(symbol)
  CoinbaseId.value = data
  console.log('Dados da moedas', Coinbase.value)
  return data
}

  return {
    Coinbase,
    GetCryptocurrencies,
    GetCryptocurrenciesByid
  }
})
