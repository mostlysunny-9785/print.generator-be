import {ArenaClass, ArenaScrapper} from "../scrappers/arena";
import {Request, Response} from "express";
import {DB} from "../db/db";
import {ImageModel} from "../model/image.model";
import * as fs from "fs";
import {download_image} from "../scrappers/download_image";

export class ScrapControllerClass {

    public post(req: Request, res: Response): void {
        if (req.body.chanel) {
            this.scrap(req.body.chanel, res);
        } else {
            res.send("No param chanel found")
        }
    }

    private scrap(chanelToLoad: string, res: Response) {
        let chanels = DB.getChanel();
        let foundChanel = chanels.find(chanel => chanel.url === chanelToLoad);
        if (foundChanel) {
            res.send('This chanel is already loaded');
            return;
        }

        ArenaScrapper.scrapImages(chanelToLoad, 1, 1000).subscribe((value: ImageModel[]) => {
            console.log({value});
            var newImages: ImageModel[] = [];
            value.forEach(image => {
                var newImagePath = 'images/' + image.filename;
                if (!fs.existsSync(newImagePath)){ // only if we do not have that image
                    download_image(image.remotePath, newImagePath).then((value:any) => {
                        console.log("Saved " + newImagePath);
                        image.localPath = newImagePath;
                        DB.appendImages([image]);
                    });
                }
            });
            res.send(newImages.length + ' images scrapped, loaded ' + value.length + " blocks");

        });
    };
}

export var ScrapController = new ScrapControllerClass();
