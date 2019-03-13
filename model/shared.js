const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SharedSchema = new Schema({
    blogId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shared: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Number,
        required: true
    },
    lastModified: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Shared', SharedSchema);