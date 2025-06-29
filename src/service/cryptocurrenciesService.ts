import { api } from '../boot/axios'
import type BitcoinData from '../types/Coinbase'
import type { CryptoData } from '../types/CoinBaseId'


class CryptocurrenciesService {


  async GetCryptocurrencies(): Promise<BitcoinData[]> {
    
    try {
      const response = await api.get('https://api.coinbase.com/v2/assets/search', {
       withCredentials: false 
      })
      return response.data.data
    } catch (error: any) {
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

    async GetCryptocurrenciesByid(symbol:string): Promise<CryptoData[]> {
    
    try {
      const response = await api.get(`https://api.coinbase.com/v2/assets/search?query=${symbol}`, {
       withCredentials: false 
      })
      return response.data.data
    } catch (error: any) {
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
}

export default new CryptocurrenciesService()
