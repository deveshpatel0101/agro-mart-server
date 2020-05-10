const Joi = require('joi');
const { googleSchema } = require('../../../validators/google');

describe('joi google validator', () => {
  const googleObj = {
    username: 'something',
    email: 'something@gmail.com',
    accountType: 'google',
    googleId: '297834091870987',
    accessToken: 'asdu9w8raihdfiu3987af-sdjashd-98-sdfhjhd',
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
    obj = { ...googleObj };
    delete obj.username;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['username']));

    // invalid username: invalid length
    obj.username = 'so';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['username']));
  });

  it('should properly validate invalid email', () => {
    // invalid email: not present
    obj = { ...googleObj };
    delete obj.email;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));

    // invalid email: invalid pattern
    obj.email = 'something';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));
  });

  it('should properly validate invalid account type', () => {
    // invalid accountType: not present
    obj = { ...googleObj };
    delete obj.accountType;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['accountType']));

    // invalid accountType: invalid value
    obj.accountType = 'invalid account type';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['accountType']));
  });

  it('should properly validate invalid google id', () => {
    // valid googleId: not present
    obj = { ...googleObj };
    delete obj.googleId;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['googleId']));
  });

  it('should properly validate invalid', () => {
    // invalid accessToken: not present
    obj = { ...googleObj };
    delete obj.accessToken;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['accessToken']));
  });

  it('should properly validate invalid position object', () => {
    // invalid position: not present
    obj = { ...googleObj };
    delete obj.position;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
    obj.position = {};

    // invalid position: invalid latitude
    obj.position.latitude = 91;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
    obj.position.latitude = 90;

    // invalid position: invalid longitude
    obj.position.longitude = 181;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
    obj.position.longitude = 180;

    // invalid keys in position: invalid field
    obj.position.unknownField = 'invalid field';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.position.unknownField;
  });

  it('should properly validate invalid items array', () => {
    // invalid items: not present
    obj = { ...googleObj };
    delete obj.items;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['items']));

    // invalid items: invalid type
    obj.items = 'invalid type';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['items']));

    // invalid items: invalid length
    obj.items = ['something'];
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['items']));
    delete obj.items;
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: invalid field
    obj = { ...googleObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
  });

  it('should properly validate invalid google signup object', () => {
    // valid object
    obj = { ...googleObj };
    result = Joi.validate(obj, googleSchema);
    expect(result.error).toBe(null);
  });
});
