const {test}=require('node:test');const assert=require('node:assert/strict');
const {parseCSV,validate}=require('../docs/engine.js');
test('CSV handles escaped quotes, commas, multiline and CRLF',()=>assert.deepEqual(parseCSV('a,b\r\n1,"hello, \"\"world\"\"\nnext"'),[['a','b'],['1','hello, "world"\nnext']]));
test('CSV rejects unclosed quotes',()=>assert.throws(()=>parseCSV('a,b\n1,"two')));
test('CSV rejects junk after closing quote',()=>assert.throws(()=>parseCSV('a,b\n1,"two"x')));
test('Empty source fails',()=>assert.throws(()=>validate('')));
test('2 MB limit is enforced',()=>assert.throws(()=>validate('x'.repeat(2*1024*1024+1))));
