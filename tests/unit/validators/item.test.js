const Joi = require('joi');
const uuid = require('uuid/v4');

const {
  createItemSchema,
  updateItemSchema,
  deleteItemSchema,
} = require('../../../validators/items');

describe('joi create item validator', () => {
  const createItemObj = {
    itemId: uuid(),
    title: 'something',
    description: 'something long description',
    createdAt: 98749857453,
    lastModified: 934782309478,
    shared: false,
  };

  let obj = undefined;
  let result = undefined;

  it("should properly validate invalid itemId's", () => {
    // invalid itemId: not present
    obj = { ...createItemObj };
    delete obj.itemId;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['itemId']));

    // invalid itemId: invalid uuid
    obj.itemId = '10982';
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['itemId']));
  });

  it('should properly validate invalid title', () => {
    // invalid title: not present
    obj = { ...createItemObj };
    delete obj.title;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['title']));

    // invalid title: at least one character
    obj.title = '';
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['title']));
  });

  it('should properly validate invalid description', () => {
    // invalid description: not present
    obj = { ...createItemObj };
    delete obj.description;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['description']));

    // invalid description: at least one character
    obj.description = '';
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['description']));
  });

  it('should properly validate invalid created at dates', () => {
    // invalid createdAt: not present
    obj = { ...createItemObj };
    delete obj.createdAt;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['createdAt']));
  });

  it('should properly validate invalid last modified dates', () => {
    // invalid lastModified: not present
    obj = { ...createItemObj };
    delete obj.lastModified;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['lastModified']));
  });

  it('should properly validate invalid shared', () => {
    // invalid shared: not present
    obj = { ...createItemObj };
    delete obj.shared;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['shared']));

    // invalid shared: invalid value
    obj.shared = true;
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['shared']));
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: unknown fields not allowed
    obj = { ...createItemObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, createItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid item object', () => {
    // valid object
    obj = { ...createItemObj };
    result = Joi.validate(obj, createItemSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi update item validator', () => {
  let updateItemObj = {
    itemId: uuid(),
    values: {
      title: 'something',
      description: 'something long description',
      createdAt: 9853847698276,
      lastModified: 937849857,
    },
  };
  let obj = undefined;
  let result = undefined;

  it("should properly validate invalid itemId's", () => {
    // invalid itemId: not present
    let obj = { ...updateItemObj };
    delete obj.itemId;
    let result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['itemId']));

    // invalid itemId: invalid uuid
    obj.itemId = '10982';
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['itemId']));
  });

  it('should properly validate invalid title', () => {
    // invalid title: at least one character
    obj = { ...updateItemObj };
    obj.values.title = '';
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['title']));
    obj.values.title = 'something';
  });

  it('should properly validate invalid description', () => {
    // invalid description: at least one character
    obj = { ...updateItemObj };
    obj.values.description = '';
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['description']));
    obj.values.description = 'something long description';
  });

  it('should properly validate invalid shared', () => {
    // invalid shared: is present
    obj = { ...updateItemObj };
    obj.values.shared = true;
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['shared']));
    delete obj.values.shared;
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: unkown fields not allowed
    obj = { ...updateItemObj };
    obj.values.unknownField = 'something unknown';
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.values.unknownField;

    // invalid keys: unknown fields not allowed
    obj = { ...updateItemObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid shared object', () => {
    // valid object
    obj = { ...updateItemObj };
    result = Joi.validate(obj, updateItemSchema);
    expect(result.error).toBe(null);
  });
});

describe('joi delete item validator', () => {
  let deleteItemObj = {
    itemId: uuid(),
  };

  it("should properly validate invalid itemId's", () => {
    // invalid itemId: not present
    let obj = { ...deleteItemObj };
    delete obj.itemId;
    let result = Joi.validate(obj, deleteItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['itemId']));

    // invalid itemId: invalid uuid
    obj.itemId = '1234';
    result = Joi.validate(obj, deleteItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['itemId']));
  });

  it('should properly validate invalid unknown fields', () => {
    // invalid keys: unknown fields not allowed
    obj = { ...deleteItemObj };
    obj.unknownField = 'something unknown';
    result = Joi.validate(obj, deleteItemSchema);
    expect(result.error.details[0].path).toEqual(expect.arrayContaining(['unknownField']));
    delete obj.unknownField;
  });

  it('should properly validate valid delete item object', () => {
    // valid object
    obj = { ...deleteItemObj };
    result = Joi.validate(obj, deleteItemSchema);
    expect(result.error).toBe(null);
  });
});
