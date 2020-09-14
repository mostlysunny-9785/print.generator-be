import mongoose from "mongoose";

export enum FolderType {
    WORD,
    IMAGE
}


export type FolderDocument = mongoose.Document & {
    id: number;
    type: FolderType
    ownerId: string
}


const folderSchema = new mongoose.Schema({
    id: Number,
    type: String,
    ownerId: String
}, {timestamps: true})


export const Folder = mongoose.model<FolderDocument>("Folder", folderSchema);
