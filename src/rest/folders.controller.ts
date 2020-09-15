import {Request, Response} from "express";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";
import {UserDocument} from "../model/User";
import logger from "../util/logger";
import {Folder, FolderDocument, FolderType} from "../model/folder.model";
import {Image} from "../model/image.model";
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
        // find folder contents and delete them
        Folder.findOne({_id, ownerId}, (err, folder: FolderDocument) => {
            if (err) {
                logger.error('Cant find folder.');
                DefaultSimpleResponseHandler(new Error('Cant find folder'), res);
            } else {
                // ten delete also folder content
                const promise = new Promise((resolve, reject) => {
                    if (folder.type.toString() === FolderType.WORD.toString()) {
                        Word.deleteMany({ownerId, folderId: folder.id}, (err) => {
                            if (err) {
                                logger.error('Error during removal .' + err.message);
                                reject(err);
                            } else {
                                resolve();
                            }

                        });
                    } else if (folder.type.toString() === FolderType.IMAGE.toString()) {
                        Image.deleteMany({ownerId, folderId: folder.id}, (err) => {
                            if (err) {
                                logger.error('Error during image removal .' + err.message);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                })

                promise.then(value => {
                    // then delete folder and send results
                    Folder.deleteOne({_id, ownerId}, (err2) => DefaultSimpleResponseHandler(err2, res));
                }).catch(reason => {
                    DefaultSimpleResponseHandler(reason, res)
                })

            }


        })


    }
}

export const FoldersController = new FoldersControllerClass();
