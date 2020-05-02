const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProjectSchema = new Schema({

    generic_name: {
        type: String,
        required: true
    },
    title: {
        english: {
            type: String,
            required: true
        },
        espanol: {
            type: String,
            required: true
        }
    },
    type: {
        english: {
            type: String,
            required: true
        },
        espanol: {
            type: String,
            required: true
        }
    },
    date: {
        type: String,
        required: true
    },

    link: {
        type: String,
    },
    description: {
        english: {
            type: String
        },
        espanol: {
            type: String
        }
    },
    images: {
        big: [
            { type: String }
        ],
        small: [
            { type: String }
        ]
    },
    videos: [
        { type: String }
    ],
    audios: [
        { type: String }
    ]

}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);