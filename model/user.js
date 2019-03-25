const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{4,}$/;

// This schema however won't validate fields properly. Make use of joi for that before validating using this schema.
let UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: function() {
      return validator.isEmail(this.email) && typeof this.email === 'string';
    },
  },
  password: {
    type: String,
    required: function() {
      return this.accountType !== 'google';
    },
    validate: function() {
      if (this.accountType === 'google' && !this.password) {
        return true;
      } else if (this.accountType === 'google' && this.password) {
        return false;
      } else {
        return new RegExp(passwordRegex).test(this.password);
      }
    },
  },
  profileImage: {
    type: String,
  },
  accountType: {
    type: String,
    required: true,
    enum: ['google', 'local'],
  },
  accessToken: {
    type: String,
    required: function() {
      return this.accountType === 'google';
    },
    validate: function() {
      return (
        (this.accountType === 'local' && this.accessToken === undefined) ||
        this.accountType === 'google'
      );
    },
  },
  refreshToken: {
    type: String,
    validate: function() {
      return (
        (this.accountType === 'local' && this.refreshToken === undefined) ||
        this.accountType === 'google'
      );
    },
  },
  googleId: {
    type: String,
    required: function() {
      this.accountType === 'google';
    },
  },
  blogs: {
    type: Object,
    required: true,
    validate: function() {
      return this.blogs && Array.isArray(this.blogs) && this.blogs.length === 0;
    },
  },
  position: {
    type: Object,
    required: true,
    validate: function() {
      if (
        !this.position ||
        !(this.position.latitude >= -90 && this.position.latitude <= 90)
      ) {
        return false;
      }
      if (
        !this.position ||
        !(this.position.longitude >= -180 && this.position.longitude <= 180)
      ) {
        return false;
      }
      return true;
    },
  },
});

module.exports = mongoose.model('User', UserSchema);
