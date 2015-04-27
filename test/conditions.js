import {assert} from 'chai';
import {List, Map} from 'immutable';
import {Status} from '../src/conditions';
import * as C from '../src/conditions';
import * as P from '../src/predicates';
import en from '../src/i18n/en';
import Promise from 'bluebird';
import {assertStatuses} from './support/asserts';


function assertAction(i18n, result, action, expected) {
    assertStatuses(i18n, action(result), expected);
}


function assertCondition(i18n, values, conditional, expected) {
    let p = conditional.check(values).then(statuses => {
        assertStatuses(i18n, statuses, expected);
    });
}


function msg(s) {
    return () => s;
}


describe('Status', function() {
    describe('combine', function() {
        it('single', function() {
            assert.strictEqual(
                Status.combine(Status.normal()).type,
                Status.NORMAL);
            assert.strictEqual(
                Status.combine(Status.disabled()).type,
                Status.DISABLED);
            assert.strictEqual(
                Status.combine(Status.hidden()).type,
                Status.HIDDEN);
        });

        it('disabled', function() {
            assert.strictEqual(
                Status.combine(Status.normal(), Status.disabled()).type,
                Status.DISABLED);
            assert.strictEqual(
                Status.combine(Status.disabled(), Status.normal()).type,
                Status.DISABLED);
        });

        it('hidden', function() {
            assert.strictEqual(
                Status.combine(Status.normal(), Status.hidden()).type,
                Status.HIDDEN);
            assert.strictEqual(
                Status.combine(Status.disabled(), Status.hidden()).type,
                Status.HIDDEN);
            assert.strictEqual(
                Status.combine(Status.hidden(), Status.normal()).type,
                Status.HIDDEN);
            assert.strictEqual(
                Status.combine(Status.hidden(), Status.disabled()).type,
                Status.HIDDEN);
        });
    });
});


describe('Actions', function() {
    describe('hide', function() {
        it('true', function() {
            assertAction(
                en,
                true,
                C.hide('a', 'b'),
                Map({'a': Status.hidden(),
                     'b': Status.hidden()}));
            assertAction(
                en,
                true,
                C.hide(msg('foo'), 'a', 'b'),
                Map({'a': Status.hidden('foo'),
                     'b': Status.hidden('foo')}));
        });
        it('false', function() {
            assertAction(
                en,
                false,
                C.hide('a', 'b'),
                Map({'a': Status.normal(),
                     'b': Status.normal()}));
            assertAction(
                en,
                false,
                C.hide(msg('foo'), 'a', 'b'),
                Map({'a': Status.normal('foo'),
                     'b': Status.normal('foo')}));
        });
    });

    describe('show', function() {
        it('true', function() {
            assertAction(
                en,
                true,
                C.show('a', 'b'),
                Map({'a': Status.normal(),
                     'b': Status.normal()}));
            assertAction(
                en,
                true,
                C.show(msg('foo'), 'a', 'b'),
                Map({'a': Status.normal('foo'),
                     'b': Status.normal('foo')}));
        });
        it('false', function() {
            assertAction(
                en,
                false,
                C.show('a', 'b'),
                Map({'a': Status.hidden(),
                     'b': Status.hidden()}));
            assertAction(
                en,
                false,
                C.show(msg('foo'), 'a', 'b'),
                Map({'a': Status.hidden('foo'),
                     'b': Status.hidden('foo')}));
        });
    });

    describe('disable', function() {
        it('true', function() {
            assertAction(
                en,
                true,
                C.disable('a', 'b'),
                Map({'a': Status.disabled(),
                     'b': Status.disabled()}));
            assertAction(
                en,
                true,
                C.disable(msg('foo'), 'a', 'b'),
                Map({'a': Status.disabled('foo'),
                     'b': Status.disabled('foo')}));
        });
        it('false', function() {
            assertAction(
                en,
                false,
                C.disable('a', 'b'),
                Map({'a': Status.normal(),
                     'b': Status.normal()}));
            assertAction(
                en,
                false,
                C.disable(msg('foo'), 'a', 'b'),
                Map({'a': Status.normal('foo'),
                     'b': Status.normal('foo')}));
        });
    });

    describe('enable', function() {
        it('true', function() {
            assertAction(
                en,
                true,
                C.enable('a', 'b'),
                Map({'a': Status.normal(),
                     'b': Status.normal()}));
            assertAction(
                en,
                true,
                C.enable(msg('foo'), 'a', 'b'),
                Map({'a': Status.normal('foo'),
                     'b': Status.normal('foo')}));
        });
        it('false', function() {
            assertAction(
                en,
                false,
                C.enable('a', 'b'),
                Map({'a': Status.disabled(),
                     'b': Status.disabled()}));
            assertAction(
                en,
                false,
                C.enable(msg('foo'), 'a', 'b'),
                Map({'a': Status.disabled('foo'),
                     'b': Status.disabled('foo')}));
        });
    });
});


describe('when', function() {
    before(function() {
        this.values = Map({'a': 42, 'b': 21});
    });

    describe('simple', function() {
        it('show success', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(42)),
                       C.show('b')),
                Map({'b': Status.normal()}));
        });

        it('show failure', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(21)),
                       C.show('b')),
                Map({'b': Status.hidden()}));
        });

        it('hide success', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(42)),
                       C.hide('b')),
                Map({'b': Status.hidden()}));
        });

        it('hide failure', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(21)),
                       C.hide('b')),
                Map({'b': Status.normal()}));
        });

        it('enable success', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(42)),
                       C.enable('b')),
                Map({'b': Status.normal()}));
        });

        it('enable failure', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(21)),
                       C.enable('b')),
                Map({'b': Status.disabled()}));
        });

        it('disable success', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(42)),
                       C.disable('b')),
                Map({'b': Status.disabled()}));
        });

        it('disable failure', function() {
            return assertCondition(
                en,
                this.values,
                C.when(P.is('a', P.equalTo(21)),
                       C.disable('b')),
                Map({'b': Status.normal()}));
        });
    });

    it('complex', function() {
        return assertCondition(
            en,
            this.values,
            C.when(P.is('a', P.equalTo(42)),
                   C.enable('b'),
                   C.disable(msg('y'), 'c'),
                   C.show(msg('z'), 'c')),
            Map({'b': Status.normal(),
                 'c': Status.disabled('y')}));
    });
});


describe('Conditions', function() {
    it('check', function() {
        let conditions = C.conditions(
            C.when(P.is('a', P.equalTo('one')),
                   C.enable('b'),
                   C.hide('c')),
            C.when(P.is('b', P.equalTo('two')),
                   C.disable('d')));
        let cond = C.instantiate(conditions);
        let model = Map({'a': 'two',
                         'b': 'two'});
        return cond(model).then(statuses => {
            assertStatuses(
                en,
                statuses,
                Map({'b': Status.disabled(),
                     'c': Status.normal(),
                     'd': Status.disabled()}));
        });
    });

    it('predicate result callback', function() {
        let conditions = C.conditions(
            C.when(P.is('a', P.equalTo('one')),
                   C.enable('b'),
                   C.hide('c')),
            C.when(P.is('b', P.debounce(P.equalTo('two'), 10)),
                   C.disable('d')));
        let cond = C.instantiate(conditions);
        let model = Map({'a': 'one', 'b': 'one'});
        let cbResults = List();
        let callback = (result) => {
            cbResults = cbResults.push(result);
        };
        return cond(model, callback).then(result => {
            assertStatuses(
                en,
                result,
                Map({'b': Status.normal(),
                     'c': Status.hidden(),
                     'd': Status.normal()}));
            assert.strictEqual(cbResults.size, 2);
            assertStatuses(
                en,
                cbResults.get(0),
                Map({'b': Status.normal(),
                     'c': Status.hidden()}));
            assertStatuses(
                en,
                cbResults.get(1),
                Map({'d': Status.normal()}));
        });
    });
});
