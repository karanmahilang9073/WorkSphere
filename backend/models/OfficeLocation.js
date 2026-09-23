import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema({
    name: { type: String, default: "Main Office" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusMeters: { type: Number, default: 500 },
    address: { type: String, default: "Corporate Office" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const OfficeLocation = mongoose.model("OfficeLocation", officeLocationSchema);
export default OfficeLocation;

