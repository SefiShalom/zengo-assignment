
export interface CoinsDataService {
    difference(symbols: string[], fromDate: string, toSymbol?: string): Promise<{[symbol: string] : string}>
}