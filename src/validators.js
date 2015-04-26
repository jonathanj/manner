/**
 * Validators
 * ----------
 *
 * Validators are a mechanism to model the validity of fields in a `Model` based
 * on a predicate.
 *
 * A predicate is something that applies some basic boolean predicate to input
 * and returns a `Status` instance, representing an invalid result (with a
 * reason for the predicate failing) or a valid result. An example of a
 * predicate that is only valid when called with the value `hello` might look
 * like this:
 *
 *     import * as P from "manner/predicates";
 *     let pred = P.equalTo("hello");
 *     pred("nope");  // => Status.invalid('Must equal "hello"');
 *
 * By themselves predicates are not very useful, they need to be *bound* to an
 * input (or multiple inputs), individually bound fields can be created with the
 * `is` function:
 *
 *     let boundPred = P.is("greeting", P.equalTo("hello"));
 *     boundPred.validate(Immutable.Map({"greeting": "nope"}));
 *     // => Immutable.Map({"greeting": Status.invalid("nope")});
 */
import {List, Map} from "immutable";
import Promise from "bluebird";
import {_State, Status, BoundPredicate} from "./predicates";


/**
 * Create a validation object for several bound predicates.
 *
 * By itself the validation object is not very useful but can be passed to
 * `manner.validators.instantiate` to create a function that can be called with
 * a model to validate inputs.
 *
 * @param {BoundPredicate[]} ...boundPredicates: Bound predicates to wrap in a
 *   validation object.
 */
export function validators(...boundPredicates) {
    return new _Validators(boundPredicates);
}


/**
 * Instantiate the result from `validators`.
 *
 * This result is good for use in one domain only, call it again for use with
 * another domain.
 */
export function instantiate(validators) {
    let noop = () => {};
    let state = new _State(
        (bp, values, callback=noop) =>
            bp.validate(values).then(r => { callback(r); return r; }));
    return validators.validate.bind(validators, state);
}


/**
 * Wrap multiple `BoundPredicate`s and provide a way to validate them against a
 * model.
 */
class _Validators {
    constructor(boundPredicates) {
        this._boundPredicates = List(boundPredicates);
        this.fieldNames = List().concat(
            ...this._boundPredicates.map(v => v.fieldNames));
    }

    /**
     * Validate against a model.
     *
     * @param {_State} state: Validation state.
     * @param {Immutable.Map} model: Model data.
     * @return {Promise}: Promise that resolves to an `Immutable.Map` mapping
     *   field names to `Status` instances.
     */
    validate(state, model, predicateResultCallback) {
        return Promise.map(this._boundPredicates.toJS(), bp => {
            let values = Map(
                bp.fieldNames.map(name => [name, model.get(name)]));
            return state.updateFor(bp, values, predicateResultCallback);
        }).then(results => {
            return Map().merge(...results);
        });
    }
};
