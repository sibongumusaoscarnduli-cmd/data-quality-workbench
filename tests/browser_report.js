const fs=require('node:fs');
const {validate}=require('../docs/engine.js');
process.stdout.write(JSON.stringify(validate(fs.readFileSync(0,'utf8'))));
