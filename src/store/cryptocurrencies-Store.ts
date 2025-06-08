import { defineStore } from 'pinia'
import coinbase from '../types/coinbase'
import cryptocurrenciesService from '../service/cryptocurrenciesService'
import { ref } from 'vue'

export const useCryptocurrenciesStore = defineStore('Cryptocurrencies-store', () => {
  const coinbase = ref<coinbase[]>([])




  async function GetCryptocurrencies (): Promise<coinbase> {
    const response = await cryptocurrenciesService.GetCryptocurrencies()
    coinbase.value = response
    return response
  }

  return {
    coinbase,
    GetCryptocurrencies,
  }
})
