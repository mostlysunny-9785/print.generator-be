import {ArenaScrapper} from "../scrappers/arena";
import {Request, Response} from "express";
import * as fs from "fs";
import {download_image} from "../scrappers/download_image";
import {Chanel, ChanelDocument, ChanelTypes} from "../model/chanel.model";
import logger from "../util/logger";
import {Image, ImageDocument} from "../model/image.model";
import {UserDocument} from "../model/User";

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

        ArenaScrapper.scrapImages(channelToLoad, 1, 1000, channel._id).subscribe((imageDocument: ImageDocument[]) => {
            // console.log({value});
            var newImages: ImageDocument[] = [];
            var stats = {
                downloadedImages: 0,
                appendedImages: 0,
                overallDownload: newImages.length
            };


            imageDocument.forEach(image => {
                var newImagePath = 'images/' + image.filename;
                image.folderId = folderId; // set folder in which was image scrapped for
                if (!fs.existsSync(newImagePath)){ // only if we do not have that image physically
                    download_image(image.remotePath, newImagePath).then((value:any) => {
                        stats.downloadedImages++;
                        image.localPath = newImagePath;
                        if (channel) {
                            this.appendImage(image, folderId, channel, stats, userId);

                        }
                    });
                } else { // we already have that image
                    if (channel) {
                        this.appendImage(image, folderId, channel, stats, userId);
                    }
                }
            });

            res.send(newImages.length + ' images scrapped, loaded ' + imageDocument.length + " blocks");
            logger.info("Scrap result", stats);

        });
    };

    public async appendImage(image: ImageDocument, folderId: string, channel: ChanelDocument, stats: any, ownerId: string) {
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

}

export var ScrapController = new ScrapControllerClass();
