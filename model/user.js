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
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        required: function() { return this.accountType === 'google'}
    },
    accountType: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: function() { return this.accountType === 'google'}
    },
    refreshToken: {
        type: String,
        required: function() { return this.accountType === 'google'}
    },
    blogs: {
        type: Array
    },
    userType: {
        type: String,
        required: true,
        enum: ['farmer', 'customer']
    },
    position: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);