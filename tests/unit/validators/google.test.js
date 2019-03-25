const Joi = require('joi');
const { googleSchema } = require('../../../validators/google');

describe('joi google validator', () => {
  it('should properly validate all types of request body for registering a google user ', () => {
    const googleObj = {
      username: 'something',
      email: 'something@gmail.com',
      profileImage: 'https://images.com/profile.jpg',
      refreshToken: 'sdhf9847098ufsdhf98riudh-98734shf',
      accountType: 'google',
      googleId: 297834091870987,
      accessToken: 'asdu9w8raihdfiu3987af-sdjashd-98-sdfhjhd',
      position: {
        latitude: 90,
        longitude: 180,
      },
      blogs: [],
    };

    // invalid username: not present
    let obj = { ...googleObj };
    delete obj.username;
    let result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['username']),
    );

    // invalid username: invalid length
    obj.username = 'so';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['username']),
    );

    // invalid email: not present
    obj = { ...googleObj };
    delete obj.email;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['email']),
    );

    // invalid email: invalid pattern
    obj.email = 'something';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['email']),
    );

    // valid profileImage: not present
    obj = { ...googleObj };
    delete obj.profileImage;
    result = Joi.validate(obj, googleSchema);
    expect(result.error).toBe(null);

    // valid refreshToken: not present
    obj = { ...googleObj };
    delete obj.refreshToken;
    result = Joi.validate(obj, googleSchema);
    expect(result.error).toBe(null);

    // invalid accountType: not present
    obj = { ...googleObj };
    delete obj.accountType;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['accountType']),
    );

    // invalid accountType: invalid value
    obj.accountType = 'invalid account type';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['accountType']),
    );

    // valid googleId: not present
    obj = { ...googleObj };
    delete obj.googleId;
    result = Joi.validate(obj, googleSchema);
    expect(result.error).toBe(null);

    // invalid accessToken: not present
    obj = { ...googleObj };
    delete obj.accessToken;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['accessToken']),
    );

    // invalid position: not present
    obj = { ...googleObj };
    delete obj.position;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['position']),
    );
    obj.position = {};

    // invalid position: invalid latitude
    obj.position.latitude = 91;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['position']),
    );
    obj.position.latitude = 90;

    // invalid position: invalid longitude
    obj.position.longitude = 181;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['position']),
    );
    obj.position.longitude = 180;

    // invalid keys in position: invalid field
    obj.position.unknownField = 'invalid field';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.position.unknownField;

    // invalid blogs: not present
    obj = { ...googleObj };
    delete obj.blogs;
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogs']),
    );

    // invalid blogs: invalid type
    obj.blogs = 'invalid type';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogs']),
    );

    // invalid blogs: invalid length
    obj.blogs = ['something'];
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogs']),
    );
    delete obj.blogs;

    // invalid keys: invalid field
    obj = { ...googleObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, googleSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );

    // valid object
    obj = { ...googleObj };
    result = Joi.validate(obj, googleSchema);
    expect(result.error).toBe(null);
  });
});
