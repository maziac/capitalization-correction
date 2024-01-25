import * as assert from 'assert';
import {Regexes} from '../src/utility';


suite('Regexes', () => {

    test('isNoLetter', () => {
        // Not a letter
        assert.ok(Regexes.isNoLetter('0'));
        assert.ok(Regexes.isNoLetter(''));
        assert.ok(Regexes.isNoLetter('abc'));
        assert.ok(Regexes.isNoLetter('0'));
        assert.ok(Regexes.isNoLetter('9'));
        assert.ok(Regexes.isNoLetter('-'));
        assert.ok(Regexes.isNoLetter('+'));
        assert.ok(Regexes.isNoLetter('_'));

        // Letter
        assert.ok(!Regexes.isNoLetter('a'));
        assert.ok(!Regexes.isNoLetter('A'));
        assert.ok(!Regexes.isNoLetter('z'));
        assert.ok(!Regexes.isNoLetter('Z'));
        assert.ok(!Regexes.isNoLetter('ä'));
        assert.ok(!Regexes.isNoLetter('Ä'));
        assert.ok(!Regexes.isNoLetter('ö'));
        assert.ok(!Regexes.isNoLetter('Ö'));
        assert.ok(!Regexes.isNoLetter('ü'));
        assert.ok(!Regexes.isNoLetter('Ü'));
        assert.ok(!Regexes.isNoLetter('ß'));
    });

});
