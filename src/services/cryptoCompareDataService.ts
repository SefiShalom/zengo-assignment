import 'reflect-metadata';
import { CoinsDataService } from "./coinsDataService";
import axios from "axios";
import { injectable } from "inversify";

const DEFAULT_TSYM = "USD";
const PRICE_MULTI_URL = "https://min-api.cryptocompare.com/data/pricemulti?fsyms={0}&tsyms={1}";
const PRICE_HISTORICAL_URL = "https://min-api.cryptocompare.com/data/pricehistorical?fsym={0}&tsyms={1}&ts={2}";
const DAY_MILLISEC = 24*60*60*1000;

@injectable()
export class CryptoCompareDataService implements CoinsDataService {

    public async difference(symbols: string[], fromDate: string, tsym?: string | undefined): Promise<{[symbol: string] : string}> {
        const toSymbol = tsym || DEFAULT_TSYM;
        const now = Date.now();
        const fromDateTimeStamp = new Date(fromDate).getTime();
        if(!fromDateTimeStamp || now < fromDateTimeStamp) {
            throw new Error("time stamp is invalid");
        }
        const fromDateTimeStampStr = now - fromDateTimeStamp < DAY_MILLISEC ? now.toString().substring(0,10) : fromDateTimeStamp.toString().substring(0,10)
        const coinsCurrentPrices = await this.getMultiCoinsCurrentPrices(symbols, toSymbol);
        const coinsHistoricalPrices = await this.getCoinsHistoricalPrice(symbols, fromDateTimeStampStr as any, toSymbol);
        const formattedData = this.formatResponseData(coinsCurrentPrices, coinsHistoricalPrices, toSymbol);
        return formattedData;
    };

    private formatResponseData(currentPrices: any, historicalPrices: any, toSymbol: string) {
        const formattedResponse: {[key: string]: string} = {};
        const formattedData: {[key: string]: string} = {};
        for(const symbol of Object.keys(historicalPrices)) {
            const currentPrice = currentPrices[symbol];
            const historicalPrice = historicalPrices[symbol];
            if(historicalPrice.error) {
               formattedData[symbol] = historicalPrice.message;
            } else {
                const differenceInPrecents = this.calculateDifferenceInPercents(currentPrice[toSymbol], historicalPrice[toSymbol]);
                formattedData[symbol] = `${differenceInPrecents.toFixed(2)}%`;
            }
        }
        
        const sortedByPerformences = Object.entries(formattedData).sort((coin1: any, coin2: any) => {
            const coin1Diff = parseFloat(coin1[1]);
            const coin2Diff = parseFloat(coin2[1]);
            if(!coin1Diff) return 1;
            if(!coin2Diff) return -1;
            return coin2Diff - coin1Diff;
        });

        for(const priceData of sortedByPerformences) {
            const symbol = priceData[0];
            formattedResponse[symbol] = priceData[1];
        }

        return formattedResponse;
    }

    private async getCoinsHistoricalPrice(symbols: string[], fromDate: string, toSymbol: string) {
        const historicalPrices = await Promise.all(symbols.map(async (symbol: string) => {
            return await this.getSingleCoinHistoricalPrice(symbol, fromDate, toSymbol);
        }));
        const formatted: any = {};
        for(const priceData of historicalPrices) {
            const entries = Object.entries(priceData);
            const symbol = entries[0][0] as any;
            const data = entries[0][1] as any;
            if(data?.error){
                formatted[symbol] = {};
                formatted[symbol]["error"] = data.error;
                formatted[symbol]["message"] = data.message;
            } else {
                formatted[symbol] = data;
            }
        }
        return formatted;
    }

    private async getSingleCoinHistoricalPrice(symbol: string, fromDate: string, tsym: string) {
        const price: any = {};
        const url = this.formatUrl(PRICE_HISTORICAL_URL, [symbol, tsym, fromDate]);
        const coinsHistoricalPrices = await axios.get(url, { headers: { "Authorization": `Apikey ${process.env.API_KEY}` } });
        if(coinsHistoricalPrices.data.Response === "Error") {
            price[symbol] = {};
            price[symbol]["error"] = true;
            price[symbol]["message"] = coinsHistoricalPrices.data.Message;
            return price;
        }
        return coinsHistoricalPrices.data;
    }

    private async getMultiCoinsCurrentPrices(symbols: string[], tsym: string) {
        const url = this.formatUrl(PRICE_MULTI_URL, [symbols.join(), tsym]);
        const coinsCurrentPrices = await axios.get(url, { headers: { "Authorization": `Apikey ${process.env.API_KEY}` } });
        return coinsCurrentPrices.data;
    }

     private calculateDifferenceInPercents(currentPrice: number, olderPrice: number) {
        const difference = parseFloat((currentPrice - olderPrice).toFixed(2)); 
        return (difference / olderPrice) * 100;
    }

    private formatUrl(str: string, params: any[]) {
        let formatted = str;
        for(let i = 0; i < params.length; i++) {
            formatted = formatted.replace(`{${i}}`, params[i]);
        }
        return formatted;
    }
    
}