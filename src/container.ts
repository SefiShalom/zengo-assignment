import { Container } from "inversify";
import { TYPES } from "./types";
import { CoinsController } from "./controllers/coinsController";
import { CryptoCompareDataService } from "./services/cryptoCompareDataService";
import { CoinsDataService } from "./services/coinsDataService";

const container = new Container();
container.bind<CoinsDataService>(TYPES.CoinsDataService).to(CryptoCompareDataService);
container.bind<CoinsController>(TYPES.CoinsController).to(CoinsController);

export { container };