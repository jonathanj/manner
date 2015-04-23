import {assert} from 'chai';
import {List, Map} from 'immutable';
import {StatusBase} from '../../src/util';


/**
 */
export function assertStatuses(i18n, result, expected) {
    let flat = m => m.map(v => {
        assert.instanceOf(v, StatusBase);
        return List.of(v.type, v.message(i18n));
    }).toJS();
    assert.deepEqual(flat(result), flat(expected));
}
