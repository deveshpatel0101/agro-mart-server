const Shared = require('../../../model/shared');

describe('mongoose.shared schema', () => {
    it('should properly validate all types of request body for sharing a blog', () => {
        const validSharedObj = {
            blogId: '394872309487987534',
            title: 'something',
            description: 'somethinglkajiou  9834hdfkj  aiuh',
            createdAt: 973409874,
            lastModified: 987349873,
            shared: true,
            position: {
                latitude: 90,
                longitude: 180
            }
        }

        // invalid blogId: not present
        let obj = {...validSharedObj };
        delete obj.blogId;
        let error = new Shared(obj).validateSync();
        expect(error.errors.blogId.properties.path).toBe('blogId');

        // invalid title: not present
        obj = {...validSharedObj };
        delete obj.title;
        error = new Shared(obj).validateSync();
        expect(error.errors.title.properties.path).toBe('title');

        // invalid description: not present
        obj = {...validSharedObj };
        delete obj.description;
        error = new Shared(obj).validateSync();
        expect(error.errors.description.properties.path).toBe('description');

        // invalid createdAt: not present
        obj = {...validSharedObj };
        delete obj.createdAt;
        error = new Shared(obj).validateSync();
        expect(error.errors.createdAt.properties.path).toBe('createdAt');

        // invalid lastModified: not present
        obj = {...validSharedObj };
        delete obj.lastModified;
        error = new Shared(obj).validateSync();
        expect(error.errors.lastModified.properties.path).toBe('lastModified');

        // invalid shared: not present
        obj = {...validSharedObj };
        delete obj.shared;
        error = new Shared(obj).validateSync();
        expect(error.errors.shared.properties.path).toBe('shared');

        // invalid position: not present
        obj = {...validSharedObj };
        delete obj.position;
        error = new Shared(obj).validateSync();
        expect(error.errors.position.properties.path).toBe('position');
        obj.position = {};

        // invalid position: invalid latitude value
        obj.position.latitude = 91;
        error = new Shared(obj).validateSync();
        expect(error.errors.position.properties.path).toBe('position');
        obj.position.latitude = 90;

        // invalid position: invalid longitude value
        obj.position.longitude = 181;
        error = new Shared(obj).validateSync();
        expect(error.errors.position.properties.path).toBe('position');
        obj.position.longitude = 180;

        // valid shared object
        obj = {...validSharedObj };
        error = new Shared(obj).validateSync();
        expect(error).toBe(undefined);
    });
});