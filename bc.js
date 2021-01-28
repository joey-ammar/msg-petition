const bcrypt = require('bcryptjs');
const { promisify } = require('util');

let { genSalt, hash, compare } = bcrypt;

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = (plainTxtPw) =>
	genSalt().then((salt) => hash(plainTxtPw, salt));
