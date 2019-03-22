const User = require('../../../model/user');

describe('mongoose.user schema', () => {
    it('should properly validate all types of request body for registering a local user', () => {
        const localUserObj = {
            username: 'something',
            email: 'something@gmail.com',
            password: 'Something12@',
            accountType: 'local',
            userType: 'customer',
            position: {
                latitude: 90,
                longitude: 180
            },
            blogs: []
        }

        // invalid username: not present
        let obj = {...localUserObj }
        delete obj.username
        let error = new User(obj).validateSync();
        expect(error.errors.username.properties.path).toBe('username');

        // invalid username: invalid length
        obj.username = 'so'
        error = new User(obj).validateSync();
        expect(error.errors.username.properties.path).toBe('username');

        // invalid email: not present
        obj = {...localUserObj }
        delete obj.email
        error = new User(obj).validateSync();
        expect(error.errors.email.properties.path).toBe('email');

        // invalid email: invalid pattern
        obj.email = 'something';
        error = new User(obj).validateSync();
        expect(error.errors.email.properties.path).toBe('email');

        // invalid password: not present
        obj = {...localUserObj }
        delete obj.password
        error = new User(obj).validateSync();
        expect(error.errors.password.properties.path).toBe('password');

        // invalid password: invalid pattern
        obj.password = 'something';
        error = new User(obj).validateSync();
        expect(error.errors.password.properties.path).toBe('password');

        // invalid accountType: not present
        obj = {...localUserObj }
        delete obj.accountType
        error = new User(obj).validateSync();
        expect(error.errors.accountType.properties.path).toBe('accountType');

        // invalid accountType: invalid value
        obj.accountType = 'something';
        error = new User(obj).validateSync();
        expect(error.errors.accountType.properties.path).toBe('accountType');

        // invalid accessToken: is present
        obj = {...localUserObj }
        obj.accessToken = 'w98798iuhfkjshf';
        error = new User(obj).validateSync();
        expect(error.errors.accessToken.properties.path).toBe('accessToken');

        // invalid refreshToken: is present
        obj = {...localUserObj }
        obj.refreshToken = 'w98798iuhfkjshf';
        error = new User(obj).validateSync();
        expect(error.errors.refreshToken.properties.path).toBe('refreshToken');

        // invalid userType: not present
        obj = {...localUserObj }
        delete obj.userType
        error = new User(obj).validateSync();
        expect(error.errors.userType.properties.path).toBe('userType');

        // invalid userType: invalid value
        obj.userType = 'invalid value';
        error = new User(obj).validateSync();
        expect(error.errors.userType.properties.path).toBe('userType');

        // invalid position: not present
        obj = {...localUserObj }
        delete obj.position
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

        // invalid blogs: not present
        obj = {...localUserObj };
        delete obj.blogs;
        error = new User(obj).validateSync();
        expect(error.errors.blogs.properties.path).toBe('blogs');

        // invalid blogs: invalid type
        obj.blogs = 'invalid type';
        error = new User(obj).validateSync();
        expect(error.errors.blogs.properties.path).toBe('blogs');

        // invalid blogs: invalid length
        obj.blogs = ['something'];
        error = new User(obj).validateSync();
        expect(error.errors.blogs.properties.path).toBe('blogs');

        // valid user object
        obj = {...localUserObj }
        error = new User(obj).validateSync();
        expect(error).toBe(undefined);

    });
});