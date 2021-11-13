import axios from "axios";
import { CryptoCompareDataService } from "../src/services/cryptoCompareDataService";

jest.mock("axios");

describe("CryptoCompare Data Service", () => {

    const cryptoCompareDataService = new CryptoCompareDataService()

    axios.get = jest.fn()
    .mockImplementationOnce(() => {
        return {
            data: {
                DOGE: {
                  USD: 0.2594,
                },
                BTC: {
                  USD: 64089.32,
                },
                ETH: {
                  USD: 4646.23,
                },
                BNB: {
                  USD: 647.37,
                },
            }
        }
    })
    .mockImplementationOnce(() => {
        return {
            data: {
                BTC: {
                  USD: 9697.86,
                }
            }
        }
    }).mockImplementationOnce(() => {
        return {
            data: {
                BNB: {
                  USD: 22.21,
                }
            }
        }
    }).mockImplementationOnce(() => {
        return {
            data: {
                ETH: {
                  USD: 256.62,
                }
            }
        }
    })
    .mockImplementationOnce(() => {
        return {
            data: {
                Response: "Error",
                Message: "There is no data for the symbol DOE ."
            }
        }
    });

    it("should return coins differences in percents, DOE should error", async () => {
        const symbols = ["BTC", "ETH", "BNB", "DOE"];
        const fromDate = "01/01/2020";
        const toSymbol = "USD";
        const difference = await cryptoCompareDataService.difference(symbols, fromDate, toSymbol);
        console.log(difference);
        expect(difference).toStrictEqual 
        ({
            BNB: "2814.77%",
            ETH: "1710.55%",
            BTC: "560.86%",
            DOE: "There is no data for the symbol DOE .",
          });

    });

})