const Joi = require('joi');
const { loginSchema } = require('../../../validators/login');

describe('joi login validator', () => {
  it('should properly validate all types of request body for signing in a user', () => {
    const loginObj = {
      email: 'something@gmail.com',
      password: 'Something12',
    };

    // invalid email: not present
    let obj = { ...loginObj };
    delete obj.email;
    let result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['email']),
    );

    // invalid email: invalid pattern
    obj.email = 'something';
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['email']),
    );

    // invalid password: not present
    obj = { ...loginObj };
    delete obj.password;
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['password']),
    );

    // invalid password: invalid pattern
    obj = { ...loginObj };
    obj.password = 'Something';
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['password']),
    );

    // invalid keys: invalid field
    obj = { ...loginObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.unknownField;

    // valid login object
    obj = { ...loginObj };
    result = Joi.validate(obj, loginSchema);
    expect(result.error).toBe(null);
  });
});
