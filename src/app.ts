import "reflect-metadata";
const express = require("express");

export class App {
  public app: any;
  public port: number;
 
  constructor(controllers: any, port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares(); 
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    this.app.use(express.json());
  }

  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on port ${this.port}`);
    });
  }
}