import Promise from 'bluebird';
import {assert} from 'chai';
import {List, Map} from 'immutable';
import {maybe} from '../src/promises';
import * as V from '../src/validators';
import {Status} from '../src/predicates';
import * as P from '../src/predicates';
import en from '../src/i18n/en';
import {assertStatuses} from './support/asserts';


function assertValidValidators(i18n, validators, model) {
    return assertInvalidValidators(i18n, validators, model, Map());
}


function assertInvalidValidators(i18n, validators, model, expected) {
    let validate = V.instantiate(validators);
    return validate(model).then(result => {
        assertStatuses(i18n, result, expected);
    });
}


describe('Validators', function() {
    it('valid', function() {
        let model = Map({'a': 'one',
                         'b': 'two'});
        return assertValidValidators(
            en,
            V.validators(
                P.is('a', P.equal('one')),
                P.is('b', P.equal('two'))),
            model);
    });

    it('invalid', function() {
        let model = Map({'a': 'two',
                         'b': 'two'});
        return assertInvalidValidators(
            en,
            V.validators(
                P.is('a', P.equal('one')),
                P.is('b', P.equal('two'))),
            model,
            Map({'a': Status.invalid('Must be "one"')}));
    });

    it('async validators are cancelled if they are pending', function() {
        let validators = V.validators(
            P.is('a', P.debounce(P.equal('one'), 10)));
        let validate = V.instantiate(validators);
        // Fire off a validation, with invalid data..
        let model1 = Map({'a': 'two'});
        let p1 = validate(model1);
        // Fire off a second validation, with valid data, before the first once
        // runs.
        let model2 = Map({'a': 'one'});
        let p2 = validate(model2);
        // Let the validator run.
        return Promise.join(
            p2,
            assert.isRejected(p1, Promise.CancellationError),
            result => assertStatuses(en, result, Map()));
    });

    it('predicate result callback', function() {
        let validators = V.validators(
            P.is('a', P.equal('one')),
            P.is('b', P.debounce(P.equal('two'), 10)));
        let validate = V.instantiate(validators);
        let model = Map({'a': 'one', 'b': 'one'});
        let cbResults = List();
        let callback = (result) => {
            cbResults = cbResults.push(result);
        };
        return validate(model, callback).then(result => {
            assertStatuses(
                en,
                result,
                Map({'b': Status.invalid('Must be "two"')}));
            assert.strictEqual(cbResults.size, 2);
            assertStatuses(
                en,
                cbResults.get(0),
                Map());
            assertStatuses(
                en,
                cbResults.get(1),
                Map({'b': Status.invalid('Must be "two"')}));
        });
    });
});
