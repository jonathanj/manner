import {assert} from 'chai';
import {List, Map} from 'immutable';
import en from '../src/i18n/en';
import {Status} from '../src/predicates';
import * as P from '../src/predicates';
import {maybe} from '../src/promises';
import {assertStatuses} from './support/asserts';


function assertValidBoundPredicate(i18n, bp, values) {
    return bp.validate(values).then(result => {
        assertStatuses(en, result, Map());
    });
}


function assertInvalidBoundPredicate(i18n, bp, values, expected) {
    return bp.validate(values).then(result => {
        assertStatuses(en, result, expected);
    });
}


function assertValid(i18n, f, ...rest) {
    return maybe(f, ...rest).then(result => {
        assert.isTrue(
            Status.is(result, Status.VALID),
            `Expected valid result, found: ${result.message(i18n)}`);
    });
}


function assertAllValid(i18n, xs) {
    return Promise.all(xs.map(args => assertValid(i18n, ...args)));
}


function assertInvalid(i18n, message, f, ...rest) {
    return maybe(f, ...rest).then(result => {
        assert.isTrue(
            Status.is(result, Status.INVALID), 'Expected invalid result');
        assert.deepEqual(result.message(i18n), message);
    });
}


function assertAllInvalid(i18n, xs) {
    return Promise.all(xs.map(args => assertInvalid(i18n, ...args)));
}


describe('Predicate combinators', function() {
    beforeEach(function() {
        this.values = Map({'a': 42, 'b': 21});
    }),

    describe('is', function() {
        it('produces a predicate naming a single field', function() {
            assert.deepEqual(
                P.is('a', null).fieldNames,
                List(['a']));
        });

        it('valid', function() {
            return assertValidBoundPredicate(
                en,
                P.is('a', P.equal(42)),
                this.values);
        });

        it('invalid', function() {
            return assertInvalidBoundPredicate(
                en,
                P.is('a', P.equal(21)),
                this.values,
                Map({'a': Status.invalid('Must be "21"')}));
        });
    });

    describe('are', function() {
        before(function() {
            this.sumIs = value =>
                (...ns) => P.equal(value)(ns.reduce((a, b) => a + b));
        }),

        it('produces a predicate naming multiple ordered fields', function() {
            assert.deepEqual(
                P.are(['a', 'b'], null).fieldNames,
                List(['a', 'b']));
        });

        it('valid', function() {
            return assertValidBoundPredicate(
                en,
                P.are(['a', 'b'], this.sumIs(63)),
                this.values);
        });

        it('invalid', function() {
            return assertInvalidBoundPredicate(
                en,
                P.are(['a', 'b'], this.sumIs(99)),
                this.values,
                Map({'a': Status.invalid('Must be "99"'),
                     'b': Status.invalid('Must be "99"')}));
        });
    });

    describe('any', function() {
        it('produces an ordered compound predicate', function() {
            assert.deepEqual(
                P.any(P.is('a', null),
                      P.is('b', null)).fieldNames,
                List(['a', 'b']));
        });

        it('valid', function() {
            return assertValidBoundPredicate(
                en,
                P.any(P.is('a', P.equal(42)),
                      P.is('b', P.equal('nope'))),
                this.values);
        });

        it('invalid', function() {
            return assertInvalidBoundPredicate(
                en,
                P.any(P.is('a', P.equal('nah')),
                      P.is('b', P.equal('nope'))),
                this.values,
                Map({'a': Status.invalid('Must be "nah"'),
                     'b': Status.invalid('Must be "nope"')}));
        });
    });
});


describe('Validator functions', function() {
    describe('message', function() {
        it('valid', function() {
            let msg = (i18n, args, rest) => {
                assert.fail('This should not be called');
            };
            return assertAllValid(
                en,
                [[P.message(msg, P.equal, 0)(), 0],
                 [P.message(msg, P.equal)(0), 0]]);
        });
        it('invalid with custom message function', function() {
            let msg = (i18n, args, rest) => {
                assert.isObject(i18n);
                assert.deepEqual(args, [0]);
                assert.deepEqual(rest, [1]);
                return 'Nope';
            };
            return assertAllInvalid(
                en,
                [['Nope', P.message(msg, P.equal, 0)(), 1],
                 ['Nope', P.message(msg, P.equal)(0), 1]]);
        });
        it('invalid with custom plain message', function() {
            return assertAllInvalid(
                en,
                [['Nope', P.message('Nope', P.equal, 0)(), 1],
                 ['Nope', P.message('Nope', P.equal)(0), 1]]);
        });
    });

    describe('combine', function() {
        it('report the first failing validator', function() {
            return assertInvalid(
                en,
                'Must be "21"',
                P.combine(P.equalTo(42),
                          P.onceEvery(10, P.equalTo(21))),
                42);
        });

        it('return VALID if success', function() {
            return assertValid(
                en,
                P.combine(P.equalTo(42)),
                42);
        });
    });

    describe('checked', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.checked(), true]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be checked', P.checked(), false],
                 ['Must be checked', P.checked(), 0],
                 ['Must be checked', P.checked(), ''],
                 ['Must be checked', P.checked(), null]]);
        });
    });

    describe('unchecked', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.unchecked(), false]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must not be checked', P.unchecked(), true],
                 ['Must not be checked', P.unchecked(), 0],
                 ['Must not be checked', P.unchecked(), ''],
                 ['Must not be checked', P.unchecked(), null]]);
        });
    });

    describe('equal', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.equal(0), 0],
                 [P.equalTo(0), 0]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be "0"', P.equal(0), 1],
                 ['Must be "0"', P.equalTo(0), 1]]);
        });
    });

    describe('notEqual', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.notEqual(0), 1],
                 [P.notEqual(0), null],
                 [P.notEqual(0), undefined]]);
        });

        it('invalid', function() {
            return assertInvalid(en, 'Must not be "0"', P.notEqual(0), 0);
        });
    });

    describe('lessThan', function() {
        it('valid', function() {
            return assertValid(en, P.lessThan(1), 0);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be less than 0', P.lessThan(0), 0],
                 ['Must be less than 0', P.lessThan(0), 1],
                 ['Must be less than 0', P.lessThan(0), null],
                 ['Must be less than 0', P.lessThan(0), undefined]]);
        });
    });

    describe('atMost', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.atMost(1), 0],
                 [P.atMost(1), 1]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be at most 0', P.atMost(0), 1],
                 ['Must be at most 0', P.atMost(0), null],
                 ['Must be at most 0', P.atMost(0), undefined]]);
        });
    });

    describe('greaterThan', function() {
        it('valid', function() {
            return assertValid(en, P.greaterThan(0), 1);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be greater than 1', P.greaterThan(1), 1],
                 ['Must be greater than 1', P.greaterThan(1), 0],
                 ['Must be greater than 1', P.greaterThan(1), null],
                 ['Must be greater than 1', P.greaterThan(1), undefined]]);
        });
    });

    describe('atLeast', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.atLeast(1), 1],
                 [P.atLeast(1), 1]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be at least 1', P.atLeast(1), 0],
                 ['Must be at least 1', P.atLeast(1), null],
                 ['Must be at least 1', P.atLeast(1), undefined]]);
        });
    });

    describe('between', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.between(1, 3), 1],
                 [P.between(1, 3), 2],
                 [P.between(1, 3), 3]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be between 1 and 3', P.between(1, 3), 0],
                 ['Must be between 1 and 3', P.between(1, 3), 4],
                 ['Must be between 1 and 3', P.between(1, 3), null],
                 ['Must be between 1 and 3', P.between(1, 3), undefined]]);
        });
    });

    describe('empty', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.empty(), ''],
                 [P.empty(), []],
                 [P.empty(), null],
                 [P.empty(), undefined]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be empty not "0"', P.empty(), 0],
                 ['Must be empty not "arst"', P.empty(), 'arst'],
                 ['Must be empty not "[object Object]"', P.empty(), {}]]);
        });
    });

    describe('notEmpty', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.notEmpty(), 'arst'],
                 [P.notEmpty(), ['arst']]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Cannot be empty', P.notEmpty(), 0],
                 ['Cannot be empty', P.notEmpty(), null],
                 ['Cannot be empty', P.notEmpty(), undefined],
                 ['Cannot be empty', P.notEmpty(), ''],
                 ['Cannot be empty', P.notEmpty(), []],
                 ['Cannot be empty', P.notEmpty(), {}]]);
        });
    });

    describe('notNull', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.notNull(), 0],
                 [P.notNull(), ''],
                 [P.notNull(), 'arst'],
                 [P.notNull(), []],
                 [P.notNull(), ['arst']],
                 [P.notNull(), {}]]);
        });

        it('invalid', function() {
            return assertInvalid(en, 'Must be provided', P.notNull(), null);
            //assertInvalid(en, 'Must be provided', P.notNull(), undefined);
        });
    });

    describe('lengthOf', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.lengthOf(0), ''],
                 [P.lengthOf(0), []],
                 [P.lengthOf(1), 'a'],
                 [P.lengthOf(1), ['a']]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be exactly 0 characters long', P.lengthOf(0), null],
                 ['Must be exactly 0 characters long', P.lengthOf(0), undefined],
                 ['Must be exactly 0 characters long', P.lengthOf(0), {}],
                 ['Must be exactly 0 characters long', P.lengthOf(0), 'a']]);
        });

        it('singular', function() {
            return assertInvalid(en, 'Must be exactly 1 character long',
                                 P.lengthOf(1), '');
        });

        it('plural', function() {
            return assertAllInvalid(
                en,
                [['Must be exactly 0 characters long', P.lengthOf(0), 'a'],
                 ['Must be exactly 3 characters long', P.lengthOf(3), 'a']]);
        });
    });

    describe('lengthAtMost', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.lengthAtMost(1), ''],
                 [P.lengthAtMost(1), []],
                 [P.lengthAtMost(1), 'a'],
                 [P.lengthAtMost(1), ['a']]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be at most 2 characters long',
                  P.lengthAtMost(2), null],
                 ['Must be at most 2 characters long',
                  P.lengthAtMost(2), undefined],
                 ['Must be at most 2 characters long',
                  P.lengthAtMost(2), {}],
                 ['Must be at most 2 characters long',
                  P.lengthAtMost(2), 'aaa']]);
        });

        it('singular', function() {
            return assertInvalid(en, 'Must be at most 1 character long',
                                 P.lengthAtMost(1), 'aa');
        });

        it('plural', function() {
            return assertAllInvalid(
                en,
                [['Must be at most 0 characters long',
                  P.lengthAtMost(0), 'a'],
                 ['Must be at most 3 characters long',
                  P.lengthAtMost(3), 'aaaa']]);
        });
    });

    describe('lengthAtLeast', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.lengthAtLeast(1), 'a'],
                 [P.lengthAtLeast(1), ['a']],
                 [P.lengthAtLeast(1), 'aa'],
                 [P.lengthAtLeast(1), ['aa']]]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be at least 2 characters long',
                  P.lengthAtLeast(2), null],
                 ['Must be at least 2 characters long',
                  P.lengthAtLeast(2), undefined],
                 ['Must be at least 2 characters long',
                  P.lengthAtLeast(2), {}],
                 ['Must be at least 2 characters long',
                  P.lengthAtLeast(2), '']]);
        });

        it('singular', function() {
            return assertInvalid(en, 'Must be at least 1 character long',
                                 P.lengthAtLeast(1), '');
        });

        it('plural', function() {
            return assertInvalid(en, 'Must be at least 3 characters long',
                                 P.lengthAtLeast(3), '');
        });
    });

    describe('oneOf', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.oneOf(['a', 'b']), 'a'],
                 [P.oneOf(['a', 'b']), 'b']]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be one of: a,b', P.oneOf(['a', 'b']), null],
                 ['Must be one of: a,b', P.oneOf(['a', 'b']), undefined],
                 ['Must be one of: 1,b', P.oneOf(['1', 'b']), 1],
                 ['Must be one of: a,b', P.oneOf(['a', 'b']), 'c']]);
        });
    });

    describe('numeric', function() {
        it('valid', function() {
            return assertAllValid(
                en,
                [[P.numeric(), 0],
                 [P.numeric(), 1],
                 [P.numeric(), '1'],
                 [P.numeric(), '']]);
        });

        it('invalid', function() {
            return assertAllInvalid(
                en,
                [['Must be a number', P.numeric(), null],
                 ['Must be a number', P.numeric(), undefined],
                 ['Must be a number', P.numeric(), []],
                 ['Must be a number', P.numeric(), {}],
                 ['Must be a number', P.numeric(), 'a']]);
        });
    });
});
