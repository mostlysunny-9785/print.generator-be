import mongoose from "mongoose";


export type GuestDocument = mongoose.Document & {
    id: number;
}


const guestSchema = new mongoose.Schema({
    id: Number,
}, {timestamps: true})


export const Guest = mongoose.model<GuestDocument>("Guest", guestSchema);
