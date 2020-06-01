import {Request, Response} from "express";
import {DB} from "../db/db";
import {Image, ImageDocument} from "../model/image.model";
import {DefaultResponseHandler} from "./default.controller";

export class ImagesControllerClass {
    getByChanel(req: Request, res: Response) {
        let chanelId = req.params.chanelId;
        Image.find({chanelId}, (error, images: ImageDocument[]) => DefaultResponseHandler(error, images, res));
    }

    delete(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    get(req: Request, res: Response){

        // res.send(DB.getImages());
    }
}

export var ImagesController = new ImagesControllerClass();
