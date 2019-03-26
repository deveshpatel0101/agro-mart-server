const User = require('../../model/user');
const Shared = require('../../model/shared');
const { createBlog, originalUser } = require('./blogs.test');
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
      .post('/user/blogs?token=' + token)
      .send(createBlog());
    await request(server)
      .post('/user/blogs?token=' + token)
      .send(createBlog());
    id = result.body.blogId;
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

    it('should return blogs if valid page or per page value is passed', async () => {
      page = 1;
      per_page = 10;
      let result = await request(server)
        .get('/public/shared?page=1&per_page=10')
        .send();
      expect(result.body.error).toBeFalsy();
    });
  });

  describe('PUT /', () => {
    let blog, errorType, token;

    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      token = body.jwtToken;
    });

    const exec = async () => {
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send(blog);
      expect(result.body.error).toBeTruthy();
      expect(result.body.errorType).toBe(errorType);
    };

    const checkShared = async () => {
      await request(server)
        .put('/public/shared?token=' + token)
        .send(blog);
      return await Shared.findOne({ blogId: blog.blogId });
    };

    const checkInUsers = async () => {
      let result = await User.findOne({ email: originalUser.email });
      let b = result.blogs.find((b) => b.blogId === blog.blogId);
      expect(b).toBeDefined();
      expect(b).toHaveProperty('shared', blog.values.shared);
    };

    it('should return error if invalid or no blogId is passed', async () => {
      blog = {};
      errorType = 'blogId';
      await exec();
      blog = { blogId: 'something' };
      await exec();
    });

    it('should return error if invalid or no values object is passed', async () => {
      blog = { blogId: id };
      errorType = 'values';
      await exec();
      blog.values = {};
      await exec();
    });

    it('should return error if invalid field is passed in values object', async () => {
      blog = { blogId: id, values: { shared: true } };
      blog.values.unknownField = 'something random';
      errorType = 'values';
      await exec();
      delete blog.values.unknownField;
    });

    it('should return error if invalid field is passed in request body', async () => {
      blog.unknownField = 'something random';
      errorType = 'unknownField';
      await exec();
      delete blog.unknownField;
    });

    it('should return no error if valid object is passed', async () => {
      blog = { blogId: id, values: { shared: true } };
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send(blog);
      expect(result.body.error).toBeFalsy();
      let b = result.body.blogs.find((b) => b.blogId === blog.blogId);
      expect(b).toBeDefined();
      expect(b).toHaveProperty('shared', true);
    });

    it("should save the blog in shared collection if shared is true and update it in user's blogs", async () => {
      blog = { blogId: id, values: { shared: true } };
      let result = await checkShared();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('shared', blog.values.shared);
      await checkInUsers();
    });

    it("should delete the blog from shared collection if shared is false and update it in user's blogs", async () => {
      blog = { blogId: id, values: { shared: true } };

      // share the blog
      let result = await checkShared();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('shared', blog.values.shared);

      // unshare the blog
      blog.values.shared = false;
      result = await checkShared();
      expect(result).toBeNull();
      await checkInUsers();
    });

    it('should do nothing if current value of shared is passed to update again', async () => {
      blog = { blogId: id, values: { shared: false } };

      // no updates required for false
      let result = await request(server)
        .put('/public/shared?token=' + token)
        .send(blog);
      expect(result.body.message).toEqual(
        expect.stringMatching(/updates required/gi),
      );
      blog.values.shared = true;
      await request(server)
        .put('/public/shared?token=' + token)
        .send(blog);

      // no updates required for true
      result = await request(server)
        .put('/public/shared?token=' + token)
        .send(blog);
      expect(result.body.message).toEqual(
        expect.stringMatching(/updates required/gi),
      );
    });
  });

  describe('GET /', () => {
    let blogId;
    beforeEach(async () => {
      const { body } = await request(server)
        .post('/user/login')
        .send({ email: originalUser.email, password: originalUser.password });
      blogId = id;
      await request(server)
        .put('/public/shared?token=' + body.jwtToken)
        .send({ blogId: id, values: { shared: true } });
    });

    it('should return error if invalid or no blogId is passed in parameter', async () => {
      let result = await request(server)
        .get('/public/shared/blog')
        .send();
      expect(result.body.error).toBeTruthy();
      result = await request(server)
        .get('/public/shared/blog?blogId=')
        .send();
      expect(result.body.error).toBeTruthy();
    });

    it('should return no error if valid blogId is passed in parameter', async () => {
      let result = await request(server)
        .get('/public/shared/blog?blogId=' + blogId)
        .send();
      expect(result.body.error).toBeFalsy();
      result = await Shared.findOne({ blogId });
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
    });
  });
});
