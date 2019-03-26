const Joi = require('joi');
const uuid = require('uuid/v4');
const {
  sharedSchema,
  getSharedBlogsSchema,
} = require('../../../validators/shared');

describe('joi shared schema', () => {
  it('should properly validate all types of request body for sharing a blog', () => {
    const sharedObj = {
      blogId: uuid(),
      values: {
        shared: false,
      },
    };

    // invalid blogId: not present
    let obj = { ...sharedObj };
    delete obj.blogId;
    let result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid blogId: invalid uuid
    obj.blogId = 'invalid uuid';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid values: not present
    obj = { ...sharedObj };
    delete obj.values;
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['values']),
    );
    obj.values = {};

    // invalid values-shared: not present
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['values']),
    );

    // invalid values-shared: invalid type
    obj.values.shared = 'invalid type';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['values']),
    );

    // invalid keys values-unknownField: invalid field
    obj = { ...sharedObj };
    obj.values.unknownField = 'invalid field';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.values.unknownField;

    // invalid key: invalid field
    obj = { ...sharedObj };
    obj.unknownField = 'invalid field';
    result = Joi.validate(obj, sharedSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.unknownField;

    // valid shared object
    obj = { ...sharedObj };
    result = Joi.validate(obj, sharedSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi get shared blogs', () => {
  it('should properly validate all types of request parameters', () => {
    let obj = {
      page: 1,
      per_page: 10,
    };

    // invalid per_page: negative value
    obj.per_page = -1;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['per_page']),
    );
    obj.per_page = 10;

    // invalid per_page: more than 100
    obj.per_page = 101;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['per_page']),
    );
    obj.per_page = 10;

    // invalid page: equal to zero value
    obj.page = 0;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['page']),
    );

    // invalid page: negative value
    obj.page = -1;
    result = Joi.validate(obj, getSharedBlogsSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['page']),
    );
  });
});
