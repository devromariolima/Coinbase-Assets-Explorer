import { api } from '../boot/axios'
import type { BitcoinData } from '../types/coinbase'


class CryptocurrenciesService {


  async GetCryptocurrencies (params?: void): Promise<BitcoinData> {
     try {
    const response = await api.get(`https://api.coinbase.com/v2/assets/search`, { params })
    return response.data
     }
  }  catch (error: {
      response?: {
        status?: number
        data?: {
          detail?: string
          message?: string
        }
      }
    }) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            detail?: string;
            message?: string;
          };
        };
      }
      if (axiosError.response?.status === 422) {
        throw new Error(axiosError.response.data?.detail || 'Erro de validação')
      }

      throw new Error(axiosError.response?.data?.message || 'Erro de validação')
    }
}

export default new CryptocurrenciesService()
