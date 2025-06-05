import { api } from 'boot/axios'
// import {Cryptocurrencies,} from 'src/types/Cryptocurrencies'
// import { AxiosError, AxiosResponse } from 'axios'


class CryptocurrenciesService {


  async Cryptocurrencies (teste: string, params?: void): Promise<void> {
    const response = await api.get(`url/${teste}/url`, { params })
    return response.data
  }

}

export default new CryptocurrenciesService()
