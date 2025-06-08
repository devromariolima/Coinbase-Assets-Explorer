import { api } from '../boot/axios'
// import {Cryptocurrencies,} from 'src/types/Cryptocurrencies'
// import { AxiosError, AxiosResponse } from 'axios'


class CryptocurrenciesService {


  async GetCryptocurrencies (params?: void): Promise<void> {
    const response = await api.get(`https://api.coinbase.com/v2/assets/search`, { params })
    return response.data
  }

}

export default new CryptocurrenciesService()
