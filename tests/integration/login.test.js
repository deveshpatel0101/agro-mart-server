const User = require('../../model/user');
const request = require('supertest');
const { createItem, originalUser } = require('./items.test');
let server;

describe('/user/login', () => {
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

  describe('POST /', () => {
    let user, errorType;

    const exec = async () => {
      let result = await request(server)
        .post('/user/login')
        .send(user);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
      return result;
    };

    it('should return error if invalid or no email is passed', async () => {
      user = { ...loginUser };
      delete user.email;
      errorType = 'email';
      await exec();
      user.email = 'something';
      await exec();
    });

    it('should return error if invalid or no password is passed', async () => {
      user = { ...loginUser };
      delete user.password;
      errorType = 'password';
      await exec();
      user.password = 'Something';
      await exec();
    });

    it('should return error if invalid field is passed in request body', async () => {
      user = { ...loginUser };
      user.unknownField = 'something random';
      errorType = 'unknownField';
      await exec();
      delete user.unknownField;
    });

    it('should return error if user does not exist', async () => {
      user = { ...loginUser };
      user.email = 'userdoesnotexist@gmail.com';
      errorType = 'email';
      let result = await exec();
      expect(result.body.errorMessage).toEqual(expect.stringMatching(/does not exist/gi));
    });

    it('should return error if password is wrong', async () => {
      user = { ...loginUser };
      user.password = 'Something123@';
      errorType = 'password';
      let result = await exec();
      expect(result.body.errorMessage).toEqual(expect.stringMatching(/wrong password/gi));
    });

    it('should return no error and jwtToken if valid email and password is passed', async () => {
      user = { ...loginUser };
      let result = await request(server)
        .post('/user/login')
        .send(user);
      expect(result.body.error).toBeFalsy();
      expect(result.body).toHaveProperty('jwtToken');
      let dbResult = await User.findOne({ email: loginUser.email });
      expect(dbResult.items).toEqual(result.body.items);
    });

    it('should return valid token and user should be able to get all items using that token', async () => {
      let result = await request(server)
        .post('/user/login')
        .send(user);
      const token = result.body.jwtToken;
      result = await request(server)
        .get('/user/items?token=' + token)
        .send();
      let dbResult = await User.findOne({ email: loginUser.email });
      expect(dbResult.items).toEqual(result.body.items);
    });
  });
});

const loginUser = {
  email: 'random123@gmail.com',
  password: 'Something12',
};
