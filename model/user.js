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
    required: true,
    validate: function() {
        return new RegExp(passwordRegex).test(this.password);
    },
  },
  items: {
    type: Object,
    required: true,
    validate: function() {
      return this.items && Array.isArray(this.items) && this.items.length === 0;
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
