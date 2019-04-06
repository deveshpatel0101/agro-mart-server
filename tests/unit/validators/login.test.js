const Joi = require('joi');
const { loginSchema } = require('../../../validators/login');

describe('joi login validator', () => {
  const loginObj = {
    email: 'something@gmail.com',
    password: 'Something12',
  };

  let obj = undefined;
  let result = undefined;

  it('should properly validate invalid email', () => {
    // invalid email: not present
    let obj = { ...loginObj };
    delete obj.email;
    let result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));

    // invalid email: invalid pattern
    obj.email = 'something';
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));
  });

  it('should properly validate invalid password', () => {
    // invalid password: not present
    obj = { ...loginObj };
    delete obj.password;
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['password']));

    // invalid password: invalid pattern
    obj = { ...loginObj };
    obj.password = 'Something';
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['password']));
  });

  it('should properly validate invalid uknown fields', () => {
    // invalid keys: invalid field
    obj = { ...loginObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, loginSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate login object', () => {
    // valid login object
    obj = { ...loginObj };
    result = Joi.validate(obj, loginSchema);
    expect(result.error).toBe(null);
  });
});
