const Shared = require('../../../model/shared');

describe('mongoose.shared schema', () => {
  const validSharedObj = {
    itemId: '394872309487987534',
    title: 'something',
    description: 'somethinglkajiou  9834hdfkj  aiuh',
    createdAt: 973409874,
    lastModified: 987349873,
    shared: true,
    position: {
      latitude: 90,
      longitude: 180,
    },
  };

  let obj = undefined;
  let error = undefined;

  it("should properly validate invalid item id's", () => {
    // invalid itemId: not present
    obj = { ...validSharedObj };
    delete obj.itemId;
    error = new Shared(obj).validateSync();
    expect(error.errors.itemId.properties.path).toBe('itemId');
  });

  it('should properly validate invalid title', () => {
    // invalid title: not present
    obj = { ...validSharedObj };
    delete obj.title;
    error = new Shared(obj).validateSync();
    expect(error.errors.title.properties.path).toBe('title');
  });

  it('should properly validate invalid description', () => {
    // invalid description: not present
    obj = { ...validSharedObj };
    delete obj.description;
    error = new Shared(obj).validateSync();
    expect(error.errors.description.properties.path).toBe('description');
  });

  it('should properly validate created at date', () => {
    // invalid createdAt: not present
    obj = { ...validSharedObj };
    delete obj.createdAt;
    error = new Shared(obj).validateSync();
    expect(error.errors.createdAt.properties.path).toBe('createdAt');
  });

  it('should properly validate last modified date', () => {
    // invalid lastModified: not present
    obj = { ...validSharedObj };
    delete obj.lastModified;
    error = new Shared(obj).validateSync();
    expect(error.errors.lastModified.properties.path).toBe('lastModified');
  });

  it('should properly validate invalid shared', () => {
    // invalid shared: not present
    obj = { ...validSharedObj };
    delete obj.shared;
    error = new Shared(obj).validateSync();
    expect(error.errors.shared.properties.path).toBe('shared');
  });

  it('should properly validate invalid position object', () => {
    // invalid position: not present
    obj = { ...validSharedObj };
    delete obj.position;
    error = new Shared(obj).validateSync();
    expect(error.errors.position.properties.path).toBe('position');
    obj.position = {};

    // invalid position: invalid latitude value
    obj.position.latitude = 91;
    error = new Shared(obj).validateSync();
    expect(error.errors.position.properties.path).toBe('position');
    obj.position.latitude = 90;

    // invalid position: invalid longitude value
    obj.position.longitude = 181;
    error = new Shared(obj).validateSync();
    expect(error.errors.position.properties.path).toBe('position');
    obj.position.longitude = 180;
  });

  it('should properly validate valid shared object', () => {
    // valid shared object
    obj = { ...validSharedObj };
    error = new Shared(obj).validateSync();
    expect(error).toBe(undefined);
  });
});
