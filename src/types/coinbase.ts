export interface ResourceUrl {
  type: string;
  icon_url: string;
  title: string;
  link: string;
}

export interface Amount {
  amount: string;
  currency: string;
  scale: string;
}

export interface PercentChange {
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
  all: number;
}

export interface LatestPrice {
  amount: Amount;
  timestamp: string;
  percent_change: PercentChange;
}

export interface BitcoinData {
  id: string;
  symbol: string;
  name: string;
  slug: string;
  color: string;
  image_url: string;
  listed: boolean;
  description: string;
  exponent: number;
  unit_price_scale: number;
  transaction_unit_price_scale: number;
  address_regex: string;
  resource_urls: ResourceUrl[];
  base: string;
  currency: string;
  rank: number;
  market_cap: string;
  percent_change: number;
  launched_at: string;
  latest: string;
  latest_price: LatestPrice;
  circulating_supply: string;
  volume_24h: string;
  dominance: string;
}