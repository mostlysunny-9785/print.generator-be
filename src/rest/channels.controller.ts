import {Request, Response} from "express";
import {DB} from "../db/db";

export class ChannelsControllerClass {

    public get(req: Request, res: Response) {
        res.send(DB.getChanel());
    }

    public delete(req: Request, res: Response) {
        DB.removeChanel(req.params.chanel)
    }
}

export var ChannelsController = new ChannelsControllerClass();
