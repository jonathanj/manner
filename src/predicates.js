import Promise from 'bluebird';
import {List, Map} from 'immutable';
import uuid from 'uuid';
import {i18nMessage} from './i18n';
import * as PB from './predicates/boolean';
import {maybe, delay, succeed} from './promises';
import {partial, StatusBase} from './util';


/**
 * Predicate result status.
 */
export class Status extends StatusBase {
    static combine(...statuses) {
        return StatusBase.combineWithPriority(
            List.of(Status.INVALID, Status.VALID),
            Status.valid(),
            ...statuses);
    }

    /**
     * Create a valid result status.
     */
    static valid() {
        return new Status(Status.VALID);
    }

    /**
     * Create an invalid result status.
     *
     * @param {string|function} message: Either a plain string or a function
     *   that is passed an internationalization map and returns a string.
     */
    static invalid(message) {
        return new Status(Status.INVALID, message);
    }
};

Status.VALID = 'valid';
Status.INVALID = 'invalid';


/**
 * Bound predicate.
 *
 * Bound in the sense that if, for example, `equalTo` is a predicate then `is`
 * binds a predicate to a field.
 *
 * @class
 */
export class BoundPredicate {
    /**
     * Construct a bound predicate.
     *
     * @param {string[]} fieldNames: Names of fields involved in the validation.
     * @param {function} validate: Function taking an ``Immutable.Map`` of field
     *   values and returning a ``Immutable.Map`` of validation messages.
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
     * @param {Immutable.Map<string, any>} values: Field values.
     * @return {Immutable.Map<string, function>}: Map of field names to
     *   validation message functions.
     */
    validate(values) {
        return maybe(this._validate, values).then(Map);
    }
};


/**
 * Private condition / predicate state.
 *
 * @class _State
 * @member {function} _run: Function passed a runnable and the model values, it
 *   should return a `Promise` that returns an ``Immutable.Map`` of field names
 *   mapped to result statuses.
 * @member {Immutable.Map} _resultCache: Map of runnable identifiers mapped to
 *   the previously used values and the result for those values.
 * @member {Immutable.Map} _pendingResults: Map of runnable identifiers mapped
 *   to `Promise`s that have yet to be resolved.
 */
export class _State {
    constructor(run) {
        this._run = run;
        this._resultCache = Map();
        this._pendingResults = Map();
    }

    /**
     * Mark a result as pending.
     */
    _setPending(id, p) {
        this._pendingResults = this._pendingResults.set(id, p);
    }

    /**
     * Cancel any pending result for the given identifier.
     */
    _cancelPending(id) {
        let old = this._pendingResults.get(id);
        if (old !== undefined) {
            old.cancel();
            this._pendingResults = this._pendingResults.remove(id);
        }
    }

    /**
     * Update the state for a given runnable.
     *
     * @param {object} runnable: Object with `id` attribute passed to the run
     *   function specified in the constructor.
     * @return {Promise}: Promise that fires with result of the run function
     *   when it is resolved.
     */
    updateFor(runnable, values, callback) {
        let id = runnable.id;
        this._cancelPending(id);
        let [oldValues, result] = this._resultCache.get(id, []);
        if (values.equals(oldValues)) {
            return succeed(result);
        }
        let p = this._run(runnable, values, callback);
        this._setPending(id, p);
        p.then(result => {
            this._resultCache = this._resultCache.set(id, [values, result]);
            return result;
        }).catch(Promise.CancellationError, e => {});
        return p;
    }
};


/**
 * Combine several bound predicates and succeed if any of them succeed.
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
 * Bind a predicate to several fields.
 *
 * @param {string[]} fieldNames: Names of the fields whose values should be
 *   passed.
 * @param {function} f: Predicate.
 * @return {BoundPredicate}
 */
export function are(fieldNames, f) {
    const validate = values => {
        return maybe(f, ...fieldNames.map(k => values.get(k))).then(result => {
            let errors = Map();
            if (Status.is(result, Status.INVALID)) {
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
 * Bind a predicate to a single field value.
 *
 * @param {string} fieldName: Name of the field whose value should be passed.
 * @param {function} f: Predicate.
 * @return {BoundPredicate}
 */
export function is(fieldName, f) {
    return are([fieldName], f);
}


/**
 * Create a predicate from a boolean predicate and a message.
 *
 * @param {function} pred: Boolean predicate returning ``true`` or ``false``.
 * @param {function} msgf: Function, called in the event that ``pred`` fails,
 *   passed an internationalization lookup object, predicate arguments and
 *   calling arguments, returning a localized message.
 * @return {function}: Function, whose arguments are passed to `pred``,
 *   producing a predicate.
 */
export function predicate(pred, msgf) {
    return (...args) => (...rest) => {
        const f = pred(...args);
        if (!(f instanceof Function)) {
            throw new Error('Expected function but got ' + f);
        }
        if (!f(...rest)) {
            return Status.invalid(i18n => msgf(i18n, args, rest));
        }
        return Status.valid();
    };
}


/**
 * Combine several predicates using logical AND.
 *
 * @param {function[]} fs: Predicates, each taking a single argument, to
 *   combine.
 * @return {function}: Combined predicate.
 */
export function and(...fs) {
    return value => {
        return Promise.map(fs, f => {
            return f(value);
        }).then(results => {
            return Status.combine(...results);
        });
    };
}


/**
 * Combine several predicates using logical OR.
 *
 * @param {function[]} fs: Predicates, each taking a single argument, to
 *   combine.
 * @return {function}: Combined predicate.
 */
export function or(...fs) {
    return value => {
        return Promise.map(fs, f => {
            return f(value);
        }).then(results => {
            if (results.some(r => Status.is(r, Status.VALID))) {
                return Status.valid();
            }
            return Status.combine(...results);
        });
    };
}


/**
 * Specify a custom message for a predicate.
 *
 * @param {function} msgf: Message function taking an internationalization ``Immutable.Map``,
 *   an `Array` of arguments passed to `f` and an `Array` of arguments passed
 *   to the result of invoking `f`.
 * @param {function} f: Predicate (for example `equalTo`).
 * @param {...Any} partialArgs: Options arguments to invoke `f` with.
 * @return {function}: Behaves like `f` but invokes `msgf` to determine the
 *   validation message.
 */
export function message(msgf, f, ...partialArgs) {
    let _msgf = msgf;
    if (!(msgf instanceof Function)) {
        _msgf = () => msgf;
    }
    return (...args) => {
        let allArgs = partialArgs.concat(args);
        let _f = f(...allArgs);
        return (...rest) => {
            return maybe(_f, ...rest).then(result => {
                if (Status.is(result, Status.INVALID)) {
                    return Status.invalid(
                        i18n => _msgf(i18n, allArgs, rest));
                }
                return Status.valid();
            });
        };
    };
}


/**
 * Wrap a predicate to ensure it is called only as often as once every ``ms``
 * milliseconds.
 *
 * @param {number} ms: Delay after which to invoke the predicate.
 * @param {function} p: Predicate.
 * @return {function}: Wrapped predicate.
 */
export function onceEvery(ms, p) {
    return (...rest) => delay(ms).then(() => p(...rest));
}


const msg = partial(i18nMessage, 'predicates');
/** Value is truthy. */
export const truthy = predicate(PB.truthy, msg('truthy'));
/** Value is falsy. */
export const falsy = predicate(PB.truthy, msg('falsy'));
/** Equal to a value specified later. Aliases: `equalTo` */
export const equal = predicate(PB.equal, msg('equal'));
export const equalTo = equal;
/** Not equal to a value specified later. */
export const notEqual = predicate(PB.notEqual, msg('notEqual'));
export const notEqualTo = notEqual;
/** Less than a value specified later. */
export const lessThan = predicate(PB.lessThan, msg('lessThan'));
/** Less than or equal to a value specified later. */
export const atMost = predicate(PB.atMost, msg('atMost'));
/** Greater than a value specified later. */
export const greaterThan = predicate(PB.greaterThan, msg('greaterThan'));
/** Greater than or equal to a value specified later. */
export const atLeast = predicate(PB.atLeast, msg('atLeast'));
/** Between `a` and `b`, inclusively. */
export const between = predicate(
    PB.between, msg('between', (args) => ({'a': args[0],
                                           'b': args[1]})));
/** Either `null`, `undefined` or has a `length` value of `0`. */
export const empty = predicate(
    PB.empty, msg('empty', (_, rest) => ({'value': rest[0]})));
/** Not `null` or `undefined` and has a non-zero `length` value. */
export const notEmpty = predicate(PB.notEmpty, msg('notEmpty'));
/** Not `null`. */
export const notNull = predicate(PB.notNull, msg('notNull'));
/** Length is exactly `n`. */
export const lengthOf = predicate(PB.lengthOf, msg('lengthOf'));
/** Length is at least `n`. */
export const lengthAtMost = predicate(PB.lengthAtMost, msg('lengthAtMost'));
/** Length is at most `n`. */
export const lengthAtLeast = predicate(PB.lengthAtLeast, msg('lengthAtLeast'));
/** Is a value an element in a set? */
export const elementOf = predicate(PB.elementOf, msg('elementOf'));
/** Is the value a numeric type or a digit string? */
export const numeric = predicate(
    () => PB.and(PB.typeOf('string', 'number'),
                 PB.regex(/^\d*$/)),
    msg('numeric'));
/** Checked? */
export const checked = predicate(partial(PB.equal, true), msg('checked'));
/** Unchecked? */
export const unchecked = predicate(partial(PB.equal, false), msg('unchecked'));
