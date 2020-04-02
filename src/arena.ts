import {ImageModel} from "./image.model";
import {Observable} from "rxjs";

const Arena = require("are.na");
const arena = new Arena();
var url = require("url");
var path = require("path");

export class ArenaClass {
    scrapImages(chanel: string, page: number, per: number): Observable<ImageModel[]> {
        return new Observable<ImageModel[]>(subscriber => {
            let images: ImageModel[] = [];
            arena.channel(chanel)
                .contents({ page, per })
                .then((chan: any[]) => {
                    chan.forEach(block => {
                        if (block.image){
                            images.push({
                                block: block.id,
                                title: block.title,
                                created: block.created_at,
                                description: block.description,
                                localPath: '',
                                remotePath: block.image.original.url,
                                fileSize: block.image.original.file_size,
                                filename: path.basename(url.parse(block.image.original.url).pathname)
                            });
                        }
                    });

                    subscriber.next(images);
                    subscriber.complete();
                })
                .catch((err: any) => console.log(err));
        });

    }

    chanelInfo(chanel: string) {
        return new Observable<ImageModel[]>(subscriber => {

        });
    }
}

export var ArenaScrapper = new ArenaClass();
