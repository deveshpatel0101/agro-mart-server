const Joi = require('joi');
const { registerSchema } = require('../../../validators/register');

describe('joi register validator', () => {
    it('should properly validate all types of request body for registering a local user', () => {
        const registerObj = {
            username: 'something',
            email: 'something@gmail.com',
            password: 'Something12',
            confirmPassword: 'Something12',
            userType: 'customer',
            position: {
                latitude: 90,
                longitude: 180
            },
            accountType: 'local',
            blogs: []
        }

        // invalid username: not present
        let obj = {...registerObj };
        delete obj.username
        let result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['username']));

        // invalid username: invalid length
        obj.username = 'so';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['username']));

        // invalid email: not present
        obj = {...registerObj }
        delete obj.email;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));

        // invalid email: invalid pattern
        obj.email = 'something';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['email']));

        // invalid password: not present
        obj = {...registerObj };
        delete obj.password;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['password']));

        // invalid password: invalid pattern
        obj.password = 'Something';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['password']));

        // invalid confirmPassword: not present
        obj = {...registerObj };
        delete obj.confirmPassword;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['confirmPassword']));

        // invalid confirmPassword: not match with password
        obj.confirmPassword = 'Something1';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['confirmPassword']));

        // invalid userType: not present
        obj = {...registerObj };
        delete obj.userType;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['userType']));

        // invalid userType: invalid value
        obj.userType = 'invalid value';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['userType']));

        // invalid position: not present
        obj = {...registerObj };
        delete obj.position;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
        obj.position = {};

        // invalid position-latitude: not present
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));

        // invalid position-latitude: invalid value
        obj.position.latitude = 91;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
        obj.position.latitude = 90;

        // invalid position-longitude: not present
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));

        // invalid position-longitude: invalid value
        obj.position.longitude = 181;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['position']));
        obj.position.longitude = 180;

        // invalid accountType: not present
        obj = {...registerObj };
        delete obj.accountType;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['accountType']));

        // invalid accountType: invalid value
        obj.accountType = 'invalid value';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['accountType']));

        // invalid blogs: not present
        obj = {...registerObj };
        delete obj.blogs;
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogs']));

        // invalid blogs: invalid type
        obj.blogs = 'invalid type';
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogs']));

        // invalid blogs: invalid length
        obj.blogs = ['invalid length'];
        result = Joi.validate(obj, registerSchema);
        expect(result.error.details[0].path).toEqual(expect.arrayContaining(['blogs']));

        // valid register user object
        obj = {...registerObj };
        result = Joi.validate(obj, registerSchema);
        expect(result.error).toBe(null);
    });
});