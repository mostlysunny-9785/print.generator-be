import {Application, Request, Response, Router} from "express";
import {ScrapController} from "./scrap.controller";
import {DB} from "../db/db";
import express from "express";
import {ChannelsController} from "./channels.controller";
import {ImagesController} from "./images.controller";
import {UsersController} from "./users.controller";
import {Passport} from "../config/passport";
import multer from "multer";


export class RoutesClass {


    private prefix: String = "/api";

    public routes(app: Application): void {
        let router = Router();


        router.get('/', (req: Request, res: Response) => {
            res.send('hello there stranger');
        });

        router.post('/scrap', Passport.isAuthenticated, ScrapController.post);
        router.get('/channels', Passport.isAuthenticated, ChannelsController.get);
        router.delete('/channels/:chanelId', Passport.isAuthenticated, ChannelsController.delete);


        var upload = multer({dest: "images"});
        router.post('/images/:folderId', Passport.isAuthenticated, upload.array('data'), ImagesController.post);
        router.get('/images', Passport.isAuthenticated, ImagesController.get);
        router.get('/arenaimages/:chanelId', Passport.isAuthenticated, ImagesController.getByChanel);
        router.get('/images/:folderId', Passport.isAuthenticated, ImagesController.getByFolder);
        router.delete('/images/:id/:folderId', Passport.isAuthenticated, ImagesController.delete);
        router.use('/imagefiles', Passport.isAuthenticated, express.static('images/'));

        router.get('/users', Passport.isAuthenticated, UsersController.list);
        router.get('/user/:id', Passport.isAuthenticated, UsersController.get);
        router.post('/user', Passport.isAuthenticated, UsersController.create);
        router.put('/user', Passport.isAuthenticated, UsersController.update);

        router.post('/login', UsersController.postLogin);
        router.get('/session', Passport.isAuthenticated, UsersController.session);
        router.get('/logout',Passport.isAuthenticated, UsersController.logout);


        app.use("/api", router);
    }
}

export var Routes = new RoutesClass();
