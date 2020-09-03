import mongoose from "mongoose";
import {ChanelDocument} from "./chanel.model";

export enum ImageTypes {
    ARENA,
    WWW,
    FILE
}

export type ImageDocument = mongoose.Document & {
    localPath: string;
    remotePath: string;
    description: string;
    title: string;
    block: string;
    created: Date;
    filename: string;
    fileSize: number;
    chanelId: string;
    folderId: string;
    imageType: ImageTypes;
    ownerId: string,
}


const imageSchema = new mongoose.Schema({
    localPath: String,
    remotePath: String,
    description: String,
    title: String,
    block: String,
    created: Date,
    filename: String,
    fileSize: Number,
    chanelId: String,
    folderId: String,
    imageType: String,
    ownerId: String,
}, {timestamps: true})


export const Image = mongoose.model<ImageDocument>("Image", imageSchema);
