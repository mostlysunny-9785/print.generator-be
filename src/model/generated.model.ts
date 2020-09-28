import mongoose from "mongoose";


export type GeneratedDocument = mongoose.Document & {
    id: string;
    title: string;
    previewFilename: string;
    filename: string;
    svgFilename: string;
    width: number;
    height: number;
    fileSize: number;
    generationTime: number;
    ownerId: string;
}


const generatedSchema = new mongoose.Schema({
    id: String,
    title: String,
    previewFilename: String,
    filename: String,
    svgFilename: String,
    width: Number,
    height: Number,
    fileSize: Number,
    generationTime: Number,
    ownerId: String,
}, {timestamps: true})


export const Generated = mongoose.model<GeneratedDocument>("Generated", generatedSchema);
