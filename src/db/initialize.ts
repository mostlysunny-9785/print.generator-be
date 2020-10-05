import {User, UserDocument} from "../model/User";
import logger from "../util/logger";
import {Chanel, ChanelDocument, ChanelTypes} from "../model/chanel.model";
import {Image, ImageDocument} from "../model/image.model";
import bcrypt from "bcrypt";
import {Folder, FolderDocument, FolderType} from "../model/folder.model";
import * as fs from "fs";
import {IMAGE_FOLDER, RESULTS_FOLDER} from "../util/constants";
import {DefaultUserSettingsModel, UserSettingsModel} from "../model/userSettings.model";


class DbInitializedClass {

    initDbWhenEmpty() {
        User.insertMany([{
            email: "honza",
            password: "$2b$10$opt8/gzBpfJa.7Lj3i1Gp.LynoNrZTCBsltHbtUxqT.DF1xNIW8i2",
            settings: DefaultUserSettingsModel
        } as UserDocument, {
            email: "kuba",
            password: "$2b$10$opt8/gzBpfJa.7Lj3i1Gp.LynoNrZTCBsltHbtUxqT.DF1xNIW8i2",
            settings: DefaultUserSettingsModel
        } as UserDocument, {
            email: "nobody #10156",
            password: "$2b$10$ZGR13jlz8A9.ylr2inJdYu7yduc7w5q7eGPzsewAAdBjcSYEjEsNO",
            settings: DefaultUserSettingsModel
        } as UserDocument
        ], (error: Error, docsInserted: UserDocument[]) => {
            if (error){
                logger.error(error);
            } else {
                docsInserted.forEach(doc => {
                    let userId = doc._id;
                    // this.initChannels(userId);
                    this.initFolders(userId);
                })

            }

        })

        // Chanel.insertMany([
        //     {
        //         ownerId
        //     } as ChanelDocument
        // ])



        // script for generating hash
        bcrypt.genSalt(10, (err, salt) => {
            if (err) { return ; }
            bcrypt.hash("dummy", salt, (err: Error, hash: any) => {
                if (err) { return; }
                logger.info("Generated hash is: " + hash)
            });
        });

    }

    private initChannels(userId: string) {
        Chanel.insertMany([{
            ownerId: userId,
            url: "dummy",
            type: ChanelTypes.WWW,
            pictureIds: []
        } as ChanelDocument], (error1, chanel: ChanelDocument[]) => {
            Image.insertMany([{
                block: 4911467,
                title: "screenshot-2019-08-19-15.01.12.png",
                created: new Date("2019-08-28T14:45:08.705Z"),
                description: "",
                localPath: "images/original_f3c13228178ce3b70f91345e44b2c29b.png",
                remotePath: "https://d2w9rnfcy7mm78.cloudfront.net/4911467/original_f3c13228178ce3b70f91345e44b2c29b.png?1567003510?bc=1",
                fileSize: 117935,
                filename: "original_f3c13228178ce3b70f91345e44b2c29b.png",
                chanelId: chanel[0]._id
            } as unknown as ImageDocument], (error2, image: ImageDocument[]) => {
                Chanel.findByIdAndUpdate(chanel[0]._id, {$push: { pictureIds: image[0]._id }}, (err) => {
                    if (err){
                        logger.error(err);
                    }
                });
            })
        });
    }

    private initFolders(ownerId: string) {
        Folder.insertMany([{
            id: 1,
            type: FolderType.IMAGE,
            ownerId
        },{
            id: 1,
            type: FolderType.WORD,
            ownerId
        }] as FolderDocument[], (error, folders: FolderDocument[]) => {
            logger.info("User id: " + ownerId + " initialized with " + folders.length + " folders.");
        });
    }
}

export var DbInitialized = new DbInitializedClass();


// initialize folders
fs.mkdirSync(IMAGE_FOLDER + "/thumb", { recursive: true });
fs.mkdirSync(RESULTS_FOLDER + "/svg", { recursive: true });
fs.mkdirSync(RESULTS_FOLDER + "/thumb", { recursive: true });
