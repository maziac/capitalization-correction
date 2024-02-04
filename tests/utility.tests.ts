import * as assert from 'assert';
import {Utility} from '../src/utility';


suite('Utility', () => {

    test('isLetter', () => {
        // Not a letter
        assert.ok(!Utility.isLetter('0'));
        assert.ok(!Utility.isLetter(''));
        assert.ok(!Utility.isLetter('abc'));
        assert.ok(!Utility.isLetter('0'));
        assert.ok(!Utility.isLetter('9'));
        assert.ok(!Utility.isLetter('-'));
        assert.ok(!Utility.isLetter('+'));
        assert.ok(!Utility.isLetter('_'));

        // Letter
        assert.ok(Utility.isLetter('a'));
        assert.ok(Utility.isLetter('A'));
        assert.ok(Utility.isLetter('z'));
        assert.ok(Utility.isLetter('Z'));
        assert.ok(Utility.isLetter('ä'));
        assert.ok(Utility.isLetter('Ä'));
        assert.ok(Utility.isLetter('ö'));
        assert.ok(Utility.isLetter('Ö'));
        assert.ok(Utility.isLetter('ü'));
        assert.ok(Utility.isLetter('Ü'));
        assert.ok(Utility.isLetter('ß'));
    });

    test('getCorrectlyCapitalizedWord', () => {
        // Nothing found
        assert.equal(Utility.getCorrectlyCapitalizedWord(''), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord('ABc '), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord('Abc'), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord('AbCd'), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord('ABCd'), null);

        // Corrected
        assert.equal(Utility.getCorrectlyCapitalizedWord('ABc'), 'Abc');
        assert.equal(Utility.getCorrectlyCapitalizedWord(' ABc'), 'Abc');
        assert.equal(Utility.getCorrectlyCapitalizedWord('   ABc'), 'Abc');
        assert.equal(Utility.getCorrectlyCapitalizedWord('8ABc'), 'Abc');
        assert.equal(Utility.getCorrectlyCapitalizedWord('CDa ABc'), 'Abc');

        // Umlauts
        assert.equal(Utility.getCorrectlyCapitalizedWord('ÄÖüß'), 'Äöüß');
    });


    suite('contains', () => {
        test('general', () => {
            // General tests:
            // Found
            assert.ok(Utility.contains('file.ts', '*.{md,js,ts}'));
            assert.ok(Utility.contains('file.js', '*.{md,js,ts}'));;
            assert.ok(Utility.contains('file.js', '*.js'));
            assert.ok(Utility.contains('file.aaa.js', '*.js'));
            assert.ok(Utility.contains('/folder/file.txt', '**/*.txt'));
            assert.ok(Utility.contains('folder/file.txt', '**/*.txt'));
            assert.ok(Utility.contains('file.txt', '**/*.txt'));
            // Not found
            assert.ok(!Utility.contains('extzzzz', ''));
            assert.ok(!Utility.contains('ext.zzzz', ''));
            assert.ok(!Utility.contains('', ''));
            assert.ok(!Utility.contains('extzzzz', undefined));
            assert.ok(!Utility.contains('', undefined));
            assert.ok(!Utility.contains('', 'txt'));
            assert.ok(!Utility.contains('md', 'txt'));
            assert.ok(!Utility.contains('file.txt', '*.TXT'));
            assert.ok(!Utility.contains('file.js', '*.{md,MD,markdown,txt,TXT}'));
            assert.ok(!Utility.contains('/folder/file.txt', '*.txt'));
            assert.ok(!Utility.contains('folder/file.txt', '*.txt'));
        });

        test('default excludes', () => {
            // Defaults exclude glob:
            const defaultExcludeGlob = '**/CMakeLists.txt';
            // Found
            assert.ok(Utility.contains('folder/CMakeLists.txt', defaultExcludeGlob));
            assert.ok(Utility.contains('CMakeLists.txt', defaultExcludeGlob));
            // Not found
            assert.ok(!Utility.contains('**/CMakeLists', defaultExcludeGlob));
        });

        test('default includes', () => {
            // Defaults include glob:
            const defaultIncludeGlob = '**/*.{md,MD,markdown,txt,TXT}';
            // Found
            assert.ok(Utility.contains('file.md', defaultIncludeGlob));
            assert.ok(Utility.contains('file.MD', defaultIncludeGlob));
            assert.ok(Utility.contains('file.markdown', defaultIncludeGlob));
            assert.ok(Utility.contains('file.TXT', defaultIncludeGlob));
            assert.ok(Utility.contains('file.txt', defaultIncludeGlob));
            assert.ok(Utility.contains('file.aaa.md', defaultIncludeGlob));
            assert.ok(Utility.contains('file.aaa.MD', defaultIncludeGlob));
            assert.ok(Utility.contains('file.aaa.markdown', defaultIncludeGlob));
            assert.ok(Utility.contains('file.aaa.TXT', defaultIncludeGlob));
            assert.ok(Utility.contains('file.aaa.txt', defaultIncludeGlob));
            assert.ok(Utility.contains('CMakeList.txt', defaultIncludeGlob));
            assert.ok(Utility.contains('CMakeLists.txt', defaultIncludeGlob));
            // Not found
            assert.ok(!Utility.contains('file.js', defaultIncludeGlob));
        });
    });

    test('isComment', () => {
        // Is a comment
        assert.ok(Utility.isComment('// abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('// // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('*/ // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/*  */ // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/* ab */// abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/* */ */ // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/* /* */ // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/* abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/*a', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/* *//* */ /**//* abc', '//', '/\\*', '\\*/'));
        // Multiline
        assert.ok(Utility.isComment('\n\n   \n// abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('\n\n   \n// // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('\n\n */  \n*/ // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('\n/*\n \n  */ // abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('\n/*\n \n  */\n// abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('\n/*\n \n  // */\n// abc', '//', '/\\*', '\\*/'));
        assert.ok(Utility.isComment('/*\n*/\n/*\n\na', '//', '/\\*', '\\*/'));


        // Is no comment
        assert.ok(!Utility.isComment(' abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('*/ abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('/*  */ abc', '//', '/\\*', '\\*/'));
        // Multiline
        assert.ok(!Utility.isComment('/*\n */ abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('/*\n */\n abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('\n\n\n', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('/* \n*/\n abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('/* \n*/\n abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('/* \n*/\n/*  */ abc', '//', '/\\*', '\\*/'));
        assert.ok(!Utility.isComment('/* \n*/\n/*\n*/\n abc', '//', '/\\*', '\\*/'));

    });

});
