const User = require('../../model/user');
const request = require('supertest');

let server;

describe('/user/register', () => {
    beforeEach(async() => {
        server = require('../../app');
    });

    afterEach(async() => {
        server.close();
        await User.collection.deleteMany({});
    });

    describe('POST /', () => {
        jest.setTimeout(10000);
        let user, errorType;
        const exec = async() => {
            let result = await request(server).post('/user/register').send(user);
            expect(result.body.error).toBeTruthy();
            expect(result.body.errorType).toBe(errorType);
            return result;
        }

        it('should return error if invalid or no username is passed', async() => {
            user = {...originalUser };
            errorType = 'username';
            delete user.username;
            await exec();
            user.username = 'so';
            await exec();
        });

        it('should return error if invalid or no email is passed', async() => {
            user = {...originalUser };
            errorType = 'email';
            delete user.email;
            await exec();
            user.email = 'random12';
            await exec();
        });

        it('should return error if invalid or no password is passed', async() => {
            user = {...originalUser };
            errorType = 'password';
            delete user.password;
            await exec();
            user.password = 'Something';
            await exec();
        });

        it('should return error if invalid or no confirmPassword is present', async() => {
            user = {...originalUser };
            errorType = 'confirmPassword';
            delete user.confirmPassword;
            await exec();
            user.confirmPassword = 'Something';
            await exec();
        });

        it('should return error if invalid or no position object is present', async() => {
            user = {...originalUser };
            errorType = 'position';
            delete user.position;
            await exec();
            user.position = {};
            await exec();
            user.position.latitude = 90;
            user.position.longitude = 180;
        });

        it('should return error if invalid latitude is present', async() => {
            user = {...originalUser };
            errorType = 'position';
            delete user.position.latitude;
            await exec();
            user.position.latitude = 91;
            await exec();
            user.position.latitude = -91;
            await exec();
            user.position.latitude = 90;
        });

        it('should return error if invalid longitude is present', async() => {
            user = {...originalUser };
            errorType = 'position';
            delete user.position.longitude;
            await exec();
            user.position.longitude = 181;
            await exec();
            user.position.longitude = -181;
            await exec();
            user.position.longitude = 180;
        });

        it('should return error if invalid field is present in position object', async() => {
            user = {...originalUser };
            errorType = 'position';
            user.position.unknownField = 'something random';
            await exec();
            delete user.position.unknownField;
        });

        it('should return error if invalid field is present in request body', async() => {
            user = {...originalUser };
            errorType = 'unknownField';
            user.unknownField = 'something random';
            await exec();
        });

        it('should return no error if valid user object is passed', async() => {
            user = {...originalUser };
            let result = await request(server).post('/user/register').send(user);
            expect(result.body.error).toBeFalsy();
        });

        it('should return error if user already exists', async() => {
            user = {...originalUser };
            errorType = 'email';
            await request(server).post('/user/register').send(user);
            let result = await exec();
            expect(result.body.errorMessage).toEqual(expect.stringMatching(/user already exist/gi));
        });

    });
});

const originalUser = {
    username: 'random',
    email: 'random12@gmail.com',
    password: 'Something12',
    confirmPassword: 'Something12',
    position: {
        latitude: 90,
        longitude: 180
    }
}