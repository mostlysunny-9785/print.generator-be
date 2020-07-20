import {JsonDB} from "node-json-db";
import {Config} from "node-json-db/dist/lib/JsonDBConfig";


export class DBClass {
    private db: JsonDB;
    constructor() {
        this.db = new JsonDB(new Config("db/dbfile", true, false, '/'));
        // this.db.push("/test1","super test");
        // this.db.push("/test2/my/test",5);
        // this.db.push("/test3", {test:"test", json: {test:["test"]}});
        // this.db.push("/test3", {
        //     new:"cool",
        //     json: {
        //         important : 5
        //     }
        // }, false);

    }

    private url_chanels = "/chanels";
    private url_images = "/images";


    // public appendChanel(chanels: ChanelModel) {
    //     this.db.push(this.url_chanels, chanels, false);
    // }

    // public getChanel() {
    //     return null;
    // }
    //
    // public removeChanel(url: string) {
    //     // remove chanel
    //     // let data: ChanelModel[] = this.db.getData(this.url_chanels);
    //     // if (data && data.length > 0) {
    //     //     let newChanels = data.filter(value => value.url !== url);
    //     //     this.db.push(this.url_chanels, newChanels, true);
    //     // }
    //     // // remove images from chanel
    //     // let images = this.getImages();
    //     // let filteredChanels = images.filter(value => value.chanelUrl !== url);
    //     // this.setImages(filteredChanels);
    // }

    // public setImages(images: ImageModel[]) {
    //     this.db.push(this.url_images, images, true);
    // }
    //
    // public appendImages(images: ImageModel[]) {
    //     this.db.push(this.url_images, images, false);
    // }
    //
    // public getImages(): ImageModel[] {
    //     return this.db.getData(this.url_images);
    // }
}

export var DB = new DBClass();
