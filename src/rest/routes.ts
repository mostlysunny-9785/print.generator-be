import {Application, Request, Response, Router} from "express";
import {ScrapController} from "./scrap.controller";
import {DB} from "../db/db";
import express from "express";
import {ChannelsController} from "./channels.controller";
import {ImagesController} from "./images.controller";
import {UsersController} from "./users.controller";
import {Passport} from "../config/passport";
import multer from "multer";
import {WordsController} from "./words.controller";
import {FoldersController} from "./folders.controller";
import {ToolController} from "./tool.controller";
import {IMAGE_FOLDER} from "../util/constants";


export class RoutesClass {


    private prefix: String = "/api";

    public routes(app: Application): void {
        let router = Router();


        router.get('/', (req: Request, res: Response) => {
            res.send('hello there stranger');
        });

        router.post(  '/scrap', Passport.isAuthenticated, ScrapController.post);
        router.get(   '/channels', Passport.isAuthenticated, ChannelsController.get);
        router.delete('/channels/:chanelId', Passport.isAuthenticated, ChannelsController.delete);


        router.get(   '/folders', Passport.isAuthenticated, FoldersController.get);
        router.post(  '/folders', Passport.isAuthenticated, FoldersController.add);
        router.delete('/folders/:folderId', Passport.isAuthenticated, FoldersController.delete);

        var upload = multer({dest: IMAGE_FOLDER});
        // var jsonParser = bodyParser.json()
        router.post(  '/images/:folderId', Passport.isAuthenticated, upload.array('data'), ImagesController.post);
        router.get(   '/images', Passport.isAuthenticated, ImagesController.get);
        router.get(   '/arenaimages/:chanelId', Passport.isAuthenticated, ImagesController.getByChanel);
        router.get(   '/images/:folderId', Passport.isAuthenticated, ImagesController.getByFolder);
        router.delete('/images/:id/:folderId', Passport.isAuthenticated, ImagesController.delete);
        router.use(         '/imagefiles', Passport.isAuthenticated, express.static(IMAGE_FOLDER + '/'));


        router.get(   '/words', Passport.isAuthenticated, WordsController.getAll);
        router.get(   '/words/:folderId', Passport.isAuthenticated, WordsController.get);
        router.post(  '/words/:folderId', Passport.isAuthenticated, WordsController.add);
        router.put(   '/words/:wordId', Passport.isAuthenticated, WordsController.update);
        router.delete('/words/:wordId', Passport.isAuthenticated, WordsController.delete);

        router.post('/tool', Passport.isAuthenticated, ToolController.add);
        router.get('/tool/list', Passport.isAuthenticated, ToolController.list);

        router.get( '/users', Passport.isAuthenticated, UsersController.list);
        router.get( '/user/:id', Passport.isAuthenticated, UsersController.get);
        router.post('/user', Passport.isAuthenticated, UsersController.create);
        router.put( '/user', Passport.isAuthenticated, UsersController.update);

        router.post('/login', UsersController.postLogin);
        router.get( '/session', Passport.isAuthenticated, UsersController.session);
        router.get( '/logout',Passport.isAuthenticated, UsersController.logout);


        app.use("/api", router);
    }
}

export var Routes = new RoutesClass();
