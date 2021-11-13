import 'reflect-metadata';
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { container } from './container';
import { App } from './app';
import { CoinsController } from './controllers/coinsController';
import { TYPES } from './types';

const startServer = async () => {
    const port = process.env.PORT || 3000 as any;
    const app = new App([
        container.get<CoinsController>(TYPES.CoinsController)
    ], port);
    app.listen();
}

startServer();