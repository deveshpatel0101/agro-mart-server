const request = require('supertest');
const User = require('../../model/user');
const Shared = require('../../model/shared');

let server;

describe('/user/blogs', () => {
    jest.setTimeout(10000);
    beforeEach(async() => {
        server = require('../../app');
        await request(server).post('/user/register').send(originalUser);
        const { body } = await request(server).post('/user/login').send({ email: originalUser.email, password: originalUser.password });
        const token = body.jwtToken;
        await request(server).post('/user/blogs?token=' + token).send(createBlog());
        await request(server).post('/user/blogs?token=' + token).send(createBlog());
    });

    afterEach(async() => {
        server.close();
        await User.collection.deleteMany({});
    });

    describe('GET / ', () => {
        let token;
        beforeEach(async() => {
            const { body } = await request(server).post('/user/login').send({ email: originalUser.email, password: originalUser.password });
            token = body.jwtToken;
        });

        it('should return all blogs if valid token is passed', async() => {
            let result = await request(server).get('/user/blogs?token=' + token).send();
            expect(result.status).toBe(200);
            expect(result.body.blogs[0]).toHaveProperty('title');
            expect(result.body.blogs[0]).toHaveProperty('description');
            expect(result.body.blogs[1]).toHaveProperty('title');
            expect(result.body.blogs[1]).toHaveProperty('description');
        });

        it('should return error if invalid token or no token is passed', async() => {
            let result = await request(server).get('/user/blogs?token=').send();
            expect(result.body.error).toBeTruthy();
            result = await request(server).get('/user/blogs').send();
            expect(result.body.error).toBeTruthy();
        });
    });

    describe('POST /', () => {
        let blog, token, errorType;

        beforeEach(async() => {
            const { body } = await request(server).post('/user/login').send({ email: originalUser.email, password: originalUser.password });
            token = body.jwtToken;
        });

        const exec = async() => {
            let result = await request(server).post('/user/blogs?token=' + token).send(blog);
            expect(result.body.error).toBeTruthy();
            expect(result.body.errorType).toBe(errorType);
        }

        it('should return error if invalid or no token is passed', async() => {
            token = '';
            errorType = 'token';
            await exec();
        });

        it('should return error if invalid or no title value is passed', async() => {
            blog = createBlog();
            delete blog.title;
            errorType = 'title';
            await exec();
            blog.title = '';
            await exec()
        });

        it('should return error if invalid or no description value is passed', async() => {
            blog = createBlog();
            delete blog.description;
            errorType = 'description';
            await exec();
            blog.description = '';
            await exec()
        });

        it('should return error if invalid or no createdAt value is passed', async() => {
            blog = createBlog();
            delete blog.createdAt;
            errorType = 'createdAt';
            await exec();
            blog.createdAt = '';
            await exec()
        });

        it('should return error if invalid or no lastModified value is passed', async() => {
            blog = createBlog();
            delete blog.lastModified;
            errorType = 'lastModified';
            await exec();
            blog.lastModified = '';
            await exec()
        });

        it('should return error if invalid or unknown field is present', async() => {
            blog = createBlog();
            blog.unknownField = 'something random';
            errorType = 'unknownField';
            await exec();
        });

        it('should return no error for valid blog object and should be saved in db', async() => {
            blog = createBlog();
            let result = await request(server).post('/user/blogs?token=' + token).send(blog);
            const blogId = result.body.blogId;
            expect(result.body.error).toBeFalsy();

            result = await User.findOne({ email: originalUser.email });
            let blogs = result.blogs.find(b => b.blogId === blogId);
            expect(blogs).toHaveProperty('title', blog.title);
            expect(blogs).toHaveProperty('description', blog.description);
            expect(blogs).toHaveProperty('createdAt', blog.createdAt);
            expect(blogs).toHaveProperty('lastModified', blog.lastModified);
        });

    });

    describe('PUT /', () => {
        let blog, token, errorType, blogId;

        beforeEach(async() => {
            const { body } = await request(server).post('/user/login').send({ email: originalUser.email, password: originalUser.password });
            blogId = body.blogs[0].blogId;
            token = body.jwtToken;
        });

        const exec = async() => {
            expect(true).toBeTruthy();
            let result = await request(server).put('/user/blogs?token=' + token).send(blog);
            expect(result.body.error).toBeTruthy();
            expect(result.body.errorType).toBe(errorType);
        }

        it('should return error if invalid token or no token is passed', async() => {
            token = '';
            errorType = 'token';
            await exec();
        });


        it('should return error if keys to be updated are not present in values', async() => {
            blog = {};
            errorType = 'blogId';
            await exec();
        });

        it('should return error if title is invalid', async() => {
            blog = { blogId, values: { title: '' } };
            errorType = 'values';
            await exec();
        });

        it('should return error if description is invalid', async() => {
            blog = { blogId, values: { description: '' } };
            errorType = 'values';
            await exec();
        });

        it('should return error if createdAt is invalid', async() => {
            blog = { blogId, values: { createdAt: '' } };
            errorType = 'values';
            await exec();
        });

        it('should return error if lastModified is invalid', async() => {
            blog = { blogId, values: { lastModified: '' } };
            errorType = 'values';
            await exec();
        });

        it('should return error if invalid or unknown field is present in main object', async() => {
            blog = { blogId, values: { lastModified: new Date().getTime() }, unknownField: 'something random' };
            errorType = 'unknownField';
            await exec();
        });

        it('should return error if invalid or unknown field is present in values object', async() => {
            blog = { blogId, values: { lastModified: new Date().getTime(), unknownField: 'something random' } };
            errorType = 'values';
            await exec();
        });

        it('should return no error if valid fields are passed and should be updated in db', async() => {
            blog = { blogId, values: {...createBlog() } };
            let result = await request(server).put('/user/blogs?token=' + token).send(blog);
            expect(result.body.error).toBeFalsy();

            result = await User.findOne({ email: originalUser.email });
            let blogs = result.blogs.find(b => b.blogId === blog.blogId);
            expect(blogs).toHaveProperty('title', blog.values.title);
            expect(blogs).toHaveProperty('description', blog.values.description);
            expect(blogs).toHaveProperty('createdAt', blog.values.createdAt);
            expect(blogs).toHaveProperty('lastModified', blog.values.lastModified);
        });

        it('should update shared collection if the blog which updated is shared', async() => {
            blog = { blogId, values: {...createBlog() } };

            // shared the blog first
            let result = await request(server).put('/public/shared?token=' + token).send({ blogId, values: { shared: true } });

            // update the blog
            result = await request(server).put('/user/blogs?token=' + token).send(blog);
            expect(result.body.error).toBeFalsy();

            // check if updated
            result = await Shared.findOne({ blogId });
            expect(result).toHaveProperty('title', blog.values.title);
            expect(result).toHaveProperty('description', blog.values.description);
        });

    });

    describe('DELETE /', () => {
        let blog, token, errorType;

        beforeEach(async() => {
            const { body } = await request(server).post('/user/login').send({ email: originalUser.email, password: originalUser.password });
            blogId = body.blogs[0].blogId;
            token = body.jwtToken;
        });

        const exec = async() => {
            expect(true).toBeTruthy();
            let result = await request(server).delete('/user/blogs?token=' + token).send(blog);
            expect(result.body.error).toBeTruthy();
            expect(result.body.errorType).toBe(errorType);
        }

        it('should return error if invalid or no token is passed', async() => {
            token = '';
            errorType = 'token';
            await exec();
        });

        it('should return error if invalid or no blogId is passed', async() => {
            blog = {};
            errorType = 'blogId';
            await exec();
        });

        it('should return no error if valid blogId is passed and should update db', async() => {
            let result = await request(server).get('/user/blogs?token=' + token).send();
            const blogId = result.body.blogs[0].blogId;

            result = await request(server).delete('/user/blogs?token=' + token).send({ blogId });
            expect(result.body.error).toBeFalsy();

            result = await User.findOne({ email: originalUser.email });
            let b = result.blogs.find(b => b.blogId === blogId);
            expect(b).toBeUndefined();
        });

        it('should delete blog from shared if blog deleted from user\'s is shared', async() => {
            blog = { blogId, values: {...createBlog() } };

            // shared the blog first
            let result = await request(server).put('/public/shared?token=' + token).send({ blogId, values: { shared: true } });

            // delete the blog
            result = await request(server).delete('/user/blogs?token=' + token).send({ blogId });
            expect(result.body.error).toBeFalsy();

            // check if deleted from shared collections
            result = await Shared.findOne({ blog: blog.blogId });
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
        longitude: 180
    }
}

function createBlog() {
    return {
        title: new Array(4).join('' + Math.floor(Math.random() * 1000 + 1)),
        description: new Array(4).join('' + Math.floor(Math.random() * 1000 + 1)),
        createdAt: new Date().getTime(),
        lastModified: new Date().getTime()
    }
}

module.exports.originalUser = originalUser;
module.exports.createBlog = createBlog;