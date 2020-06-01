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
        if (req.body.chanel) {
            // let scrap1 = await this.scrap.bind(req.body.chanel, res, userId);
            // let promise = await this.scrap(req.body.chanel, res, userId);
            let promise = await ScrapController.scrap(req.body.chanel, res, userId);
            // cant use this directly because of bidning problem :/
            // https://stackoverflow.com/questions/3127429/how-does-the-this-keyword-work
        } else {
            res.send("No param chanel found")
        }
    }

    public async scrap(chanelToLoad: string, res: Response, userId: string) {
        let channel: ChanelDocument | null = await Chanel.findOne({url: chanelToLoad, ownerId: userId});

        if (channel) {
            logger.info("Reloading channel");
        } else {
            channel = new Chanel({
                ownerId: userId,
                url: chanelToLoad,
                type: ChanelTypes.WWW,
                pictureIds: []
            });

            let promise = await channel.save();
            channel._id = promise._id;
        }

        ArenaScrapper.scrapImages(chanelToLoad, 1, 1000, channel._id).subscribe((value: ImageDocument[]) => {
            // console.log({value});
            var newImages: ImageDocument[] = [];
            var stats = {
                downloadedImages: 0,
                appendedImages: 0,
                overallDownload: newImages.length
            };

            value.forEach(image => {
                var newImagePath = 'images/' + image.filename;
                if (!fs.existsSync(newImagePath)){ // only if we do not have that image physically
                    download_image(image.remotePath, newImagePath).then((value:any) => {
                        stats.downloadedImages++;
                        image.localPath = newImagePath;
                        if (channel) {
                            this.appendImage(image, channel, stats, userId);

                        }
                    });
                } else { // we already have that image
                    if (channel) {
                        this.appendImage(image, channel, stats, userId);
                    }
                }
            });

            res.send(newImages.length + ' images scrapped, loaded ' + value.length + " blocks");
            logger.info("Scrap result", stats);

        });
    };

    public async appendImage(image: ImageDocument, channel: ChanelDocument, stats: any, ownerId: string) {
        // if we cant find that image add it (upsert)
        Image.findOneAndUpdate({remotePath: image.remotePath, ownerId}, image, {upsert: true}, (err, image: ImageDocument | null, res: any) => {
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
