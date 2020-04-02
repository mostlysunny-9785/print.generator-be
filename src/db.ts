import {JsonDB} from "node-json-db";
import {Config} from "node-json-db/dist/lib/JsonDBConfig";
import {ImageModel} from "./image.model";


export class DBClass {
    private db: JsonDB;
    constructor() {
        this.db = new JsonDB(new Config("db/dbfile", true, false, '/'));
        this.db.push("/test1","super test");
        this.db.push("/test2/my/test",5);
        this.db.push("/test3", {test:"test", json: {test:["test"]}});
        this.db.push("/test3", {
            new:"cool",
            json: {
                important : 5
            }
        }, false);

    }

    public setImages(images: ImageModel[]) {
        this.db.push("/images", images, true);
    }

    public appendImages(images: ImageModel[]) {
        this.db.push("/images", images, false);
    }

    public getImages(): ImageModel[] {
        return this.db.getData("/images");
    }
}

export var DB = new DBClass();
