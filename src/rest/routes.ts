import {Application, Request, Response, Router} from "express";
import {ScrapController} from "./scrap.controller";
import {DB} from "../db/db";
import express = require("express");


export class RoutesClass {


    private prefix: String = "/api";

    public routes(app: Application): void {
        let router = Router();


        router.get('/', (req: Request, res: Response) => {
            res.send('hello there');
        });

        router.post('/scrap', ScrapController.post);
        router.get('/chanels', (req: Request, res: Response) => {res.send(DB.getChanel());});
        router.delete('/chanels', (req: Request, res: Response) => {DB.removeChanel(req.params.chanel)});



        router.get('/images', (req: Request, res: Response) => {
            res.send(DB.getImages());
        });

        router.use('/imagefiles', express.static('images/'));
        app.use("/api", router);
    }
}

export var Routes = new RoutesClass();
