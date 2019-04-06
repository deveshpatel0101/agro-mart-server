const Joi = require('joi');
const uuid = require('uuid/v4');
const { sharedSchema, getSharedBlogsSchema } = require('../../../validators/shared');

describe('joi shared schema', () => {
  const sharedObj = {
    blogId: uuid(),
    values: {
      shared: false,
    },
  };

  let obj = undefined;
  let result = undefined;

  it('should properly valid invalid blogId', () => {
    // invalid blogId: not present
    obj = { ...sharedObj };
    delete obj.blogId;
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));

    // invalid blogId: invalid uuid
    obj.blogId = 'invalid uuid';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));
  });

  it('should properly validate invalid values object', () => {
    // invalid values: not present
    obj = { ...sharedObj };
    delete obj.values;
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['values']));
    obj.values = {};

    // invalid values-shared: not present
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['values']));

    // invalid values-shared: invalid type
    obj.values.shared = 'invalid type';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['values']));

    // invalid keys values-unknownField: invalid field
    obj = { ...sharedObj };
    obj.values.unknownField = 'invalid field';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.values.unknownField;
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid key: invalid field
    obj = { ...sharedObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid shared object', () => {
    // valid shared object
    obj = { ...sharedObj };
    result = Joi.validate(obj, sharedSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi get shared blogs', () => {
  let obj = {
    page: 1,
    per_page: 10,
  };

  let result = undefined;

  it('should properly validate invalid per_page', () => {
    // invalid per_page: negative value
    obj.per_page = -1;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['per_page']));
    obj.per_page = 10;

    // invalid per_page: more than 100
    obj.per_page = 101;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['per_page']));
    obj.per_page = 10;
  });

  it('should properly validate inalid page', () => {
    // invalid page: equal to zero value
    obj.page = 0;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['page']));

    // invalid page: negative value
    obj.page = -1;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['page']));
  });
});
