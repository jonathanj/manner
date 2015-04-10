import {assert} from 'chai';
import {List, Map} from 'immutable';
import {all, any, combine, is, are} from '../src/validators';
import * as V from '../src/validators';
import en from '../src/i18n/en';
import Promise from 'bluebird';


function assertValid(i18n, f, ...rest) {
    let result = f(...rest);
    assert.strictEqual(V.VALID, result, 'Expected valid result');
}


function assertInvalid(i18n, message, f, ...rest) {
    let result = f(...rest);
    assert.isFunction(result, 'Invalid results must be a function');
    assert.strictEqual(result(i18n), message, 'Error messages do not match');
}


describe('Validator combinators', function() {
    beforeEach(function() {
        this.values = Map({'a': 42, 'b': 21});
        this.resolve = (i18n, p) => {
            return p.then(m => V.Validators.resolveMessages(i18n, m));
        };
    }),

    describe('is', function() {
        it('produces a validator naming a single field', function() {
            let validator = is('a', null);
            assert.deepEqual(
                validator.fieldNames,
                List(['a']));
        });

        it('valid', function() {
            let validator = is('a', V.equal(42));
            return assert.eventually.deepEqual(
                this.resolve(en, validator.validate(this.values)),
                Map());
        });

        it('invalid', function() {
            let validator = is('a', V.equal(21));
            return assert.eventually.deepEqual(
                this.resolve(en, validator.validate(this.values)),
                Map({'a': 'Must be "21"'}));
        });
    });

    describe('are', function() {
        before(function() {
            this.sumIs = value =>
                (...ns) => V.equal(value)(ns.reduce((a, b) => a + b));
        }),

        it('produces a validator naming multiple ordered fields', function() {
            let validator = are(['a', 'b'], null);
            assert.deepEqual(
                validator.fieldNames,
                List(['a', 'b']));
        });

        it('valid', function() {
            let validator = are(['a', 'b'], this.sumIs(63));
            return assert.eventually.deepEqual(
                this.resolve(en, validator.validate(this.values)),
                Map());
        });

        it('invalid', function() {
            let validator = are(['a', 'b'], this.sumIs(99));
            return assert.eventually.deepEqual(
                this.resolve(en, validator.validate(this.values)),
                Map({'a': 'Must be "99"',
                     'b': 'Must be "99"'}));
        });
    });

    describe('any', function() {
        it('produces an ordered compound validator', function() {
            let validator = any(is('a', null),
                                is('b', null));
            assert.deepEqual(
                validator.fieldNames,
                List(['a', 'b']));
        });

        it('valid', function() {
            let validator = any(is('a', V.equal(42)),
                                is('b', V.equal('nope')));
            return assert.eventually.deepEqual(
                this.resolve(en, validator.validate(this.values)),
                Map());
        });

        it('invalid', function() {
            let validator = any(is('a', V.equal('nah')),
                                is('b', V.equal('nope')));
            return assert.eventually.deepEqual(
                this.resolve(en, validator.validate(this.values)),
                Map({'a': 'Must be "nah"',
                     'b': 'Must be "nope"'}));
        });
    });
});


describe('Validators', function() {
    it('xxx', function() {
        let validators = new V.Validators(
            is('a', V.equal('one')),
            is('b', V.equal('two')));
        let model = Map({'a': 'two',
                         'b': 'two'});
        return validators.validate(model).then(f => {
            assert.isFunction(f);
            assert.deepEqual(
                f(en),
                Map({'a': 'Must be \"one\"'}));
        });
    });

    it('async validators are cancelled if they are pending', function() {
        let validators = new V.Validators(
            is('a', V.onceEvery(10, V.equal('one'))));
        // Fire off a validation, with invalid data..
        let model1 = Map({'a': 'two'});
        let p1 = validators.validate(model1);
        // Fire off a second validation, with valid data, before the first once
        // runs.
        let model2 = Map({'a': 'one'});
        let p2 = validators.validate(model2);
        // Let the validator run.
        return Promise.join(
            p2,
            assert.isRejected(p1, Promise.CancellationError),
            result => {
                assert.deepEqual(
                    result(en),
                    Map({}));
            });
    });
});


describe('Validator functions', function() {
    describe('message', function() {
        it('valid', function() {
            let msg = (i18n, args, rest) => {
                assert.fail('This should not be called');
            };
            assertValid(en, V.message(msg, V.equal, 0), 0);
        });
        it('invalid custom message', function() {
            let msg = (i18n, args, rest) => {
                assert.isObject(i18n);
                assert.deepEqual(args, [0]);
                assert.deepEqual(rest, [1]);
                return 'Nope';
            };
            assertInvalid(en, 'Nope', V.message(msg, V.equal, 0), 1);
        });
    });

    describe('combine', function() {
        before(function() {
            this.succeed = () => V.VALID;
            this.fail = (msg) => () => msg;
        }),

        it('report the first failing validator', function() {
            let f = combine(
                this.succeed, this.fail('fail'), this.fail('oops'));
            assert.strictEqual(f(42), 'fail');
        });

        it('return VALID if success', function() {
            let f = combine(this.succeed);
            assert.strictEqual(f(42), V.VALID);
        });
    });

    describe('equal', function() {
        it('valid', function() {
            assertValid(en, V.equal(0), 0);
            assertValid(en, V.equalTo(0), 0);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be "0"', V.equal(0), 1);
            assertInvalid(en, 'Must be "0"', V.equalTo(0), 1);
        });
    });

    describe('notEqual', function() {
        it('valid', function() {
            assertValid(en, V.notEqual(0), 1);
            assertValid(en, V.notEqual(0), null);
            assertValid(en, V.notEqual(0), undefined);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must not be "0"', V.notEqual(0), 0);
        });
    });

    describe('lessThan', function() {
        it('valid', function() {
            assertValid(en, V.lessThan(1), 0);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be less than 0', V.lessThan(0), 0);
            assertInvalid(en, 'Must be less than 0', V.lessThan(0), 1);
            assertInvalid(en, 'Must be less than 0', V.lessThan(0), null);
            assertInvalid(en, 'Must be less than 0', V.lessThan(0), undefined);
        });
    });

    describe('atMost', function() {
        it('valid', function() {
            assertValid(en, V.atMost(1), 0);
            assertValid(en, V.atMost(1), 1);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be at most 0', V.atMost(0), 1);
            assertInvalid(en, 'Must be at most 0', V.atMost(0), null);
            assertInvalid(en, 'Must be at most 0', V.atMost(0), undefined);
        });
    });

    describe('greaterThan', function() {
        it('valid', function() {
            assertValid(en, V.greaterThan(0), 1);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be greater than 1', V.greaterThan(1), 1);
            assertInvalid(en, 'Must be greater than 1', V.greaterThan(1), 0);
            assertInvalid(en, 'Must be greater than 1', V.greaterThan(1), null);
            assertInvalid(
                en, 'Must be greater than 1', V.greaterThan(1), undefined);
        });
    });

    describe('atLeast', function() {
        it('valid', function() {
            assertValid(en, V.atLeast(1), 1);
            assertValid(en, V.atLeast(1), 1);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be at least 1', V.atLeast(1), 0);
            assertInvalid(en, 'Must be at least 1', V.atLeast(1), null);
            assertInvalid(en, 'Must be at least 1', V.atLeast(1), undefined);
        });
    });

    describe('between', function() {
        it('valid', function() {
            assertValid(en, V.between(1, 3), 1);
            assertValid(en, V.between(1, 3), 2);
            assertValid(en, V.between(1, 3), 3);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be between 1 and 3', V.between(1, 3), 0);
            assertInvalid(en, 'Must be between 1 and 3', V.between(1, 3), 4);
            assertInvalid(en, 'Must be between 1 and 3', V.between(1, 3), null);
            assertInvalid(
                en, 'Must be between 1 and 3', V.between(1, 3), undefined);
        });
    });

    describe('empty', function() {
        it('valid', function() {
            assertValid(en, V.empty(), '');
            assertValid(en, V.empty(), []);
            assertValid(en, V.empty(), null);
            assertValid(en, V.empty(), undefined);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be empty not "0"', V.empty(), 0);
            assertInvalid(en, 'Must be empty not "arst"', V.empty(), 'arst');
            assertInvalid(en, 'Must be empty not "[object Object]"', V.empty(), {});
        });
    });

    describe('notEmpty', function() {
        it('valid', function() {
            assertValid(en, V.notEmpty(), 'arst');
            assertValid(en, V.notEmpty(), ['arst']);
        });

        it('invalid', function() {
            assertInvalid(en, 'Cannot be empty', V.notEmpty(), 0);
            assertInvalid(en, 'Cannot be empty', V.notEmpty(), null);
            assertInvalid(en, 'Cannot be empty', V.notEmpty(), undefined);
            assertInvalid(en, 'Cannot be empty', V.notEmpty(), '');
            assertInvalid(en, 'Cannot be empty', V.notEmpty(), []);
            assertInvalid(en, 'Cannot be empty', V.notEmpty(), {});
        });
    });

    describe('notNull', function() {
        it('valid', function() {
            assertValid(en, V.notNull(), 0);
            assertValid(en, V.notNull(), '');
            assertValid(en, V.notNull(), 'arst');
            assertValid(en, V.notNull(), []);
            assertValid(en, V.notNull(), ['arst']);
            assertValid(en, V.notNull(), {});
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be provided', V.notNull(), null);
            //assertInvalid(en, 'Must be provided', V.notNull(), undefined);
        });
    });

    describe('lengthOf', function() {
        it('valid', function() {
            assertValid(en, V.lengthOf(0), '');
            assertValid(en, V.lengthOf(0), []);
            assertValid(en, V.lengthOf(1), 'a');
            assertValid(en, V.lengthOf(1), ['a']);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be exactly 0 characters long',
                          V.lengthOf(0), null);
            assertInvalid(en, 'Must be exactly 0 characters long',
                          V.lengthOf(0), undefined);
            assertInvalid(en, 'Must be exactly 0 characters long',
                          V.lengthOf(0), {});
            assertInvalid(en, 'Must be exactly 0 characters long',
                          V.lengthOf(0), 'a');
        });

        it('singular', function() {
            assertInvalid(en, 'Must be exactly 1 character long',
                          V.lengthOf(1), '');
        });

        it('plural', function() {
            assertInvalid(en, 'Must be exactly 0 characters long',
                          V.lengthOf(0), 'a');
            assertInvalid(en, 'Must be exactly 3 characters long',
                          V.lengthOf(3), 'a');
        });
    });

    describe('lengthAtMost', function() {
        it('valid', function() {
            assertValid(en, V.lengthAtMost(1), '');
            assertValid(en, V.lengthAtMost(1), []);
            assertValid(en, V.lengthAtMost(1), 'a');
            assertValid(en, V.lengthAtMost(1), ['a']);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be at most 2 characters long',
                          V.lengthAtMost(2), null);
            assertInvalid(en, 'Must be at most 2 characters long',
                          V.lengthAtMost(2), undefined);
            assertInvalid(en, 'Must be at most 2 characters long',
                          V.lengthAtMost(2), {});
            assertInvalid(en, 'Must be at most 2 characters long',
                          V.lengthAtMost(2), 'aaa');
        });

        it('singular', function() {
            assertInvalid(en, 'Must be at most 1 character long',
                          V.lengthAtMost(1), 'aa');
        });

        it('plural', function() {
            assertInvalid(en, 'Must be at most 0 characters long',
                          V.lengthAtMost(0), 'a');
            assertInvalid(en, 'Must be at most 3 characters long',
                          V.lengthAtMost(3), 'aaaa');
        });
    });

    describe('lengthAtLeast', function() {
        it('valid', function() {
            assertValid(en, V.lengthAtLeast(1), 'a');
            assertValid(en, V.lengthAtLeast(1), ['a']);
            assertValid(en, V.lengthAtLeast(1), 'aa');
            assertValid(en, V.lengthAtLeast(1), ['aa']);
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be at least 2 characters long',
                          V.lengthAtLeast(2), null);
            assertInvalid(en, 'Must be at least 2 characters long',
                          V.lengthAtLeast(2), undefined);
            assertInvalid(en, 'Must be at least 2 characters long',
                          V.lengthAtLeast(2), {});
            assertInvalid(en, 'Must be at least 2 characters long',
                          V.lengthAtLeast(2), '');
        });

        it('singular', function() {
            assertInvalid(en, 'Must be at least 1 character long',
                          V.lengthAtLeast(1), '');
        });

        it('plural', function() {
            assertInvalid(en, 'Must be at least 3 characters long',
                          V.lengthAtLeast(3), '');
        });
    });

    describe('oneOf', function() {
        it('valid', function() {
            assertValid(en, V.oneOf(['a', 'b']), 'a');
            assertValid(en, V.oneOf(['a', 'b']), 'b');
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be one of: a,b',
                          V.oneOf(['a', 'b']), null);
            assertInvalid(en, 'Must be one of: a,b',
                          V.oneOf(['a', 'b']), undefined);
            assertInvalid(en, 'Must be one of: 1,b',
                          V.oneOf(['1', 'b']), 1);
            assertInvalid(en, 'Must be one of: a,b',
                          V.oneOf(['a', 'b']), 'c');
        });
    });

    describe('numeric', function() {
        it('valid', function() {
            assertValid(en, V.numeric(), 0);
            assertValid(en, V.numeric(), 1);
            assertValid(en, V.numeric(), '1');
            assertValid(en, V.numeric(), '');
        });

        it('invalid', function() {
            assertInvalid(en, 'Must be a number', V.numeric(), null);
            assertInvalid(en, 'Must be a number', V.numeric(), undefined);
            assertInvalid(en, 'Must be a number', V.numeric(), []);
            assertInvalid(en, 'Must be a number', V.numeric(), {});;
            assertInvalid(en, 'Must be a number', V.numeric(), 'a');
        });
    });
});
