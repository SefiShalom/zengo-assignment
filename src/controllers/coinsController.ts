import express from "express";
import { inject, injectable } from "inversify";
import { CoinsDataService } from "../services/coinsDataService";
import { TYPES } from "../types";

@injectable()
export class CoinsController {

  public path = '/coins';
  public router = express.Router();
  
  @inject(TYPES.CoinsDataService)
  private coinsDataService: CoinsDataService

  constructor(
  ) {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(`${this.path}/difference`, this.difference.bind(this));
  }
 
  async difference(request: express.Request, response: express.Response) {
    try {
      const coins = request.body.coins as string[];
      const fromDateStr = request.body.fromDate as string;
      const tsym = request.body.tsym as string;
      if(!coins || !fromDateStr) {
        return response.status(400).send("Bad Request!");
      }
      const differnce = await this.coinsDataService.difference(coins, fromDateStr, tsym);  
      return response.status(200).send(differnce);
    } catch(err: any) {
      console.error(err);
      response.status(500).send(err.message);
    }
  }
};