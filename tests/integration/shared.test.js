const User = require('../../model/user');
const Shared = require('../../model/shared');
const { createItem, originalUser } = require('./items.test');
const request = require('supertest');

let server;

describe('/public/shared', () => {
  let id;
  beforeEach(async () => {
    server = require('../../app');
    await request(server)
      .post('/user/register')
      .send(originalUser);
    const { body } = await request(server)
      .post('/user/login')
      .send({ email: originalUser.email, password: originalUser.password });
    const token = body.jwtToken;
    let result = await request(server)
      .post('/user/items?token=' + token)
      .send(createItem());
    await request(server)
      .post('/user/items?token=' + token)
      .send(createItem());
    id = result.body.itemId;
  });

  afterEach(async () => {
    server.close();
    await User.collection.deleteMany({});
  });

  describe('GET /', () => {
    let errorType, q, per_page, page;

    const exec = async () => {
      let result = await request(server)
        .get(`/public/shared?page=${page}&per_page=${per_page}}`)
        .send();
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    it('should return error if invalid per page is passed', async () => {
      errorType = 'per_page';
      page = 1;
      per_page = -1;
      await exec();
      per_page = 101;
      await exec();
      per_page = 'something';
      await exec();
    });

    it('should return error if invalid page value is passed', async () => {
      errorType = 'page';
      per_page = 10;
      page = -1;
      await exec();
      page = 0;
      await exec();
      page = 'something';
      await exec();
    });

    it('should return items if valid page or per page value is passed', async () => {
      page = 1;
      per_page = 10;
      let result = await request(server)
        .get('/public/shared?page=1&per_page=10')
        .send();
      expect(result.body.error).toBeFalsy();
    });
  });

  describe('PUT /', () => {
    let item, errorType, token;

    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      token = body.jwtToken;
    });

    const exec = async () => {
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send(item);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    const checkShared = async () => {
      await request(server)
        .put('/public/shared?token=' + token)
        .send(item);
      return await Shared.findOne({ itemId: item.itemId });
    };

    const checkInUsers = async () => {
      let result = await User.findOne({ email: originalUser.email });
      let b = result.items.find((b) => b.itemId === item.itemId);
      expect(b).toBeDefined();
      expect(b).toHaveProperty('shared', item.values.shared);
    };

    it('should return error if invalid or no itemId is passed', async () => {
      item = {};
      errorType = 'itemId';
      await exec();
      item = { itemId: 'something' };
      await exec();
    });

    it('should return error if invalid or no values object is passed', async () => {
      item = { itemId: id };
      errorType = 'values';
      await exec();
      item.values = {};
      await exec();
    });

    it('should return error if invalid field is passed in values object', async () => {
      item = { itemId: id, values: { shared: true } };
      item.values.unknownField = 'something random';
      errorType = 'values';
      await exec();
      delete item.values.unknownField;
    });

    it('should return error if invalid field is passed in request body', async () => {
      item.unknownField = 'something random';
      errorType = 'unknownField';
      await exec();
      delete item.unknownField;
    });

    it('should return no error if valid object is passed', async () => {
      item = { itemId: id, values: { shared: true } };
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send(item);
      expect(result.body.error).toBeFalsy();
      let b = result.body.items.find((b) => b.itemId === item.itemId);
      expect(b).toBeDefined();
      expect(b).toHaveProperty('shared', true);
    });

    it("should save the item in shared collection if shared is true and update it in user's items", async () => {
      item = { itemId: id, values: { shared: true } };
      let result = await checkShared();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('shared', item.values.shared);
      await checkInUsers();
    });

    it("should delete the item from shared collection if shared is false and update it in user's items", async () => {
      item = { itemId: id, values: { shared: true } };

      // share the item
      let result = await checkShared();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('shared', item.values.shared);

      // unshare the item
      item.values.shared = false;
      result = await checkShared();
      expect(result).toBeNull();
      await checkInUsers();
    });

    it('should do nothing if current value of shared is passed to update again', async () => {
      item = { itemId: id, values: { shared: false } };

      // no updates required for false
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send(item);
      expect(result.body.message).toEqual(expect.stringMatching(/updates required/gi));
      item.values.shared = true;
      await request(server)
        .put('/public/shared?token=' + token)
        .send(item);

      // no updates required for true
      result = await request(server)
        .put('/public/shared?token=' + token)
        .send(item);
      expect(result.body.message).toEqual(expect.stringMatching(/updates required/gi));
    });
  });

  describe('GET /item', () => {
    let itemId;
    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      itemId = id;
      await request(server)
        .put('/public/shared?token=' + body.jwtToken)
        .send({ itemId: id, values: { shared: true } });
    });

    it('should return error if invalid or no itemId is passed in parameter', async () => {
      let result = await request(server)
        .get('/public/shared/item')
        .send();
      expect(result.body.error).toBeTruthy();
      result = await request(server)
        .get('/public/shared/item?itemId=')
        .send();
      expect(result.body.error).toBeTruthy();
    });

    it('should return no error if valid itemId is passed in parameter', async () => {
      let result = await request(server)
        .get('/public/shared/item?itemId=' + itemId)
        .send();
      expect(result.body.error).toBeFalsy();
      let itemResultDb = await Shared.findOne({ itemId });
      expect(result.body.item).not.toBeNull();
      expect(result.body.item).toHaveProperty('title', itemResultDb.title);
      expect(result.body.item).toHaveProperty('description', itemResultDb.description);
      let userResultDb = await User.findOne({ items: { $elemMatch: { itemId } } });
      expect(result.body.user).toHaveProperty('username', userResultDb.username);
      expect(result.body.user).toHaveProperty('email', userResultDb.email);
      expect(result.body.user).toHaveProperty('position', userResultDb.position);
    });
  });
});
