var path = require('./path');

console.log(require('util').inspect(path.parse('M120,120 h25 a25,25 0 1,0 -25,25 z'), false, 50));