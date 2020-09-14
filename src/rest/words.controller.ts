import {Request, Response} from "express";
import {UserDocument} from "../model/User";
import {WordDocument, Word} from "../model/word.model";
import logger from "../util/logger";
import {DefaultSimpleResponseHandler} from "./default.controller";
import {Image} from "../model/image.model";

export class WordsControllerClass {

    add(req: Request, res: Response){
        let ownerId = (req.user as UserDocument)._id;
        let folderId = req.params.folderId;
        let content = req.body.content;

        const wordDocument = {
            content,
            created: new Date(),
            folderId,
            ownerId
        } as WordDocument;

        const word = new Word(wordDocument);
        word.save((err, product) => {
            if (err) {
                logger.error('Cant save to mongo.');
                DefaultSimpleResponseHandler(new Error('CantSave to mongo'), res);
            } else {
                res.statusCode = 201;
                res.json(product);
            }
        });

    }

    update(req: Request, res: Response){
        let ownerId = (req.user as UserDocument)._id;
        let _id = req.params.wordId;
        let content = req.body.content;
        Word.findOneAndUpdate({_id, ownerId}, {content}, (err, word) => {
            if (err) {
                DefaultSimpleResponseHandler(new Error('Cant find word with ID: ' + _id), res);
            } else {
                res.status(200).json(word);
            }
        })


    }

    delete(req: Request, res: Response){
        let ownerId = (req.user as UserDocument)._id;
        let _id = req.params.wordId;
        Word.deleteOne({_id, ownerId}, (err) => DefaultSimpleResponseHandler(err, res));
    }

    get(req: Request, res: Response){
        let ownerId = (req.user as UserDocument)._id;
        let folderId = req.params.folderId;

        Word.findOne({ownerId, folderId}, (err, word) => {
            if (err || !word) {
                DefaultSimpleResponseHandler(new Error('Cant find word from folder with id: ' + folderId), res);
            } else {
                res.status(200).json(word);
            }
        });
    }
}

export var WordsController = new WordsControllerClass();
