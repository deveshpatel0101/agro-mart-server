const User = require('../../model/user');
const request = require('supertest');

let server;

describe('/user/auth/google/register', () => {
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
        .post('/user/auth/google/register')
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

    it('should return error if invalid or no access token is passed', async () => {
      user = { ...originalUser };
      errorType = 'accessToken';
      delete user.accessToken;
      await exec();
      user.accessToken = 'invalid access token';
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

    // it('should return no error if valid request and should be saved in database', async () => {
    // although we have all fields correct, the following test will fail because we don't have a programmatic way of generating access token on server side and right now we are just testing using invalid google's access token. The only way right now is to manually test the route.
    // if one finds it then please raise a pull request of suggesting a solution.
    //   user = { ...originalUser };
    //   let result = await request(server)
    //     .post('/user/auth/google')
    //     .send(user);
    //   expect(result.body.error).toBeFalsy();
    //   result = await User.findOne({ email: user.email });
    //   expect(result).not.toBeNull();
    //   expect(result).toHaveProperty('email', user.email);
    //   expect(result).toHaveProperty('username', user.username);
    // });
  });
});

const originalUser = {
  username: 'google',
  email: 'google12@gmail.com',
  googleId: 'longusergoogleid',
  accessToken: 'invalid access token',
  position: {
    latitude: 90,
    longitude: 180,
  },
};
