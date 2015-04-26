/**
 * Conditions
 * ----------
 *
 * Conditions are a mechanism to model the enabling, disabling and visibility
 * states of fields in `Model` based on a bound predicate, the same bound
 * predicates used with validators.
 *
 * A simple condition that disables some fields when the input field's value is
 * equal to something might look like this:
 *
 *     import * as C from "manner/conditions";
 *     import * as P from "manner/predicates";
 *     // Create the conditions.
 *     let conditions = C.conditions(
 *       C.when(P.is('hasWheels', P.equalTo(true)),
 *              C.disable('numberOfWheels')));
 *     // Instantiate them.
 *     let conditionsInstance = C.instantiate(conditions);
 *     // Check them against the model.
 *     let result = conditionsInstance(model);
 *
 * The result of an action is always dictated by the predicate, in other words:
 * If a `disable` action's predicate succeeds then the output fields will be
 * marked as disabled, if the action's predicate fails then the output fields be
 * marked as enabled. The behaviour of conflicting actions, e.g. specifying an
 * action to disable a field and another action to enable the field, is
 * undefined.
 */
import Promise from "bluebird";
import {List, Map} from "immutable";
import uuid from "uuid";
import {BoundPredicate, _State} from "./predicates";
import {maybe} from "./promises";
import {StatusBase} from "./util";


/**
 * Condition status.
 */
export class Status extends StatusBase {
    static combine(...statuses) {
        return StatusBase.combineWithPriority(
            List.of(Status.HIDDEN, Status.DISABLED, Status.NORMAL),
            ...statuses);
    }

    static normal(message=null) {
        return new Status(Status.NORMAL, message);
    }

    static disabled(message=null) {
        return new Status(Status.DISABLED, message);
    }

    static hidden(message=null) {
        return new Status(Status.HIDDEN, message);
    }
};

Status.NORMAL = 'normal';
Status.DISABLED = 'disabled';
Status.HIDDEN = 'hidden';


/**
 * Helper function for defining an action.
 */
function _defineAction(fieldNames, success, failure) {
    let msg = fieldNames[0];
    if (msg instanceof Function) {
        fieldNames.shift();
    } else {
        msg = null;
    }
    return result => {
        return Map(
            fieldNames.map(k => [k, result ? success(msg) : failure(msg)]));
    };
}


/**
 * Hide the listed fields when the parent conditional's predicate passes.
 *
 * If the parent conditional's predicate does not pass then the listed fields
 * are shown.
 *
 * The first parameter can optionally be a message function that is the reason
 * for the action taking place.
 */
export function hide(...fieldNames) {
    return _defineAction(fieldNames, Status.hidden, Status.normal);
}


/**
 * Show the listed fields when the parent conditional's predicate passes.
 *
 * If the parent conditional's predicate does not pass then the listed fields
 * are hidden.
 *
 * The first parameter can optionally be a message function that is the reason
 * for the action taking place.
 */
export function show(...fieldNames) {
    return _defineAction(fieldNames, Status.normal, Status.hidden);
}


/**
 * Disable the listed fields when the parent conditional's predicate passes.
 *
 * If the parent conditional's predicate does not pass then the listed fields
 * are enabled.
 *
 * The first parameter can optionally be a message function that is the reason
 * for the action taking place.
 */
export function disable(...fieldNames) {
    return _defineAction(fieldNames, Status.disabled, Status.normal);
}


/**
 * Enable the listed fields when the parent conditional's predicate passes.
 *
 * If the parent conditional's predicate does not pass then the listed fields
 * are disabled.
 *
 * The first parameter can optionally be a message function that is the reason
 * for the action taking place.
 */
export function enable(...fieldNames) {
    return _defineAction(fieldNames, Status.normal, Status.disabled);
}


/**
 */
class _Condition {
    constructor(fieldNames, check) {
        this.id = uuid.v4();
        this.fieldNames = List(fieldNames);
        this._check = check;
    }

    check(values) {
        return maybe(this._check, values);
    }
}


/**
 * Create a condition object from an input condition and output actions.
 *
 * @param {BoundPredicate} boundPredicate: Bound predicate that determines
 *   how the actions are be applied, in other words: the input.
 * @param {function[]} ...actions: Output actions to apply.
 * @return {_Condition}: Condition.
 */
export function when(boundPredicate, ...actions) {
    let check = values => {
        return boundPredicate.validate(values).then(result => {
            let success = result.isEmpty();
            let results = Map();
            for (let action of actions) {
                for (let [k, status] of action(success)) {
                    results = results.set(
                        k, Status.combine(results.get(k, Status.normal()), status));
                }
            }
            return results;
        });
    };
    return new _Condition(boundPredicate.fieldNames, check);
}


/**
 * Create a conditions object for several condtions.
 *
 * Conditions are returned by `when`, for example.
 *
 * By itself the conditions object is not very useful but can be passed to
 * `instantiate` to create a function that can be called with a model to
 * determine visibility / disabled-ness for inputs.
 *
 * @param {_Condition[]} ...conditions: Conditions to wrap in a conditions object.
 */
export function conditions(...conditions) {
    return new _Conditions(conditions);
}


/**
 * Instantiate the result from `conditions`.
 *
 * This result is good for use in one domain only, call it again for use with
 * another domain.
 */
export function instantiate(conditions) {
    let noop = () => {};
    let state = new _State(
        (cond, values, callback=noop) =>
            cond.check(values).then(r => { callback(r); return r; }));
    return conditions.check.bind(conditions, state);
}


/**
 * Wrap multiple `_Condition`s and provide a way to check them against a
 * model.
 */
class _Conditions {
    constructor(conditions) {
        this._conditions = conditions;
        this.fieldNames = List().concat(
            ...this._conditions.map(v => v.fieldNames));
    }

    check(state, model, predicateResultCallback) {
        return Promise.map(this._conditions, cond => {
            let values = Map(
                cond.fieldNames.map(name => [name, model.get(name)]));
            return state.updateFor(cond, values, predicateResultCallback);
        }).then(results => {
            return Map().mergeWith(Status.combine, ...results);
        });
    }
};
