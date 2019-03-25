const Joi = require('joi');
const uuid = require('uuid/v4');

const {
  createBlogSchema,
  updateBlogSchema,
  deleteBlogSchema,
} = require('../../../validators/blogs');

describe('joi create blog validator', () => {
  it('should properly validate all types request body for adding a blog', () => {
    const createBlogObj = {
      blogId: uuid(),
      title: 'something',
      description: 'something long description',
      createdAt: 98749857453,
      lastModified: 934782309478,
      shared: false,
    };

    // invalid blogId: not present
    let obj = { ...createBlogObj };
    delete obj.blogId;
    let result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid blogId: invalid uuid
    obj.blogId = '10982';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid title: not present
    obj = { ...createBlogObj };
    delete obj.title;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['title']),
    );

    // invalid title: at least one character
    obj.title = '';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['title']),
    );

    // invalid description: not present
    obj = { ...createBlogObj };
    delete obj.description;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['description']),
    );

    // invalid description: at least one character
    obj.description = '';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['description']),
    );

    // invalid createdAt: not present
    obj = { ...createBlogObj };
    delete obj.createdAt;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['createdAt']),
    );

    // invalid lastModified: not present
    obj = { ...createBlogObj };
    delete obj.lastModified;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['lastModified']),
    );

    // invalid shared: not present
    obj = { ...createBlogObj };
    delete obj.shared;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['shared']),
    );

    // invalid shared: invalid value
    obj.shared = true;
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['shared']),
    );

    // invalid keys: unknown fields not allowed
    obj = { ...createBlogObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.unknownField;

    // valid object
    obj = { ...createBlogObj };
    result = Joi.validate(obj, createBlogSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi update blog validator', () => {
  it('should properly validate all types of request body for updating a blog', () => {
    let updateBlogObj = {
      blogId: uuid(),
      values: {
        title: 'something',
        description: 'something long description',
        createdAt: 9853847698276,
        lastModified: 937849857,
      },
    };

    // invalid blogId: not present
    let obj = { ...updateBlogObj };
    delete obj.blogId;
    let result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid blogId: invalid uuid
    obj.blogId = '10982';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid title: at least one character
    obj = { ...updateBlogObj };
    obj.values.title = '';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['title']),
    );
    obj.values.title = 'something';

    // invalid description: at least one character
    obj = { ...updateBlogObj };
    obj.values.description = '';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['description']),
    );
    obj.values.description = 'something long description';

    // invalid shared: is present
    obj = { ...updateBlogObj };
    obj.values.shared = true;
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['shared']),
    );
    delete obj.values.shared;

    // invalid keys: unkown fields not allowed
    obj = { ...updateBlogObj };
    obj.values.unknownField = 'something unknown';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.values.unknownField;

    // invalid keys: unknown fields not allowed
    obj = { ...updateBlogObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.unknownField;

    // valid object
    obj = { ...updateBlogObj };
    result = Joi.validate(obj, updateBlogSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi delete blog validator', () => {
  it('should properly validate all types of request body for deleting a blog', () => {
    let deleteBlogObj = {
      blogId: uuid(),
    };

    // invalid blogId: not present
    let obj = { ...deleteBlogObj };
    delete obj.blogId;
    let result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid blogId: invalid uuid
    obj.blogId = '1234';
    result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['blogId']),
    );

    // invalid keys: unknown fields not allowed
    obj = { ...deleteBlogObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error.details[0].path).toEqual(
      expect.arrayContaining(['unknownField']),
    );
    delete obj.unknownField;

    // valid object
    obj = { ...deleteBlogObj };
    result = Joi.validate(obj, deleteBlogSchema);
    expect(result.error).toBe(null);
  });
});
