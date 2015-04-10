import {List, Map} from "immutable";
import * as C from "./conditions";
import {i18nMessage} from "./i18n";
import {partial} from "./util";
import {maybe, delay} from "./promises";
import Promise from "bluebird";
import uuid from "uuid";


export const VALID = null;


/**
 * Bound validator predicate.
 *
 * Bound in the sense that if `equalTo` is a validator predicate then `is`
 * binds a predicate to a field.
 *
 * @class
 */
export class BoundPredicate {
    /**
     * Construct a bound validator predicate.
     *
     * @param {string[]} fieldNames: Names of fields involved in the validation.
     * @param {Function} validate: Function taking a `Map` of field values and
     *   returning a `Map` of validation messages.
     */
    constructor(fieldNames, validate) {
        this.id = uuid.v4();
        // XXX: Check for duplicate fields?
        this.fieldNames = List(fieldNames);
        this._validate = validate;
    }

    /**
     * Validate field values.
     *
     * @param {Map<string, Any>} values: Field values.
     * @return {Map<string, Function>}: Map of field names to validation
     *   message functions.
     */
    validate(values) {
        return maybe(this._validate, values).then(Map);
        //return Map(this._validate(values));
    }
};


export class Validators {
    constructor(...validators) {
        this._validators = List(validators);
        this.fieldNames = List().concat(
            ...this._validators.map(v => v.fieldNames));
        this._pending = Map();
    }

    static resolveMessages(i18n, m) {
        return m.map(v => v(i18n));
    }

    _valuesForValidator(model, validator) {
        return Map(validator.fieldNames.map(name => [name, model.get(name)]));
    }

    validate(model) {
        return Promise.map(this._validators.toJS(), validator => {
            let oldp = this._pending.get(validator.id);
            if (oldp !== undefined) {
                oldp.cancel();
            }
            let p = validator.validate(this._valuesForValidator(model, validator));
            this._pending = this._pending.set(validator.id, p);
            return p;
        }).then(results => {
            return i18n => Validators.resolveMessages(
                i18n, Map().merge(...results));
        });
    }
};


/**
 * Combine several bound predicates and succeed if them succeed.
 *
 * @param {BoundPredicate[]} ...boundPredicates: Bound predicates to combine.
 * @return {BoundPredicate}
 */
export function any(...boundPredicates) {
    const validate = values => {
        return Promise.map(boundPredicates, bp => {
            return bp.validate(values);
        }).then(results => {
            if (List(results).contains(Map())) {
                return Map();
            }
            return Map().merge(...results);
        });
    };
    return new BoundPredicate(
        List().concat(...boundPredicates.map(v => v.fieldNames)),
        validate);
}


/**
 * Bind a validator predicate to several fields.
 *
 * @param {string[]} fieldNames: Names of the fields whose values should be
 *   passed.
 * @param {Function} f: Validator predicate.
 * @return {BoundPredicate}
 */
export function are(fieldNames, f) {
    const validate = values => {
        return maybe(f, ...fieldNames.map(k => values.get(k))).then(result => {
            let errors = Map();
            if (result !== VALID) {
                for (let field of fieldNames) {
                    errors = errors.set(field, result);
                }
            }
            return errors;
        });
    };
    return new BoundPredicate(fieldNames, validate);
}


/**
 * Bind a validator predicate to a single field value.
 *
 * @param {string} fieldName: Name of the field whose value should be passed.
 * @param {Function} f: Validator predicate.
 * @return {BoundPredicate}
 */
export function is(fieldName, f) {
    return are([fieldName], f);
}


/**
 * Create a validator function from condition and message functions.
 *
 * @param {Function} cond: Condition function returning `true` or `false`.
 * @param {Function} message: Function, called in the event that `cond` fails,
 *   passed an internationalization lookup object, condition arguments and
 *   validator function arguments, returning a localized message.
 * @return {Function}: Function, whose arguments are passed to `cond`,
 *   producing a validator function.
 */
export function condition(cond, message) {
    return (...args) => (...rest) => {
        const f = cond(...args);
        if (!(f instanceof Function)) {
            throw new Error('Expected function but got ' + f);
        }
        if (!f(...rest)) {
            return i18n => {
                return message(i18n, args, rest);
            };
        }
        return VALID;
    };
}


/**
 * Combine several validator predicates, taking a single argument, into one.
 *
 * @param {...function} fs: Validator predicates, taking a single argument, to
 *   combine.
 * @return {function}: Combined validator predicate.
 */
export function combine(...fs) {
    return value => {
        for (let f of fs) {
            let result = f(value);
            if (result !== VALID) {
                return result;
            }
        }
        return VALID;
    };
}


/**
 * Specify a custom message for a validator predicate.
 *
 * @param {function} mf: Message function taking an internationalization `Map`,
 *   an `Array` of arguments passed to `f` and an `Array` of arguments passed
 *   to the result of invoking `f`.
 * @param {function} f: Validator predicate (for example `equalTo`).
 * @param {...Any} args: Arguments to invoke `f` with.
 * @return {function}: Behaves like `f` but invokes `mf` to determine the
 *   validation message.
 */
export function message(mf, f, ...args) {
    let f = f(...args);
    return (...rest) => {
        let result = f(...rest);
        if (result !== VALID) {
            return i18n => mf(i18n, args, rest);
        }
        return VALID;
    };
}


/**
 *
 */
export function onceEvery(ms, v) {
    return (...rest) => delay(ms).then(() => v(...rest));
}


const msg = partial(i18nMessage, 'validators');
export const equal = condition(C.equal, msg('equal'));
export const equalTo = equal;
export const notEqual = condition(C.notEqual, msg('notEqual'));
export const lessThan = condition(C.lessThan, msg('lessThan'));
export const atMost = condition(C.atMost, msg('atMost'));
export const greaterThan = condition(C.greaterThan, msg('greaterThan'));
export const atLeast = condition(C.atLeast, msg('atLeast'));
export const between = condition(
    C.between, msg('between', (args) => ({'a': args[0],
                                           'b': args[1]})));
export const empty = condition(
    C.empty, msg('empty', (_, rest) => ({'value': rest[0]})));
export const notEmpty = condition(C.notEmpty, msg('notEmpty'));
export const notNull = condition(C.notNull, msg('notNull'));
export const lengthOf = condition(C.lengthOf, msg('lengthOf'));
export const lengthAtMost = condition(C.lengthAtMost, msg('lengthAtMost'));
export const lengthAtLeast = condition(C.lengthAtLeast, msg('lengthAtLeast'));
export const oneOf = condition(C.oneOf, msg('oneOf'));
export const numeric = condition(
    () => C.combine(C.typeOf('string', 'number'),
                    C.regex(/^\d*$/)),
    msg('numeric'));
