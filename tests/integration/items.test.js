const request = require('supertest');
const User = require('../../model/user');
const Shared = require('../../model/shared');

let server;

describe('/user/items', () => {
  jest.setTimeout(10000);
  beforeEach(async () => {
    server = require('../../app');
    await request(server)
      .post('/user/register')
      .send(originalUser);
    const { body } = await request(server)
      .post('/user/login')
      .send({ email: originalUser.email, password: originalUser.password });
    const token = body.jwtToken;
    await request(server)
      .post('/user/items?token=' + token)
      .send(createItem());
    await request(server)
      .post('/user/items?token=' + token)
      .send(createItem());
  });

  afterEach(async () => {
    server.close();
    await User.collection.deleteMany({});
  });

  describe('GET / ', () => {
    let token;
    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      token = body.jwtToken;
    });

    it('should return all items if valid token is passed', async () => {
      let result = await request(server)
        .get('/user/items?token=' + token)
        .send();
      expect(result.status).toBe(200);
      expect(result.body.items[0]).toHaveProperty('title');
      expect(result.body.items[0]).toHaveProperty('description');
      expect(result.body.items[1]).toHaveProperty('title');
      expect(result.body.items[1]).toHaveProperty('description');
    });

    it('should return error if invalid token or no token is passed', async () => {
      let result = await request(server)
        .get('/user/items?token=')
        .send();
      expect(result.body.error).toBeTruthy();
      result = await request(server)
        .get('/user/items')
        .send();
      expect(result.body.error).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let item, token, errorType;

    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      token = body.jwtToken;
    });

    const exec = async () => {
      let result = await request(server)
        .post('/user/items?token=' + token)
        .send(item);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    it('should return error if invalid or no token is passed', async () => {
      token = '';
      errorType = 'token';
      await exec();
    });

    it('should return error if invalid or no title value is passed', async () => {
      item = createItem();
      delete item.title;
      errorType = 'title';
      await exec();
      item.title = '';
      await exec();
    });

    it('should return error if invalid or no description value is passed', async () => {
      item = createItem();
      delete item.description;
      errorType = 'description';
      await exec();
      item.description = '';
      await exec();
    });

    it('should return error if invalid or no createdAt value is passed', async () => {
      item = createItem();
      delete item.createdAt;
      errorType = 'createdAt';
      await exec();
      item.createdAt = '';
      await exec();
    });

    it('should return error if invalid or no lastModified value is passed', async () => {
      item = createItem();
      delete item.lastModified;
      errorType = 'lastModified';
      await exec();
      item.lastModified = '';
      await exec();
    });

    it('should return error if invalid or unknown field is present', async () => {
      item = createItem();
      item.unknownField = 'something random';
      errorType = 'unknownField';
      await exec();
    });

    it('should return no error for valid item object and should be saved in db', async () => {
      item = createItem();
      let result = await request(server)
        .post('/user/items?token=' + token)
        .send(item);
      const itemId = result.body.itemId;
      expect(result.body.error).toBeFalsy();

      result = await User.findOne({ email: originalUser.email });
      let items = result.items.find(b => b.itemId === itemId);
      expect(items).toHaveProperty('title', item.title);
      expect(items).toHaveProperty('description', item.description);
      expect(items).toHaveProperty('createdAt', item.createdAt);
      expect(items).toHaveProperty('lastModified', item.lastModified);
    });
  });

  describe('PUT /', () => {
    let item, token, errorType, itemId;

    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      itemId = body.items[0].itemId;
      token = body.jwtToken;
    });

    const exec = async () => {
      expect(true).toBeTruthy();
      let result = await request(server)
        .put('/user/items?token=' + token)
        .send(item);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    it('should return error if invalid token or no token is passed', async () => {
      token = '';
      errorType = 'token';
      await exec();
    });

    it('should return error if keys to be updated are not present in values', async () => {
      item = {};
      errorType = 'itemId';
      await exec();
    });

    it('should return error if title is invalid', async () => {
      item = { itemId, values: { title: '' } };
      errorType = 'values';
      await exec();
    });

    it('should return error if description is invalid', async () => {
      item = { itemId, values: { description: '' } };
      errorType = 'values';
      await exec();
    });

    it('should return error if createdAt is invalid', async () => {
      item = { itemId, values: { createdAt: '' } };
      errorType = 'values';
      await exec();
    });

    it('should return error if lastModified is invalid', async () => {
      item = { itemId, values: { lastModified: '' } };
      errorType = 'values';
      await exec();
    });

    it('should return error if invalid or unknown field is present in main object', async () => {
      item = {
        itemId,
        values: { lastModified: new Date().getTime() },
        unknownField: 'something random',
      };
      errorType = 'unknownField';
      await exec();
    });

    it('should return error if invalid or unknown field is present in values object', async () => {
      item = {
        itemId,
        values: {
          lastModified: new Date().getTime(),
          unknownField: 'something random',
        },
      };
      errorType = 'values';
      await exec();
    });

    it('should return no error if valid fields are passed and should be updated in db', async () => {
      item = { itemId, values: { ...createItem() } };
      let result = await request(server)
        .put('/user/items?token=' + token)
        .send(item);
      expect(result.body.error).toBeFalsy();

      result = await User.findOne({ email: originalUser.email });
      let items = result.items.find(b => b.itemId === item.itemId);
      expect(items).toHaveProperty('title', item.values.title);
      expect(items).toHaveProperty('description', item.values.description);
      expect(items).toHaveProperty('createdAt', item.values.createdAt);
      expect(items).toHaveProperty('lastModified', item.values.lastModified);
    });

    it('should update shared collection if the item which updated is shared', async () => {
      item = { itemId, values: { ...createItem() } };

      // shared the item first
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send({ itemId, values: { shared: true } });

      // update the item
      result = await request(server)
        .put('/user/items?token=' + token)
        .send(item);
      expect(result.body.error).toBeFalsy();

      // check if updated
      result = await Shared.findOne({ itemId });
      expect(result).toHaveProperty('title', item.values.title);
      expect(result).toHaveProperty('description', item.values.description);
    });
  });

  describe('DELETE /', () => {
    let item, token, errorType;

    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      itemId = body.items[0].itemId;
      token = body.jwtToken;
    });

    const exec = async () => {
      expect(true).toBeTruthy();
      let result = await request(server)
        .delete('/user/items?token=' + token)
        .send(item);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    it('should return error if invalid or no token is passed', async () => {
      token = '';
      errorType = 'token';
      await exec();
    });

    it('should return error if invalid or no itemId is passed', async () => {
      item = {};
      errorType = 'itemId';
      await exec();
    });

    it('should return no error if valid itemId is passed and should update db', async () => {
      let result = await request(server)
        .get('/user/items?token=' + token)
        .send();
      const itemId = result.body.items[0].itemId;

      result = await request(server)
        .delete('/user/items?token=' + token)
        .send({ itemId });
      expect(result.body.error).toBeFalsy();

      result = await User.findOne({ email: originalUser.email });
      let b = result.items.find(b => b.itemId === itemId);
      expect(b).toBeUndefined();
    });

    it("should delete item from shared if item deleted from user's is shared", async () => {
      item = { itemId, values: { ...createItem() } };

      // shared the item first
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send({ itemId, values: { shared: true } });

      // delete the item
      result = await request(server)
        .delete('/user/items?token=' + token)
        .send({ itemId });
      expect(result.body.error).toBeFalsy();

      // check if deleted from shared collections
      result = await Shared.findOne({ item: item.itemId });
      expect(result).toBeNull();
    });
  });
});

const originalUser = {
  username: 'random123',
  email: 'random123@gmail.com',
  password: 'Something12',
  confirmPassword: 'Something12',
  position: {
    latitude: 90,
    longitude: 180,
  },
};

function createItem() {
  return {
    title: new Array(4).join('' + Math.floor(Math.random() * 1000 + 1)),
    description: new Array(4).join('' + Math.floor(Math.random() * 1000 + 1)),
    createdAt: new Date().getTime(),
    lastModified: new Date().getTime(),
  };
}

module.exports.originalUser = originalUser;
module.exports.createItem = createItem;
