import { defineStore } from 'pinia'
import type BitcoinData from '../types/Coinbase'
import cryptocurrenciesService from '../service/cryptocurrenciesService'
import { ref } from 'vue'

export const useCryptocurrenciesStore = defineStore('Cryptocurrencies-store', () => {
  const Coinbase = ref<BitcoinData[]>([])




async function GetCryptocurrencies(): Promise<BitcoinData[]> {
  const data = await cryptocurrenciesService.GetCryptocurrencies()
  Coinbase.value = data
  console.log('Dados das moedas:', Coinbase.value)
  return data
}

  return {
    Coinbase,
    GetCryptocurrencies,
  }
})
