import {List, Set} from "immutable";
import {attrgetter, compose} from "../util";


/*
export function complement(f, ...partial) {
    return (...rest) => {
        return !f(...partial, ...rest);
    };
};
*/


/** Value is truthy. */
export function truthy() {
    return v => !!v;
}


/** Value is falsy. */
export function falsy() {
    return v => !v;
}


/** Equal to a value specified later. */
export function equal(expected) {
    return v => expected === v;
}


/** Not equal to a value specified later. */
export function notEqual(expected) {
    return v => expected !== v;
}


/** Less than a value specified later. */
export function lessThan(expected) {
    return v => v < expected;
}


/** Less than or equal to a value specified later. */
export function atMost(expected) {
    return v => v !== null && v <= expected;
}


/** Greater than a value specified later. */
export function greaterThan(expected) {
    return v => v > expected;
}


/** Greater than or equal to a value specified later. */
export function atLeast(expected) {
    return v => v !== null && v >= expected;
}


/** Between `a` and `b`, inclusively. */
export function between(a, b) {
    return v => v >= a && v <= b;
}


/** Either `null`, `undefined` or has a `length` value of `0`. */
export function empty() {
    return v => v === null || v === undefined || v.length === 0;
}


/** Not `null` or `undefined` and has a non-zero `length` value. */
export function notEmpty() {
    return v => v !== null && v !== undefined && v.length > 0;
}


/** Not `null`. */
export let notNull = () => notEqual(null);

/** Length is exactly `n`. */
export let lengthOf = (n) => compose(equal(n), attrgetter('length'));

/** Length is at least `n`. */
export let lengthAtLeast = (n) => compose(atLeast(n), attrgetter('length'));

/** Length is at most `n`. */
export let lengthAtMost = (n) => compose(atMost(n), attrgetter('length'));


/** Is a value in a given set? */
export function elementOf(expected) {
    expected = Set(expected);
    return v => expected.contains(v);
}


/** Is the value's type one of the specified type names? */
export function typeOf(...typeNames) {
    let test = elementOf(typeNames);
    return v => test(typeof v);
}


/** Combine several boolean predicates using logical AND. */
export function and(...fs) {
    return v => fs.every(x => x(v));
}


/** Combine several boolean predicates using logican OR. */
export function or(...fs) {
    return v => fs.some(x => x(v));
}


/** Does the value match a regular expression? */
export function regexp(pattern, flags) {
    let re = new RegExp(pattern, flags);
    return v => typeOf('string', 'number')(v) && re.test(v);
}
