import mongoose from "mongoose";


export type GeneratedDocument = mongoose.Document & {
    id: string;
    title: string;
    filename: string;
    fileSize: number;
    generationTime: number;
    ownerId: string,
}


const generatedSchema = new mongoose.Schema({
    id: String,
    title: String,
    filename: String,
    fileSize: Number,
    generationTime: Number,
    ownerId: String,
}, {timestamps: true})


export const Generated = mongoose.model<GeneratedDocument>("Generated", generatedSchema);
