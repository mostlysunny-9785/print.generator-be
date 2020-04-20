import {Request, Response} from "express";
import {DB} from "../db/db";

export class ImagesControllerClass {
    delete(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    get(req: Request, res: Response){
        res.send(DB.getImages());
    }
}

export var ImagesController = new ImagesControllerClass();
