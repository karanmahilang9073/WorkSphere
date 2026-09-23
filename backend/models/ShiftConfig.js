import mongoose from "mongoose";

const shiftConfigSchema = new mongoose.Schema({
    shiftEnum: {
        type: String,
        enum: ["morning", "general", "evening", "night"],
        required: true,
        unique: true
    },
    shiftType: {
        type: String,
        enum: ["Morning", "General", "Evening", "Night"],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: String,
        required: true,
        default: "09:00"
    },
    endTime: {
        type: String,
        required: true,
        default: "18:00"
    },
    startHour: {
        type: Number,
        default: 9
    },
    startMin: {
        type: Number,
        default: 0
    },
    endHour: {
        type: Number,
        default: 18
    },
    endMin: {
        type: Number,
        default: 0
    },
    graceMinutes: {
        type: Number,
        default: 15,
        min: 0,
        max: 120
    },
    windowStartHour: {
        type: Number,
        default: 6
    },
    windowEndHour: {
        type: Number,
        default: 12
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const ShiftConfig = mongoose.model("ShiftConfig", shiftConfigSchema);
export default ShiftConfig;

