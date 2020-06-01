import {Request, Response} from "express";
import {DB} from "../db/db";
import {Chanel, ChanelDocument} from "../model/chanel.model";
import logger from "../util/logger";
import {UserDocument} from "../model/User";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";

export class ChannelsControllerClass {

    public add(req: Request, res: Response) {
        let user = (req.user as UserDocument)._id;
        Chanel.find({ownerId: user}, (error: any, chanel: ChanelDocument[]) => DefaultResponseHandler(error, chanel, res));
    }

    public get(req: Request, res: Response) {
        let user = (req.user as UserDocument)._id;
        Chanel.find({ownerId: user}, (error: any, chanel: ChanelDocument[]) => DefaultResponseHandler(error, chanel, res));
    }

    public delete(req: Request, res: Response) {
        let chanelId = req.params.chanelId;
        Chanel.remove({_id: chanelId}, (err) => DefaultSimpleResponseHandler(err, res));
    }
}

export var ChannelsController = new ChannelsControllerClass();
