import {Request, Response} from "express";
import {Image, ImageDocument, ImageTypes} from "../model/image.model";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";
import {UserDocument} from "../model/User";
import * as fs from "fs";
import logger from "../util/logger";

export class ImagesControllerClass {
    getByChanel(req: Request, res: Response) {
        let chanelId = req.params.chanelId;
        Image.find({chanelId}, (error, images: ImageDocument[]) => DefaultResponseHandler(error, images, res));
    }

    getByFolder(req: Request, res: Response) {
        let user = (req.user as UserDocument)._id;
        let folderId = req.params.folderId;
        Image.find({ownerId: user, folderId})
            .sort({createdAt: -1})
            .exec( (error, images: ImageDocument[]) => DefaultResponseHandler(error, images, res));

    }

    delete(req: Request, res: Response){
        let ownerId = (req.user as UserDocument)._id;
        let _id = req.params.id;
        let folderId = req.params.folderId;
        Image.deleteOne({folderId, _id, ownerId}, (err) => DefaultSimpleResponseHandler(err, res));
    }


    async post(req: Request, res: Response) {
        let folderId = req.params.folderId;
        let ownerId = (req.user as UserDocument)._id;
        const files = req.files as Express.Multer.File[];

        const createdDocuments: ImageDocument[] = [];

        var saveResults = new Promise((resolve, reject) => {
            files.forEach((file: Express.Multer.File, index, array) => {
                ImagesController.saveAndCreateImage(file, ownerId, folderId)
                    .then((createdDocument) => {
                        createdDocuments.push(createdDocument)
                        if (index === array.length -1) resolve();
                    })
                    .catch((err) => {
                        DefaultSimpleResponseHandler(err, res);
                        reject();
                    })


            });
        });

        saveResults.then(() => {
                res.statusCode = 201;
                res.json(createdDocuments);
            });

        saveResults.catch(() => {
                logger.error('Nothing has been saved.');
                DefaultSimpleResponseHandler(new Error('Empty result :('), res);
            });


        logger.info('User just uploaded ' + files.length + ' files');


    }

    saveAndCreateImage(file: Express.Multer.File, ownerId: string, folderId: string): Promise<ImageDocument> {
        return new Promise((resolve, reject) => {
            if (!file.mimetype.includes('image/') || !file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
                logger.error('Mime type of uploaded file is unacceptable.');
                reject(new Error('Only image files are allowed! Mime: ' + file.mimetype));
            } else {
                const extension = file.mimetype.split('/')[1];
                const oldFilename = file.destination + '/' + file.filename;
                const newFilename = oldFilename + '.' + extension;


                fs.rename(oldFilename, newFilename, err => {
                    if (err){
                        logger.error('Cant move file :(');
                        reject(new Error('FS error'));
                    }
                    const imageDocument = {
                        title: file.originalname,
                        created: new Date(),
                        description: 'User uploaded pic',
                        localPath: newFilename,
                        remotePath: '',
                        fileSize: file.size,
                        filename: file.filename + '.' + extension,
                        chanelId: '',
                        imageType: ImageTypes.FILE,
                        ownerId,
                        folderId
                    } as ImageDocument
                    const image = new Image(imageDocument);
                    image.save((err1, product) => {
                        if (err1) {
                            logger.error('Cant save to mongo.');
                            reject(new Error('Saving error'));
                        }
                        resolve(product)
                    });


                });
            }
        });

    }


    get(req: Request, res: Response){

        // res.send(DB.getImages());
    }
}

export var ImagesController = new ImagesControllerClass();
