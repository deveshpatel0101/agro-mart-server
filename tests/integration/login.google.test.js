const User = require('../../model/user');
const request = require('supertest');

let server;

describe('/user/auth/google/login', () => {
  beforeEach(() => {
    server = require('../../app');
  });

  afterEach(async () => {
    server.close();
    await User.collection.deleteMany({});
  });

  describe('POST /', () => {
    it('should return error if invalid or no access token is passed', async () => {
      const obj = { ...originalUser };
      let result = undefined;

      // access token not present
      result = await request(server)
        .post('/user/auth/google/login')
        .send(obj);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe('accessToken');

      // invalid access token
      obj.accessToken = 'invalid access token';
      result = await request(server)
        .post('/user/auth/google/login')
        .send(obj);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe('accessToken');
    });

    it('should return no error if valid access token is present', async () => {
      // although we have all fields correct, the following test will fail because we don't have a programmatic way of generating access token on server side and right now we are just testing using invalid google's access token. The only way right now is to manually test the route.
      // if one finds it then please raise a pull request of suggesting a solution.
      // obj.accessToken = 'valid token';
      // result = await request(server)
      //   .post('/user/auth/google/login')
      //   .send(obj);
      // expect(result.body.error).toBeFalsy();
    });
  });
});

const originalUser = {
  accessToken: 'invalid access token',
};
