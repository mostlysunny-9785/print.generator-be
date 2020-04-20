import {Request, Response} from "express";
import {DB} from "../db/db";

export class UsersControllerClass {

    list(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    get(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    create(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }

    update(req: Request, res: Response){
        res.status(501).send("Unimplemented");
    }
}

export var UsersController = new UsersControllerClass();
