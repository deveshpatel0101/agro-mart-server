const Joi = require('joi');
const uuid = require('uuid/v4');

const {
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
} = require('../../../validators/blogs');

describe('joi create blog validator', () => {
  const createBlogObj = {
    blogId: uuid(),
    title: 'something',
    description: 'something long description',
    createdAt: 98749857453,
    lastModified: 934782309478,
    shared: false,
  };

  let obj = undefined;
  let result = undefined;

  it("should properly validate invalid blogId's", () => {
    // invalid blogId: not present
    obj = { ...createBlogObj };
    delete obj.blogId;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));

    // invalid blogId: invalid uuid
    obj.blogId = '10982';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));
  });

  it('should properly validate invalid title', () => {
    // invalid title: not present
    obj = { ...createBlogObj };
    delete obj.title;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['title']));

    // invalid title: at least one character
    obj.title = '';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['title']));
  });

  it('should properly validate invalid description', () => {
    // invalid description: not present
    obj = { ...createBlogObj };
    delete obj.description;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['description']));

    // invalid description: at least one character
    obj.description = '';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['description']));
  });

  it('should properly validate invalid created at dates', () => {
    // invalid createdAt: not present
    obj = { ...createBlogObj };
    delete obj.createdAt;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['createdAt']));
  });

  it('should properly validate invalid last modified dates', () => {
    // invalid lastModified: not present
    obj = { ...createBlogObj };
    delete obj.lastModified;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['lastModified']));
  });

  it('should properly validate invalid shared', () => {
    // invalid shared: not present
    obj = { ...createBlogObj };
    delete obj.shared;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['shared']));

    // invalid shared: invalid value
    obj.shared = true;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['shared']));
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: unknown fields not allowed
    obj = { ...createBlogObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid blog object', () => {
    // valid object
    obj = { ...createBlogObj };
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi update blog validator', () => {
  let updateBlogObj = {
    blogId: uuid(),
    values: {
      title: 'something',
      description: 'something long description',
      createdAt: 9853847698276,
      lastModified: 937849857,
    },
  };
  let obj = undefined;
  let result = undefined;

  it("should properly validate invalid blogId's", () => {
    // invalid blogId: not present
    let obj = { ...updateBlogObj };
    delete obj.blogId;
    let result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));

    // invalid blogId: invalid uuid
    obj.blogId = '10982';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));
  });

  it('should properly validate invalid title', () => {
    // invalid title: at least one character
    obj = { ...updateBlogObj };
    obj.values.title = '';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['title']));
    obj.values.title = 'something';
  });

  it('should properly validate invalid description', () => {
    // invalid description: at least one character
    obj = { ...updateBlogObj };
    obj.values.description = '';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['description']));
    obj.values.description = 'something long description';
  });

  it('should properly validate invalid shared', () => {
    // invalid shared: is present
    obj = { ...updateBlogObj };
    obj.values.shared = true;
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['shared']));
    delete obj.values.shared;
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: unkown fields not allowed
    obj = { ...updateBlogObj };
    obj.values.unknownField = 'something unknown';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.values.unknownField;

    // invalid keys: unknown fields not allowed
    obj = { ...updateBlogObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid shared object', () => {
    // valid object
    obj = { ...updateBlogObj };
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi delete blog validator', () => {
  let deleteBlogObj = {
    blogId: uuid(),
  };

  it("should properly validate invalid blogId's", () => {
    // invalid blogId: not present
    let obj = { ...deleteBlogObj };
    delete obj.blogId;
    let result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));

    // invalid blogId: invalid uuid
    obj.blogId = '1234';
    result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogId']));
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: unknown fields not allowed
    obj = { ...deleteBlogObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid delete blog object', () => {
    // valid object
    obj = { ...deleteBlogObj };
    result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error).toBe(null);
  });
});
