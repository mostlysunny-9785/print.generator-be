import {DB} from "./db";
import {ArenaScrapper} from "./arena";
import {request} from "https";
import express = require("express");
import {ImageModel} from "./image.model";
import {Request, Response} from "express";
const axios = require('axios').default;
const fs = require('fs');
const cors = require('cors')



const download_image = (url: string, image_path: string) =>
    axios({
        url,
        responseType: 'stream',
    }).then(
        (response: any) =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', (e: any) => reject(e));
            }),
    );

const scrap = (res: Response) =>  {
    ArenaScrapper.scrapImages("i-want-this-on-a-tshirt", 1, 100).subscribe((value: ImageModel[]) => {
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



const app: express.Application = express();

app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('hello there');
});

app.get('/scrap', (req: Request, res: Response) => {
    scrap(res);
});

app.get('/images', (req: Request, res: Response) => {
    res.send(DB.getImages());
});

app.use('/imagefiles', express.static('images/'));

app.listen(3000, () => {
    console.log("running on port 3000");
});
