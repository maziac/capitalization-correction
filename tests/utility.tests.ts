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

        // More words
        assert.equal(Utility.getCorrectlyCapitalizedWord('DEf ABc'), 'Abc');
    });

    test('getCorrectlyCapitalizedLetterAfterHyphen', () => {
        // Nothing found
        assert.equal(Utility.getCorrectlyCapitalizedWord("DON'T "), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord("DON't "), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord("doN'T "), null);
        assert.equal(Utility.getCorrectlyCapitalizedWord("R'X "), null);

        // Corrected
        assert.equal(Utility.getCorrectlyCapitalizedWord("don'T"), "t");
        assert.equal(Utility.getCorrectlyCapitalizedWord("Can'T"), "t");
        assert.equal(Utility.getCorrectlyCapitalizedWord("r'X"), "x");

        // Umlauts
        assert.equal(Utility.getCorrectlyCapitalizedWord("nä'S"), "s");

        // More words
        assert.equal(Utility.getCorrectlyCapitalizedWord("don'S can'T"), "t");
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
            assert.ok(!Utility.contains('folder/CMakeLists', defaultExcludeGlob));
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

        test('default c-style block includes', () => {
            // Defaults include glob:
            const defaultCStyleBlockGlob = '**/*.{c,cpp,c++,h,hpp,js,ts,tsx,java,cs,asm,s}';
            // Found
            assert.ok(Utility.contains('folder/source.c', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.cpp', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.c++', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.h', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.hpp', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.js', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.ts', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.java', defaultCStyleBlockGlob));
            assert.ok(Utility.contains('source.cs', defaultCStyleBlockGlob));
            // Not found
            assert.ok(!Utility.contains('CMakeLists.txt', defaultCStyleBlockGlob));
            assert.ok(!Utility.contains('folder/my.md', defaultCStyleBlockGlob));
            assert.ok(!Utility.contains('my.md', defaultCStyleBlockGlob));
        });

        test('default c-style line includes', () => {
            // Defaults include glob:
            const defaultCStyleLineGlob = '**/*.{c,cpp,c++,h,hpp,js,ts,tsx,java,cs}';
            // Found
            assert.ok(Utility.contains('folder/source.c', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.cpp', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.c++', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.h', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.hpp', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.js', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.ts', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.java', defaultCStyleLineGlob));
            assert.ok(Utility.contains('source.cs', defaultCStyleLineGlob));
            // Not found
            assert.ok(!Utility.contains('CMakeLists.txt', defaultCStyleLineGlob));
            assert.ok(!Utility.contains('folder/my.md', defaultCStyleLineGlob));
            assert.ok(!Utility.contains('my.md', defaultCStyleLineGlob));
        });

        test('default hash line includes', () => {
            // Defaults include glob:
            const defaultHashLineGlob = '**/{CMakeLists.txt,*.sh}';
            // Found
            assert.ok(Utility.contains('folder/CMakeLists.txt', defaultHashLineGlob));
            assert.ok(Utility.contains('CMakeLists.txt', defaultHashLineGlob));
            assert.ok(Utility.contains('bash.sh', defaultHashLineGlob));
            // Not found
            assert.ok(!Utility.contains('my.md', defaultHashLineGlob));
            assert.ok(!Utility.contains('CMakeLists.md', defaultHashLineGlob));
            assert.ok(!Utility.contains('CMakeLists', defaultHashLineGlob));
            assert.ok(!Utility.contains('CMakeLists.', defaultHashLineGlob));
        });

        test('default colon line includes', () => {
            // Defaults include glob:
            const defaultcolonLineGlob = '**/*.{asm,s}';
            // Found
            assert.ok(Utility.contains('folder/my.asm', defaultcolonLineGlob));
            assert.ok(Utility.contains('my.asm', defaultcolonLineGlob));
            assert.ok(Utility.contains('my.s', defaultcolonLineGlob));
        });
    });

    test('getSinceLastBlockComments', () => {
        // Is outside a block comment
        assert.equal(Utility.getSinceLastBlockComments('// abc', '/\\*', '\\*/'), '// abc');
        assert.equal(Utility.getSinceLastBlockComments('// // abc',
            '/\\*', '\\*/'), '// // abc');
        assert.equal(Utility.getSinceLastBlockComments('*/ // abc', '/\\*', '\\*/'), '*/ // abc');
        assert.equal(Utility.getSinceLastBlockComments('/*  */ // abc', '/\\*', '\\*/'), ' // abc');
        assert.equal(Utility.getSinceLastBlockComments('/* ab */// abc', '/\\*', '\\*/'), '// abc');
        assert.equal(Utility.getSinceLastBlockComments('/* */ */ // abc', '/\\*', '\\*/'), ' */ // abc');
        assert.equal(Utility.getSinceLastBlockComments('/* /* */ // abc', '/\\*', '\\*/'), ' // abc');
        assert.equal(Utility.getSinceLastBlockComments(' abc', '/\\*', '\\*/'), ' abc');
        assert.equal(Utility.getSinceLastBlockComments('', '/\\*', '\\*/'), '');
        assert.equal(Utility.getSinceLastBlockComments('*/ abc', '/\\*', '\\*/'), '*/ abc');
        assert.equal(Utility.getSinceLastBlockComments('/*  */ abc', '/\\*', '\\*/'), ' abc');
        // Multiline
        assert.equal(Utility.getSinceLastBlockComments('\n\n   \n// abc', '/\\*', '\\*/'), '\n\n   \n// abc');
        assert.equal(Utility.getSinceLastBlockComments('\n\n   \n// // abc', '/\\*', '\\*/'), '\n\n   \n// // abc');
        assert.equal(Utility.getSinceLastBlockComments('\n\n */  \n*/ // abc', '/\\*', '\\*/'), '\n\n */  \n*/ // abc');
        assert.equal(Utility.getSinceLastBlockComments('\n/*\n \n  */ // abc', '/\\*', '\\*/'), ' // abc');
        assert.equal(Utility.getSinceLastBlockComments('\n/*\n \n  */\n// abc', '/\\*', '\\*/'), '\n// abc');
        assert.equal(Utility.getSinceLastBlockComments('\n/*\n \n  // */\n// abc', '/\\*', '\\*/'), '\n// abc');


        // Is inside a block comment
        assert.equal(Utility.getSinceLastBlockComments('/* abc', '/\\*', '\\*/'), undefined);
        assert.equal(Utility.getSinceLastBlockComments('/*a', '/\\*', '\\*/'), undefined);
        assert.equal(Utility.getSinceLastBlockComments('/* *//* */ /**//* abc', '/\\*', '\\*/'), undefined);
        // Multiline
        assert.equal(Utility.getSinceLastBlockComments('/*\n*/\n/*\n\na', '/\\*', '\\*/'), undefined);
        assert.equal(Utility.getSinceLastBlockComments('/*\n */ abc', '/\\*', '\\*/'), ' abc');
        assert.equal(Utility.getSinceLastBlockComments('/*\n */\n abc', '/\\*', '\\*/'), '\n abc');
        assert.equal(Utility.getSinceLastBlockComments('\n\n\n', '/\\*', '\\*/'), '\n\n\n');
        assert.equal(Utility.getSinceLastBlockComments('/* \n*/\n abc', '/\\*', '\\*/'), '\n abc');
        assert.equal(Utility.getSinceLastBlockComments('/* \n*/\n/*  */ abc', '/\\*', '\\*/'), ' abc');
        assert.equal(Utility.getSinceLastBlockComments('/* \n*/\n/*\n*/\n abc', '/\\*', '\\*/'), '\n abc');
    });
});
