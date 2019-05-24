const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');
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
      const { error } = Joi.validate(
        { email: this.email },
        {
          email: Joi.string()
            .email()
            .required(),
        },
      );
      if (error) {
        return false;
      }
      return true;
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
      if (!this.position || !(this.position.latitude >= -90 && this.position.latitude <= 90)) {
        return false;
      }
      if (!this.position || !(this.position.longitude >= -180 && this.position.longitude <= 180)) {
        return false;
      }
      return true;
    },
  },
});

module.exports = mongoose.model('User', UserSchema);
