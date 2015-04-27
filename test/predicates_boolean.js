import {assert} from "chai";
import * as PB from "../src/predicates/boolean";


describe('Boolean predicates', function() {
    describe('truthy', function() {
        it('zero', function() {
            assert.isFalse(PB.truthy()(0));
        });

        it('non-zero', function() {
            assert.isTrue(PB.truthy()(1));
        });

        it('null', function() {
            assert.isFalse(PB.truthy()(null));
        });

        it('undefined', function() {
            assert.isFalse(PB.truthy()(undefined));
        });

        it('true', function() {
            assert.isTrue(PB.truthy()(true));
        });

        it('false', function() {
            assert.isFalse(PB.truthy()(false));
        });

        it('empty object', function() {
            assert.isTrue(PB.truthy()({}));
        });

        it('object', function() {
            assert.isTrue(PB.truthy()({'a': 1}));
        });

        it('empty array', function() {
            assert.isTrue(PB.truthy()([]));
        });

        it('array', function() {
            assert.isTrue(PB.truthy()([1]));
        });
    });

    describe('falsy', function() {
        it('zero', function() {
            assert.isTrue(PB.falsy()(0));
        });

        it('non-zero', function() {
            assert.isFalse(PB.falsy()(1));
        });

        it('null', function() {
            assert.isTrue(PB.falsy()(null));
        });

        it('undefined', function() {
            assert.isTrue(PB.falsy()(undefined));
        });

        it('true', function() {
            assert.isFalse(PB.falsy()(true));
        });

        it('false', function() {
            assert.isTrue(PB.falsy()(false));
        });

        it('empty object', function() {
            assert.isFalse(PB.falsy()({}));
        });

        it('object', function() {
            assert.isFalse(PB.falsy()({'a': 1}));
        });

        it('empty array', function() {
            assert.isFalse(PB.falsy()([]));
        });

        it('array', function() {
            assert.isFalse(PB.falsy()([1]));
        });
    });

    describe('equal', function() {
        it('null = undefined', function() {
            assert.isFalse(PB.equal(null)(undefined));
        });

        it('"42" = 42', function() {
            assert.isFalse(PB.equal("42")(42));
        });
    });

    describe('notEqual', function() {
        it('null = undefined', function() {
            assert.isTrue(PB.notEqual(null)(undefined));
        });

        it('"42" = 42', function() {
            assert.isTrue(PB.notEqual("42")(42));
        });
    });

    describe('lessThan', function() {
        it('valid', function() {
            assert.isTrue(PB.lessThan(10)(9));
        });

        it('invalid', function() {
            assert.isFalse(PB.lessThan(10)(10));
        });
    });

    describe('atMost', function() {
        it('valid', function() {
            assert.isTrue(PB.atMost(10)(9));
            assert.isTrue(PB.atMost(10)(10));
        });

        it('invalid', function() {
            assert.isFalse(PB.atMost(10)(11));
        });
    });

    describe('greaterThan', function() {
        it('valid', function() {
            assert.isTrue(PB.greaterThan(10)(11));
        });

        it('invalid', function() {
            assert.isFalse(PB.greaterThan(10)(10));
        });
    });

    describe('atLeast', function() {
        it('valid', function() {
            assert.isTrue(PB.atLeast(10)(10));
            assert.isTrue(PB.atLeast(10)(11));
        });

        it('invalid', function() {
            assert.isFalse(PB.atLeast(10)(9));
        });
    });

    describe('between', function() {
        it('valid', function() {
            assert.isTrue(PB.between(1, 3)(1));
            assert.isTrue(PB.between(1, 3)(2));
            assert.isTrue(PB.between(1, 3)(3));
        });

        it('invalid', function() {
            assert.isFalse(PB.between(1, 3)(0));
            assert.isFalse(PB.between(1, 3)(4));
        });
    });

    describe('notNull', function() {
        it('null', function() {
            assert.isFalse(PB.notNull()(null));
        });

        it('undefined', function() {
            assert.isTrue(PB.notNull()(undefined));
        });

        it('empty string', function() {
            assert.isTrue(PB.notNull()(""));
        });

        it('string', function() {
            assert.isTrue(PB.notNull()("hello"));
        });
    });

    describe('empty', function() {
        it('null', function() {
            assert.isTrue(PB.empty()(null));
        });

        it('undefined', function() {
            assert.isTrue(PB.empty()(undefined));
        });

        it('zero', function() {
            assert.isFalse(PB.empty()(0));
        });

        it('non-zero', function() {
            assert.isFalse(PB.empty()(1));
        });

        it('empty string', function() {
            assert.isTrue(PB.empty()(""));
        });

        it('string', function() {
            assert.isFalse(PB.empty()("hello"));
        });

        it('empty array', function() {
            assert.isTrue(PB.empty()([]));
        });

        it('array', function() {
            assert.isFalse(PB.empty()([1]));
            assert.isFalse(PB.empty()([[]]));
        });

        it('empty object', function() {
            assert.isFalse(PB.empty()({}));
        });

        it('object', function() {
            assert.isFalse(PB.empty()({'a': 42}));
        });

        it('cheating object', function() {
            // Maybe this shouldn't be true? Use `hasOwnProperty`?
            assert.isTrue(PB.empty()({'length': 0}));
            assert.isFalse(PB.empty()({'length': 42}));
        });
    });

    describe('notEmpty', function() {
        it('null', function() {
            assert.isFalse(PB.notEmpty()(null));
        });

        it('undefined', function() {
            assert.isFalse(PB.notEmpty()(undefined));
        });

        it('zero', function() {
            assert.isFalse(PB.notEmpty()(0));
        });

        it('non-zero', function() {
            assert.isFalse(PB.notEmpty()(1));
        });

        it('empty string', function() {
            assert.isFalse(PB.notEmpty()(""));
        });

        it('string', function() {
            assert.isTrue(PB.notEmpty()("hello"));
        });

        it('empty array', function() {
            assert.isFalse(PB.notEmpty()([]));
        });

        it('array', function() {
            assert.isTrue(PB.notEmpty()([1]));
            assert.isTrue(PB.notEmpty()([[]]));
        });

        it('empty object', function() {
            assert.isFalse(PB.notEmpty()({}));
        });

        it('object', function() {
            assert.isFalse(PB.notEmpty()({'a': 42}));
        });

        it('cheating object', function() {
            // Maybe this shouldn't be true? Use `hasOwnProperty`?
            assert.isFalse(PB.notEmpty()({'length': 0}));
            assert.isTrue(PB.notEmpty()({'length': 42}));
        });
    });

    describe('lengthOf', function() {
        it('null', function() {
            assert.isFalse(PB.lengthOf(2)(null));
        });

        it('undefined', function() {
            assert.isFalse(PB.lengthOf(2)(undefined));
        });

        it('zero', function() {
            assert.isFalse(PB.lengthOf(2)(0));
        });

        it('non-zero', function() {
            assert.isFalse(PB.lengthOf(2)(1));
        });

        it('string', function() {
            assert.isTrue(PB.lengthOf(0)(""));
            assert.isTrue(PB.lengthOf(5)("hello"));
        });

        it('array', function() {
            assert.isTrue(PB.lengthOf(0)([]));
            assert.isTrue(PB.lengthOf(5)([1, 2, 3, 4, 5]));
            assert.isTrue(PB.lengthOf(1)([[]]));
        });

        it('object', function() {
            assert.isFalse(PB.lengthOf(0)({}));
            assert.isFalse(PB.lengthOf(1)({'a': 42}));
        });

        it('cheating object', function() {
            // Maybe this shouldn't be true? Use `hasOwnProperty`?
            assert.isTrue(PB.lengthOf(0)({'length': 0}));
            assert.isTrue(PB.lengthOf(42)({'length': 42}));
        });
    });

    describe('lengthAtLeast', function() {
        it('valid', function() {
            assert.isTrue(PB.lengthAtLeast(2)('aa'));
            assert.isTrue(PB.lengthAtLeast(2)('aaa'));
        });

        it('invalid', function() {
            assert.isFalse(PB.lengthAtLeast(2)('a'));
        });
    });

    describe('lengthAtMost', function() {
        it('valid', function() {
            assert.isTrue(PB.lengthAtMost(2)('a'));
            assert.isTrue(PB.lengthAtMost(2)('aa'));
        });

        it('invalid', function() {
            assert.isFalse(PB.lengthAtMost(2)('aaa'));
        });
    });

    describe('elementOf', function() {
        it('valid', function() {
            assert.isTrue(PB.elementOf(['a', 'b'])('a'));
            assert.isTrue(PB.elementOf(['a', 'b'])('b'));
        });

        it('invalid', function() {
            assert.isFalse(PB.elementOf(['a', 'b'])(null));
            assert.isFalse(PB.elementOf(['a', 'b'])(undefined));
            assert.isFalse(PB.elementOf(['a', 'b'])('c'));
            assert.isFalse(PB.elementOf(['1', 'b'])(1));
        });
    });

    describe('regexp', function() {
        it('valid', function() {
            assert.isTrue(PB.regexp(/[a-z]/)('a'));
            assert.isTrue(PB.regexp(/[a-z]/i)('A'));
            assert.isTrue(PB.regexp('[a-z]')('a'));
            assert.isTrue(PB.regexp('[a-z]', 'i')('A'));
        });

        it('invalid', function() {
            assert.isFalse(PB.regexp(/[a-z]/)('1'));
            assert.isFalse(PB.regexp('[a-z]')('1'));
            assert.isFalse(PB.regexp(/[a-z]/)('A'));
            assert.isFalse(PB.regexp('[a-z]')('A'));
        });
    });

    describe('typeOf', function() {
        it('valid', function() {
            assert.isTrue(PB.typeOf('string')('a'));
            assert.isTrue(PB.typeOf('string', 'number')(1));
        });

        it('invalid', function() {
            assert.isFalse(PB.typeOf('string')(null));
            assert.isFalse(PB.typeOf('string')(1));
            assert.isFalse(PB.typeOf('string', 'number')(undefined));
        });
    });

    describe('and', function() {
        it('valid', function() {
            assert.isTrue(PB.and(PB.typeOf('string'))('a'));
            assert.isTrue(
                PB.and(PB.typeOf('string'),
                       PB.lengthOf(2))('aa'));
        });

        it('invalid', function() {
            assert.isFalse(PB.and(PB.typeOf('string'))(1));
            assert.isFalse(
                PB.and(PB.typeOf('string'),
                       PB.lengthOf(2))(['a', 'a']));
        });
    });

    describe('or', function() {
        it('valid', function() {
            assert.isTrue(PB.or(PB.typeOf('string'))('a'));
            assert.isTrue(
                PB.or(PB.typeOf('string'),
                      PB.lengthOf(2))('a'));
        });

        it('invalid', function() {
            assert.isFalse(PB.or(PB.typeOf('string'))(1));
            assert.isFalse(
                PB.or(PB.typeOf('turnip'),
                      PB.lengthOf(2))(['a']));
        });
    });
});
