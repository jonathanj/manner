import {assert} from 'chai';
import {List, Map} from 'immutable';
import {StatusBase} from '../../src/util';


/**
 * Assert that two `Immutable.Map`s of `String` to `StatusBase` instances are
 * equal.
 */
export function assertStatuses(i18n, result, expected) {
    let flat = m => m.map(v => {
        assert.instanceOf(v, StatusBase);
        return List.of(v.type, v.message(i18n));
    }).toJS();
    assert.deepEqual(flat(result), flat(expected));
}
