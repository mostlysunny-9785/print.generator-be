import mongoose from "mongoose";


export type WordDocument = mongoose.Document & {
    content: string;
    created: Date;
    folderId: string;
    ownerId: string,
}


const wordSchema = new mongoose.Schema({
    content: String,
    created: Date,
    folderId: String,
    ownerId: String,
}, {timestamps: true})


export const Word = mongoose.model<WordDocument>("Word", wordSchema);
