import {assert} from 'chai';
import {maybe, succeed, delay} from '../src/promises';


describe('Promises', function() {
    describe('succeed', function() {
        it('succeeds', function() {
            let p = succeed(42);
            assert.strictEqual(p.value(), 42);
        });
    });

    describe('maybe', function() {
        it('succeeds', function() {
            let p = maybe(() => 42);
            return assert.eventually.strictEqual(p, 42);
        });

        it('passes spread arguments', function() {
            let p = maybe((...args) => args, 1, 2, 3);
            return assert.eventually.deepEqual(p, [1, 2, 3]);
        });

        it('fails', function() {
            let p = maybe(() => { throw new Error('Oops'); });
            return p.then(() => {
                assert.fail('This should not be called');
            }).caught((e) => {
                assert.throws(() => { throw e; }, Error, 'Oops');
            });
        });
    });

    describe('delay', function() {
        it('succeeds', function() {
            let p = delay(10).return(42);
            assert.isTrue(p.isPending(), 'Promise is not pending');
            return assert.eventually.strictEqual(p, 42);
        });

        it('fails', function() {
            let p = delay(10).then(() => {
                throw new Error('Oops');
            });
            assert.isTrue(p.isPending());
            return p.then(() => {
                assert.fail('This should not be called');
            }).caught((e) => {
                assert.throws(() => {throw e;}, Error, 'Oops');
            });
        });
    });
});
