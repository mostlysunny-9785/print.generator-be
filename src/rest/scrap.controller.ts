import {ArenaScrapper} from "../scrappers/arena";
import {Request, Response} from "express";
import * as fs from "fs";
import {download_image} from "../scrappers/download_image";
import {Chanel, ChanelDocument, ChanelTypes} from "../model/chanel.model";
import logger from "../util/logger";
import {Image, ImageDocument} from "../model/image.model";
import {UserDocument} from "../model/User";
import sharp, {OutputInfo} from "sharp";
import {IMAGE_FOLDER, THUMB_WIDTH} from "../util/constants";
import {DefaultSimpleResponseHandler} from "./default.controller";

interface Stats {
    downloadedImages: number,
    appendedImages: number,
    overallDownload: number,
    thumbsGenerated: number
}

export class ScrapControllerClass {

    public async post(req: Request, res: Response) {
        let userId = (req.user as UserDocument)._id;
        if (req.body.channel) {
            // let scrap1 = await this.scrap.bind(req.body.chanel, res, userId);
            // let promise = await this.scrap(req.body.chanel, res, userId);
            let promise = await ScrapController.scrap(req.body.channel, req.body.folderId, res, userId);
            // cant use this directly because of bidning problem :/
            // https://stackoverflow.com/questions/3127429/how-does-the-this-keyword-work
        } else {
            res.send("No param chanel found")
        }
    }

    public async scrap(channelToLoad: string, folderId: string, res: Response, userId: string) {
        let channel: ChanelDocument | null = await Chanel.findOne({url: channelToLoad, ownerId: userId});

        if (channel) {
            logger.info("Reloading channel");
        } else {
            channel = new Chanel({
                ownerId: userId,
                folderId,
                url: channelToLoad,
                type: ChanelTypes.WWW,
                pictureIds: []
            });

            let promise = await channel.save();
            channel._id = promise._id;
        }

        ArenaScrapper.scrapImages(channelToLoad, 1, 100, channel._id).subscribe((imageDocument: ImageDocument[]) => {
            var stats: Stats = {
                downloadedImages: 0,
                appendedImages: 0,
                overallDownload: 0,
                thumbsGenerated: 0
            };

            const downloadedImages: Promise<ImageDocument>[] = [];
            imageDocument.forEach(image => {
                if (channel) {
                    downloadedImages.push(ScrapController.downloadAndThumbnailImage(image, folderId, channel, stats, userId));
                }

            });

            Promise.all(downloadedImages).then((imageDocumnents: ImageDocument[]) => {
                res.send(stats.overallDownload + ' images downloaded, saved ' + imageDocumnents.length + " images");
                logger.info("Scrap result ", stats);
            }).catch(reason => {
                DefaultSimpleResponseHandler(reason, res);
            })



        });
    };

    public async appendImageToChannel(image: ImageDocument, folderId: string, channel: ChanelDocument, stats: Stats, ownerId: string) {
        // if we cant find that image add it (upsert)
        Image.findOneAndUpdate({remotePath: image.remotePath, ownerId, folderId}, image, {upsert: true}, (err, image: ImageDocument | null, res: any) => {
            if (err) {
                logger.error(err);
            } else if (image) {
                let id = image._id;
                stats.appendedImages++;
                Chanel.findByIdAndUpdate(channel._id, {$addToSet: { pictureIds: image._id }}, (err) => {
                    if (err) {
                        logger.error(err);
                    }
                });
            }

        });

    }

    public async downloadAndThumbnailImage(image: ImageDocument, folderId: string, channel: ChanelDocument, stats: Stats, userId: string): Promise<ImageDocument> {
        return new Promise<ImageDocument>((resolve, reject) => {
            var newImagePath = IMAGE_FOLDER + '/' + image.filename;
            image.folderId = folderId; // set folder in which was image scrapped for
            if (!fs.existsSync(newImagePath)){ // only if we do not have that image physically
                download_image(image.remotePath, newImagePath).then((value:any) => {
                    stats.downloadedImages++;
                    image.localPath = newImagePath;
                    // create thumbnail
                    ScrapController.createThumb(image.filename, stats).then(result => {
                        this.appendImageToChannel(image, folderId, channel, stats, userId);
                        resolve(image);
                    }).catch(reason => {
                        reject(reason);
                    })
                });
            } else { // we already have that image, but do we have thumbnail?
                ScrapController.createThumb(image.filename, stats).then(value => {
                    this.appendImageToChannel(image, folderId, channel, stats, userId);
                    resolve(image);
                }).catch(reason => {
                    reject(reason);
                })
            }

        });
    }

    public async createThumb(imageFilename: string, stats: Stats): Promise<boolean> {
        const filename = IMAGE_FOLDER + '/' + imageFilename;
        const thumbFilename = IMAGE_FOLDER + '/thumb/' + imageFilename;


        return new Promise((resolve, reject) => {
            // create only if thumb filename exists
            if (!fs.existsSync(thumbFilename)) {
                sharp(filename)
                    .resize({width: THUMB_WIDTH})// A3 dimensions
                    .toFile(thumbFilename)
                    .then((outputInfo: OutputInfo) => {
                        stats.thumbsGenerated++;
                        resolve(true);
                    }).catch(reason => {
                        reject(new Error("Well arena thumbnail not created... " + reason));
                });
            } else {
                resolve(true);
            }
        });
    }

}

export var ScrapController = new ScrapControllerClass();
