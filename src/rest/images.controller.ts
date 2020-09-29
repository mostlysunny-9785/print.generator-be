import {Request, Response} from "express";
import {Image, ImageDocument, ImageTypes} from "../model/image.model";
import {DefaultResponseHandler, DefaultSimpleResponseHandler} from "./default.controller";
import {UserDocument} from "../model/User";
import * as fs from "fs";
import logger from "../util/logger";
import sharp, {OutputInfo} from "sharp";
import {IMAGE_FOLDER, RESULTS_FOLDER} from "../util/constants";
import {parseHrtimeToSeconds} from "../util/helpers";
import {Generated, GeneratedDocument} from "../model/generated.model";

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

        if (files.length === 0) {
            DefaultSimpleResponseHandler(new Error('User didnt upload any pictures!'), res);
            return;
        }

        var saveMultiple: Promise<ImageDocument>[] = [];


        files.forEach((file: Express.Multer.File) => {
            saveMultiple.push(new Promise((resolve, reject) => {
                ImagesController.saveAndCreateImage(file, ownerId, folderId)
                    .then((createdDocument) => {
                        createdDocuments.push(createdDocument)
                        resolve(createdDocument);
                        // if (index === array.length -1) resolve(createdDocument);
                    })
                    .catch((err) => {
                        reject(new Error('Cant save to mongo ' + err));
                    })
            }))
        });

        var thumbnailsMultiple: Promise<ImageDocument>[] = [];
        let imageDocs: ImageDocument[] = [];
        // after all images has been sucessfully saved -> create thumbnails
        Promise.all(saveMultiple).then((imageDocuments: ImageDocument[]) => {
            imageDocs = imageDocuments;
            imageDocuments.forEach(imageDocument => {
                thumbnailsMultiple.push(new Promise((resolve, reject) => {
                    sharp(IMAGE_FOLDER + '/' + imageDocument.filename)
                        .resize({width: 420})// A3 dimensions
                        .toFile(IMAGE_FOLDER + '/thumb/' + imageDocument.filename)
                        .then((outputInfo: OutputInfo) => {
                            resolve(imageDocument);
                        }).catch(reason => {
                            reject(new Error('Creating of thumbnail was unsuccessfull: ' + reason));
                    });
                }))
            })

            // wait for thumbnails to be created
            Promise.all(thumbnailsMultiple).then((outputs: ImageDocument[]) => {
                res.statusCode = 201;
                res.json(outputs);
            }).catch(reason => {
                DefaultSimpleResponseHandler(reason, res);
            });

        }).catch(reason => {
            DefaultSimpleResponseHandler(reason, res);
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

    createThumbnail() {

    }


    get(req: Request, res: Response){
        let user = (req.user as UserDocument)._id;
        Image.find({ownerId: user})
            .exec( (error, images: ImageDocument[]) => DefaultResponseHandler(error, images, res));
    }
}

export var ImagesController = new ImagesControllerClass();
