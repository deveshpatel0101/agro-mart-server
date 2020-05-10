const User = require('../../../model/user');

describe('mongoose.user schema', () => {
  const googleUserObj = {
    username: 'something',
    email: 'something@gmail.com',
    accountType: 'google',
    accessToken: '294783sjdfhkjh093842384jefsdh',
    position: {
      latitude: 90,
      longitude: 180,
    },
    items: [],
  };

  let obj = undefined;
  let error = undefined;

  it('should properly validate invalid username', () => {
    // invalid username: not present
    obj = { ...googleUserObj };
    delete obj.username;
    error = new User(obj).validateSync();
    expect(error.errors.username.properties.path).toBe('username');

    // invalid username: invalid length
    obj.username = 'so';
    error = new User(obj).validateSync();
    expect(error.errors.username.properties.path).toBe('username');
  });

  it('should properly validate invalid email', () => {
    // invalid email: not present
    obj = { ...googleUserObj };
    delete obj.email;
    error = new User(obj).validateSync();
    expect(error.errors.email.properties.path).toBe('email');

    // invalid email: invalid pattern
    obj.email = 'something';
    error = new User(obj).validateSync();
    expect(error.errors.email.properties.path).toBe('email');
  });

  it('should properly validate invalid password', () => {
    // invalid password: is present
    obj = { ...googleUserObj };
    obj.password = 'Somethinlksj';
    error = new User(obj).validateSync();
    expect(error.errors.password.properties.path).toBe('password');
  });

  it('should properly validate invalid account type', () => {
    // invalid accountType: not present
    obj = { ...googleUserObj };
    delete obj.accountType;
    error = new User(obj).validateSync();
    expect(error.errors.accountType.properties.path).toBe('accountType');

    // invalid accountType: invalid value
    obj.accountType = 'something';
    error = new User(obj).validateSync();
    expect(error.errors.accountType.properties.path).toBe('accountType');
  });

  it('should properly validate invalid access token', () => {
    // invalid accessToken: not present
    obj = { ...googleUserObj };
    delete obj.accessToken;
    error = new User(obj).validateSync();
    expect(error.errors.accessToken.properties.path).toBe('accessToken');
  });

  it('should properly validate invalid position object', () => {
    // invalid position: not present
    obj = { ...googleUserObj };
    delete obj.position;
    error = new User(obj).validateSync();
    expect(error.errors.position.properties.path).toBe('position');
    obj.position = {};

    // invalid position: invalid latitude value
    obj.position.latitude = 91;
    error = new User(obj).validateSync();
    expect(error.errors.position.properties.path).toBe('position');
    obj.position.latitude = 90;

    // invalid position: invalid longitude value
    obj.position.longitude = 181;
    error = new User(obj).validateSync();
    expect(error.errors.position.properties.path).toBe('position');
    obj.position.longitude = 180;
  });

  it('should properly validate invalid items array', () => {
    // invalid items: not present
    obj = { ...googleUserObj };
    delete obj.items;
    error = new User(obj).validateSync();
    expect(error.errors.items.properties.path).toBe('items');

    // invalid items: invalid type
    obj.items = 'invalid type';
    error = new User(obj).validateSync();
    expect(error.errors.items.properties.path).toBe('items');

    // invalid items: invalid length
    obj.items = ['something'];
    error = new User(obj).validateSync();
    expect(error.errors.items.properties.path).toBe('items');
  });

  it('should properly validate valid user object', () => {
    // valid user object
    obj = { ...googleUserObj };
    error = new User(obj).validateSync();
    expect(error).toBe(undefined);
  });
});
