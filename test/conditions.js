import {assert} from "chai";
//import {List, Map} from "immutable";
import * as cond from "../src/conditions";



describe('Conditions', function() {
    describe('truthy', function() {
        it('zero', function() {
            assert.isFalse(cond.truthy(0));
        });

        it('non-zero', function() {
            assert.isTrue(cond.truthy(1));
        });

        it('null', function() {
            assert.isFalse(cond.truthy(null));
        });

        it('undefined', function() {
            assert.isFalse(cond.truthy(undefined));
        });

        it('true', function() {
            assert.isTrue(cond.truthy(true));
        });

        it('false', function() {
            assert.isFalse(cond.truthy(false));
        });

        it('empty object', function() {
            assert.isTrue(cond.truthy({}));
        });

        it('object', function() {
            assert.isTrue(cond.truthy({'a': 1}));
        });

        it('empty array', function() {
            assert.isTrue(cond.truthy([]));
        });

        it('array', function() {
            assert.isTrue(cond.truthy([1]));
        });
    });

    describe('falsy', function() {
        it('zero', function() {
            assert.isTrue(cond.falsy(0));
        });

        it('non-zero', function() {
            assert.isFalse(cond.falsy(1));
        });

        it('null', function() {
            assert.isTrue(cond.falsy(null));
        });

        it('undefined', function() {
            assert.isTrue(cond.falsy(undefined));
        });

        it('true', function() {
            assert.isFalse(cond.falsy(true));
        });

        it('false', function() {
            assert.isTrue(cond.falsy(false));
        });

        it('empty object', function() {
            assert.isFalse(cond.falsy({}));
        });

        it('object', function() {
            assert.isFalse(cond.falsy({'a': 1}));
        });

        it('empty array', function() {
            assert.isFalse(cond.falsy([]));
        });

        it('array', function() {
            assert.isFalse(cond.falsy([1]));
        });
    });

    describe('equal', function() {
        it('null = undefined', function() {
            assert.isFalse(cond.equal(null)(undefined));
        });

        it('"42" = 42', function() {
            assert.isFalse(cond.equal("42")(42));
        });
    });

    describe('notEqual', function() {
        it('null = undefined', function() {
            assert.isTrue(cond.notEqual(null)(undefined));
        });

        it('"42" = 42', function() {
            assert.isTrue(cond.notEqual("42")(42));
        });
    });

    describe('lessThan', function() {
        it('valid', function() {
            assert.isTrue(cond.lessThan(10)(9));
        });

        it('invalid', function() {
            assert.isFalse(cond.lessThan(10)(10));
        });
    });

    describe('atMost', function() {
        it('valid', function() {
            assert.isTrue(cond.atMost(10)(9));
            assert.isTrue(cond.atMost(10)(10));
        });

        it('invalid', function() {
            assert.isFalse(cond.atMost(10)(11));
        });
    });

    describe('greaterThan', function() {
        it('valid', function() {
            assert.isTrue(cond.greaterThan(10)(11));
        });

        it('invalid', function() {
            assert.isFalse(cond.greaterThan(10)(10));
        });
    });

    describe('atLeast', function() {
        it('valid', function() {
            assert.isTrue(cond.atLeast(10)(10));
            assert.isTrue(cond.atLeast(10)(11));
        });

        it('invalid', function() {
            assert.isFalse(cond.atLeast(10)(9));
        });
    });

    describe('between', function() {
        it('valid', function() {
            assert.isTrue(cond.between(1, 3)(1));
            assert.isTrue(cond.between(1, 3)(2));
            assert.isTrue(cond.between(1, 3)(3));
        });

        it('invalid', function() {
            assert.isFalse(cond.between(1, 3)(0));
            assert.isFalse(cond.between(1, 3)(4));
        });
    });

    describe('notNull', function() {
        it('null', function() {
            assert.isFalse(cond.notNull()(null));
        });

        it('undefined', function() {
            assert.isTrue(cond.notNull()(undefined));
        });

        it('empty string', function() {
            assert.isTrue(cond.notNull()(""));
        });

        it('string', function() {
            assert.isTrue(cond.notNull()("hello"));
        });
    });

    describe('empty', function() {
        it('null', function() {
            assert.isTrue(cond.empty()(null));
        });

        it('undefined', function() {
            assert.isTrue(cond.empty()(undefined));
        });

        it('zero', function() {
            assert.isFalse(cond.empty()(0));
        });

        it('non-zero', function() {
            assert.isFalse(cond.empty()(1));
        });

        it('empty string', function() {
            assert.isTrue(cond.empty()(""));
        });

        it('string', function() {
            assert.isFalse(cond.empty()("hello"));
        });

        it('empty array', function() {
            assert.isTrue(cond.empty()([]));
        });

        it('array', function() {
            assert.isFalse(cond.empty()([1]));
            assert.isFalse(cond.empty()([[]]));
        });

        it('empty object', function() {
            assert.isFalse(cond.empty()({}));
        });

        it('object', function() {
            assert.isFalse(cond.empty()({'a': 42}));
        });

        it('cheating object', function() {
            // Maybe this shouldn't be true? Use `hasOwnProperty`?
            assert.isTrue(cond.empty()({'length': 0}));
            assert.isFalse(cond.empty()({'length': 42}));
        });
    });

    describe('notEmpty', function() {
        it('null', function() {
            assert.isFalse(cond.notEmpty()(null));
        });

        it('undefined', function() {
            assert.isFalse(cond.notEmpty()(undefined));
        });

        it('zero', function() {
            assert.isFalse(cond.notEmpty()(0));
        });

        it('non-zero', function() {
            assert.isFalse(cond.notEmpty()(1));
        });

        it('empty string', function() {
            assert.isFalse(cond.notEmpty()(""));
        });

        it('string', function() {
            assert.isTrue(cond.notEmpty()("hello"));
        });

        it('empty array', function() {
            assert.isFalse(cond.notEmpty()([]));
        });

        it('array', function() {
            assert.isTrue(cond.notEmpty()([1]));
            assert.isTrue(cond.notEmpty()([[]]));
        });

        it('empty object', function() {
            assert.isFalse(cond.notEmpty()({}));
        });

        it('object', function() {
            assert.isFalse(cond.notEmpty()({'a': 42}));
        });

        it('cheating object', function() {
            // Maybe this shouldn't be true? Use `hasOwnProperty`?
            assert.isFalse(cond.notEmpty()({'length': 0}));
            assert.isTrue(cond.notEmpty()({'length': 42}));
        });
    });

    describe('lengthOf', function() {
        it('null', function() {
            assert.isFalse(cond.lengthOf(2)(null));
        });

        it('undefined', function() {
            assert.isFalse(cond.lengthOf(2)(undefined));
        });

        it('zero', function() {
            assert.isFalse(cond.lengthOf(2)(0));
        });

        it('non-zero', function() {
            assert.isFalse(cond.lengthOf(2)(1));
        });

        it('string', function() {
            assert.isTrue(cond.lengthOf(0)(""));
            assert.isTrue(cond.lengthOf(5)("hello"));
        });

        it('array', function() {
            assert.isTrue(cond.lengthOf(0)([]));
            assert.isTrue(cond.lengthOf(5)([1, 2, 3, 4, 5]));
            assert.isTrue(cond.lengthOf(1)([[]]));
        });

        it('object', function() {
            assert.isFalse(cond.lengthOf(0)({}));
            assert.isFalse(cond.lengthOf(1)({'a': 42}));
        });

        it('cheating object', function() {
            // Maybe this shouldn't be true? Use `hasOwnProperty`?
            assert.isTrue(cond.lengthOf(0)({'length': 0}));
            assert.isTrue(cond.lengthOf(42)({'length': 42}));
        });
    });

    describe('lengthAtLeast', function() {
        it('valid', function() {
            assert.isTrue(cond.lengthAtLeast(2)('aa'));
            assert.isTrue(cond.lengthAtLeast(2)('aaa'));
        });

        it('invalid', function() {
            assert.isFalse(cond.lengthAtLeast(2)('a'));
        });
    });

    describe('lengthAtMost', function() {
        it('valid', function() {
            assert.isTrue(cond.lengthAtMost(2)('a'));
            assert.isTrue(cond.lengthAtMost(2)('aa'));
        });

        it('invalid', function() {
            assert.isFalse(cond.lengthAtMost(2)('aaa'));
        });
    });

    describe('oneOf', function() {
        it('valid', function() {
            assert.isTrue(cond.oneOf(['a', 'b'])('a'));
            assert.isTrue(cond.oneOf(['a', 'b'])('b'));
        });

        it('invalid', function() {
            assert.isFalse(cond.oneOf(['a', 'b'])(null));
            assert.isFalse(cond.oneOf(['a', 'b'])(undefined));
            assert.isFalse(cond.oneOf(['a', 'b'])('c'));
            assert.isFalse(cond.oneOf(['1', 'b'])(1));
        });
    });

    describe('regex', function() {
        it('valid', function() {
            assert.isTrue(cond.regex(/[a-z]/)('a'));
        });

        it('invalid', function() {
            assert.isFalse(cond.regex(/[a-z]/)('1'));
        });
    });

    describe('typeOf', function() {
        it('valid', function() {
            assert.isTrue(cond.typeOf('string')('a'));
            assert.isTrue(cond.typeOf('string', 'number')(1));
        });

        it('invalid', function() {
            assert.isFalse(cond.typeOf('string')(null));
            assert.isFalse(cond.typeOf('string')(1));
            assert.isFalse(cond.typeOf('string', 'number')(undefined));
        });
    });

    describe('combine', function() {
        it('valid', function() {
            assert.isTrue(cond.combine(cond.typeOf('string'))('a'));
            assert.isTrue(
                cond.combine(cond.typeOf('string'),
                             cond.lengthOf(2))('aa'));
        });

        it('invalid', function() {
            assert.isFalse(cond.combine(cond.typeOf('string'))(1));
            assert.isFalse(
                cond.combine(cond.typeOf('string'),
                             cond.lengthOf(2))(['a', 'a']));
        });
    });
});
