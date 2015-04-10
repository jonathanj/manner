import {List, Set} from "immutable";
import {attrgetter, compose} from "./util";


export class Condition {
    constructor(fieldNames, pred, ...xxx) {
        this.fieldNames = List(fieldNames);
        this._pred = pred;
        // XXX: ...xxx???
    }
};


export function visibleWhen(fieldNames, pred, ...xxx) {
}

export function visibleUnless(fieldNames, pred, ...xxx) {
}

export function disabledWhen(fieldNames, pred, ...xxx) {
}

export function disabledUnless(fieldNames, pred, ...xxx) {
}


/*
export function complement(f, ...partial) {
    return (...rest) => {
        return !f(...partial, ...rest);
    };
};
*/


/** Value is truthy. */
export function truthy(value) {
    return !!value;
}


/** Value is falsy. */
export function falsy(value) {
    return !value;
}


/** Equal to a value specified later. */
export function equal(value) {
    return v => value === v;
}


/** Not equal to a value specified later. */
export function notEqual(value) {
    return v => value !== v;
}


/** Less than a value specified later. */
export function lessThan(value) {
    return v => v < value;
}


/** Less than or equal to a value specified later. */
export function atMost(value) {
    return v => v !== null && v <= value;
}


/** Greater than a value specified later. */
export function greaterThan(value) {
    return v => v > value;
}


/** Greater than or equal to a value specified later. */
export function atLeast(value) {
    return v => v !== null && v >= value;
}


/** Between, inclusively,`a` and `b`. */
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
export function oneOf(values) {
    values = Set(values);
    return v => values.contains(v);
}


export function regex(expn) {
    return v => expn.test(v);
}


export function typeOf(...typeNames) {
    let test = oneOf(typeNames);
    return v => test(typeof v);
}


export function combine(...fs) {
    return v => {
        for (let f of fs) {
            if (!f(v)) {
                return false;
            }
        }
        return true;
    };
}
