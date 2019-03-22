const mongoose = require('mongoose');
const uuid = require('uuid/v4');
const Schema = mongoose.Schema;

// This schema however won't validate most of the following properties properly. It just makes sure that valid types is provided and is present in the object. Make use of joi to validate before insertion.
let SharedSchema = new Schema({
    blogId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        min: 1
    },
    description: {
        type: String,
        required: true,
        min: 1
    },
    shared: {
        type: Boolean,
        required: true,
        validate: function() {
            return this.shared;
        }
    },
    createdAt: {
        type: Number,
        required: true
    },
    lastModified: {
        type: Number,
        required: true
    },
    position: {
        type: Object,
        required: true,
        validate: function() {
            if (!this.position || !(this.position.latitude >= -90 && this.position.latitude <= 90)) {
                return false;
            }
            if (!this.position || !(this.position.longitude >= -180 && this.position.longitude <= 180)) {
                return false;
            }
            return true;
        }
    }
});

module.exports = mongoose.model('Shared', SharedSchema);