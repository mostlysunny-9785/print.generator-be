import {Request, Response} from "express";
import {Image, ImageDocument, ImageTypes} from "../model/image.model";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";
import {UserDocument} from "../model/User";
import * as fs from "fs";
import logger from "../util/logger";
import {Folder, FolderDocument, FolderType} from "../model/folder.model";
import {Word} from "../model/word.model";

export class FoldersControllerClass {
    get(req: Request, res: Response){
        let user = (req.user as UserDocument)._id;

        Folder.find({ownerId: user})
            .sort({createdAt: 1})
            .exec( (error, folders: FolderDocument[]) => DefaultResponseHandler(error, folders, res));

    }

    add(req: Request, res: Response){
        let user = (req.user as UserDocument)._id;
        let id = req.body.id;
        let type = req.body.type;

        if (type === 'WORD') {
            type = FolderType.WORD;
        } else {
            type = FolderType.IMAGE;
        }

        const folderDocument = {
            id,
            ownerId: user,
            type
        } as FolderDocument

        const folder = new Folder(folderDocument);
        folder.save((err, product) => {
            if (err) {
                logger.error('Cant save to mongo.');
                DefaultSimpleResponseHandler(new Error('Cant save to mongo'), res);
            } else {
                res.statusCode = 201;
                res.json(product);
            }
        });

    }

    delete(req: Request, res: Response){
        let ownerId = (req.user as UserDocument)._id;
        let _id = req.params.folderId;
        Folder.deleteOne({_id, ownerId}, (err) => DefaultSimpleResponseHandler(err, res));
    }
}

export const FoldersController = new FoldersControllerClass();
