const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    profileImage: {
        type: String,
    },
    accountType: {
        type: String,
        required: true,
        default: 'local'
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    },
    blogs: {
        type: Array
    },
    userType: {
        type: String,
        required: true
    },
    position: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);