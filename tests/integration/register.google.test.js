const User = require('../../model/user');
const request = require('supertest');

let server;

describe('/user/auth/google', () => {
  beforeEach(() => {
    server = require('../../app');
  });

  afterEach(async () => {
    server.close();
    await User.collection.deleteMany({});
  });

  describe('POST /', () => {
    let user, errorType;

    const exec = async () => {
      let result = await request(server)
        .post('/user/auth/google')
        .send(user);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    it('should return error if invalid or no username is passed', async () => {
      user = { ...originalUser };
      errorType = 'username';
      delete user.username;
      await exec();
      user.username = 'go';
      await exec();
    });

    it('should return error if invalid or no email is passed', async () => {
      user = { ...originalUser };
      errorType = 'email';
      delete user.email;
      await exec();
      user.email = 'google';
      await exec();
    });

    it('should return error if no access token is passed', async () => {
      user = { ...originalUser };
      errorType = 'accessToken';
      delete user.accessToken;
      await exec();
    });

    it('should return error if invalid or no position object is passed', async () => {
      user = { ...originalUser };
      errorType = 'position';
      delete user.position;
      await exec();
      user.position = {};
      await exec();
    });

    it('should return error if invalid latitude is passed', async () => {
      user = { ...originalUser };
      errorType = 'position';
      user.position.latitude = -91;
      await exec();
      user.position.latitude = 91;
      await exec();
      user.position.latitude = 90;
    });

    it('should return error if invalid longitude is passed', async () => {
      user = { ...originalUser };
      errorType = 'position';
      user.position.longitude = -181;
      await exec();
      user.position.longitude = 181;
      await exec();
      user.position.longitude = 180;
    });

    it('should return error if invalid field is passed in position object', async () => {
      user = { ...originalUser };
      errorType = 'position';
      user.position.unknownField = 'something random';
      await exec();
      delete user.position.unknownField;
    });

    it('should return error if invalid field is passed in request body', async () => {
      user = { ...originalUser };
      errorType = 'unknownField';
      user.unknownField = 'something random';
      await exec();
    });

    it('should return no error if valid request and should be saved in database', async () => {
      user = { ...originalUser };

      let result = await request(server)
        .post('/user/auth/google')
        .send(user);
      expect(result.body.error).toBeFalsy();

      result = await User.findOne({ email: user.email });
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('email', user.email);
      expect(result).toHaveProperty('username', user.username);
    });
  });
});

const originalUser = {
  username: 'google',
  email: 'google12@gmail.com',
  accessToken: 'thisisalongaccesstoken',
  position: {
    latitude: 90,
    longitude: 180,
  },
};
