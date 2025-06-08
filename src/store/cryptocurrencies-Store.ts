import { defineStore } from 'pinia'
import type BitcoinData from '../types/Coinbase'
import cryptocurrenciesService from '../service/cryptocurrenciesService'
import { ref } from 'vue'

export const useCryptocurrenciesStore = defineStore('Cryptocurrencies-store', () => {
  const Coinbase = ref<BitcoinData[]>([])




  async function GetCryptocurrencies (): Promise<BitcoinData[]> {
    const response = await cryptocurrenciesService.GetCryptocurrencies()
    Coinbase.value = response
    console.log('dados das moedas' , response)
    return response
  }

  return {
    Coinbase,
    GetCryptocurrencies,
  }
})
