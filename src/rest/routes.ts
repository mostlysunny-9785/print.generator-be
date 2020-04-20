import {Application, Request, Response, Router} from "express";
import {ScrapController} from "./scrap.controller";
import {DB} from "../db/db";
import express = require("express");
import {ChannelsController} from "./channels.controller";
import {ImagesController} from "./images.controller";
import {UsersController} from "./users.controller";


export class RoutesClass {


    private prefix: String = "/api";

    public routes(app: Application): void {
        let router = Router();


        router.get('/', (req: Request, res: Response) => {
            res.send('hello there');
        });

        router.post('/scrap', ScrapController.post);
        router.get('/channels', ChannelsController.get);
        router.delete('/channels', ChannelsController.delete);

        router.get('/images', ImagesController.get);
        router.delete('/images/:id', ImagesController.delete);
        router.use('/imagefiles', express.static('images/'));

        router.get('/users', UsersController.list);
        router.get('/user/:id', UsersController.get);
        router.post('/user', UsersController.create);
        router.put('/user', UsersController.update);


        app.use("/api", router);
    }
}

export var Routes = new RoutesClass();
