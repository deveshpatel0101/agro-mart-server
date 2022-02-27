const Joi = require('joi');
const { registerSchema } = require('../../../validators/register');

describe('joi register validator', () => {
  const registerObj = {
    username: 'something',
    email: 'something@gmail.com',
    password: 'Something12',
    confirmPassword: 'Something12',
    position: {
      latitude: 90,
      longitude: 180,
    },
    items: [],
  };

  let obj = undefined;
  let result = undefined;

  it('should properly validate invalid username', () => {
    // invalid username: not present
    obj = { ...registerObj };
    delete obj.username;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['username']));

    // invalid username: invalid length
    obj.username = 'so';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['username']));
  });

  it('should properly validate invalid email', () => {
    // invalid email: not present
    obj = { ...registerObj };
    delete obj.email;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));

    // invalid email: invalid pattern
    obj.email = 'something';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));
  });

  it('should properly validate invalid password', () => {
    // invalid password: not present
    obj = { ...registerObj };
    delete obj.password;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['password']));

    // invalid password: invalid pattern
    obj.password = 'Something';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['password']));
  });

  it('should properly validate invalid confirm password', () => {
    // invalid confirmPassword: not present
    obj = { ...registerObj };
    delete obj.confirmPassword;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['confirmPassword']));

    // invalid confirmPassword: not match with password
    obj.confirmPassword = 'Something1';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['confirmPassword']));
  });

  it('should properly validate invalid position object', () => {
    // invalid position: not present
    obj = { ...registerObj };
    delete obj.position;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
    obj.position = {};

    // invalid position-latitude: not present
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));

    // invalid position-latitude: invalid value
    obj.position.latitude = 91;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
    obj.position.latitude = 90;

    // invalid position-longitude: not present
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));

    // invalid position-longitude: invalid value
    obj.position.longitude = 181;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
    obj.position.longitude = 180;

    // invalid keys in position: invalid field
    obj.position.unknownField = 'invalid field';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.position.unknownField;
  });

  it('should properly validate invalid items array', () => {
    // invalid items: not present
    obj = { ...registerObj };
    delete obj.items;
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['items']));

    // invalid items: invalid type
    obj.items = 'invalid type';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['items']));

    // invalid items: invalid length
    obj.items = ['invalid length'];
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['items']));
  });

  it('should properly validate invalid unkown fields', () => {
    // invalid keys: invalid field
    obj = { ...registerObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, registerSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid signup object', () => {
    // valid register user object
    obj = { ...registerObj };
    result = Joi.validate(obj, registerSchema);
    expect(result.error).toBe(null);
  });
});
