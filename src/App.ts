import express = require("express");
import {Request, Response} from "express";
import {ScrapController} from "./rest/scrap.controller";
import {DB} from "./db/db";
import {Routes} from "./rest/routes";
const cors = require('cors')

export class AppClass {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.initExpress();


    }

    initExpress() {

        this.app.use(cors());
        this.app.use(express.json()) // for parsing application/json
        Routes.routes(this.app);


    }
}

export default new AppClass().app;
