import mongoose from "mongoose";
import {UserDocument} from "./User";

export enum ChanelTypes {
    ARENA,
    WWW,
    FILE
}

export type ChanelDocument = mongoose.Document &  {
    ownerId: string,
    url: string,
    type: ChanelTypes,
    folderId: string,
    pictureIds: []
}

const chanelSchema = new mongoose.Schema({
    ownerId: String,
    url: String,
    type: String,
    folderId: String,
    pictureIds: Array
}, {timestamps: true})


export const Chanel = mongoose.model<ChanelDocument>("Chanel", chanelSchema);
