/*********************** Database   
		 Petitions***********************/
const spicedPg = require('spiced-pg');
var db = spicedPg(
	process.env.DATABASE_URL ||
		'postgres:postgres:postgres@localhost:5432/petitions'
);
/*********************** Any   
		 Requirements***********************/

const other = require('./other');

/*********************** get  
		 Register***********************/
module.exports.getRegister = (first, last, email, password) => {
	return db.query(
		`INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id;`,
		[first, last, email, password]
	);
};
/*********************** get  
		 Login***********************/

module.exports.getLogin = (email) => {
	return db.query(`SELECT * FROM users WHERE email = $1;`, [email]);
};

/*********************** get  
		 Signature***********************/
module.exports.getSignatures = (id) => {
	return db.query(`SELECT id FROM signatures WHERE user_id = $1;`, [id]);
};
/*********************** get  
		Display***********************/
module.exports.getDisplay = (user_id) => {
	return db
		.query(
			`SELECT users.first AS user_firstname, users.last AS user_lastname, users.email AS user_email, user_profiles.age AS user_age, user_profiles.city AS user_city, user_profiles.url AS user_url
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1;`,
			[user_id]
		)
		.then((result) => {
			return other.getData(result.rows);
		})
		.catch((err) => {
			console.log('Error in displayInfo in db.js: ', err);
		});
};
/*********************** get  
		update***********************/
module.exports.getUpdate = (first, last, email, password, id) => {
	return db.query(
		`UPDATE users SET first = $1, last = $2, email = $3, password = $4 WHERE id = $5;`,
		[first, last, email, password, id]
	);
};
/*********************** get  
		ProfileInfo***********************/
module.exports.getProfileInfo = (age, city, url, user_id) => {
	return db.query(
		`INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3;`,
		[other.getAge(age), city, other.getUrl(url), user_id]
	);
};

module.exports.getUpdateInfo = (first, last, email, id) => {
	return db.query(
		`UPDATE users SET first = $1, last = $2, email = $3 WHERE id = $4;`,
		[first, last, email, id]
	);
};

/*********************** get  
		Access***********************/
module.exports.getAccess = (signature, user_id) => {
	return db.query(
		`INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id;`,
		[signature, user_id]
	);
};

/*********************** get  
		signatures***********************/
module.exports.getSignature = (id) => {
	return db
		.query(`SELECT signature FROM signatures WHERE id = $1;`, [id])
		.then((result) => {
			return result.rows[0].signature;
		});
};

/*********************** get  
		Signers***********************/
module.exports.getSigners = () => {
	return db.query(`SELECT COUNT(*) FROM signatures;`).then((results) => {
		return results.rows[0].count;
	});
};
/*********************** get  
		PArtners***********************/
module.exports.getPartners = () => {
	return db.query(`SELECT first, last FROM signatures;`);
};

/*********************** get  
		Support***********************/
module.exports.getSupport = () => {
	return db.query(`
        SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        JOIN signatures
        ON user_profiles.user_id = signatures.user_id;
    `);
};
/*********************** get  
		City***********************/
module.exports.getCity = (city) => {
	return db.query(
		`
        SELECT users.first AS user_firstName, users.last AS user_lastName, user_profiles.age AS user_age, user_profiles.city AS user_city, user_profiles.url AS user_url
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        JOIN signatures
        ON user_profiles.user_id = signatures.user_id
        WHERE LOWER(user_profiles.city) = LOWER($1);
        `,
		[city]
	);
};
/*********************** get  
		delete***********************/
module.exports.getDelete = (user_id) => {
	return db.query(`DELETE FROM signatures WHERE user_id = $1;`, [user_id]);
};
