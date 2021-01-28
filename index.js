/*********************** Requirement 
		   express  ***********************/
const express = require('express');
const app = express();
exports.app = app;
const db = require('./db');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const { hash, compare } = require('./bc');
/*********************** Engine 
		   handlebars  ***********************/
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
/*********************** Static 
		   Path  ***********************/
app.use(express.static('./public'));
/*********************** Middleware  
		   requirement***********************/
app.use(
	express.urlencoded({
		extended: false,
	})
);
/*********************** Cookie  
		   Session***********************/
app.use(
	cookieSession({
		secret: ` On my Way !`,
		maxAge: 1000 * 60 * 60 * 24 * 14,
	})
);
/*********************** Csurf  
		  Token***********************/
app.use(csurf());
app.use((req, res, next) => {
	res.set('X-Frame-Options', 'deny');
	res.locals.csrfToken = req.csrfToken();
	next();
});

/***********************
 ***********************/
/***********************
 ***********************/

/***********************
 ***********************/
/***********************
 ***********************/

/*********************** main  
		 route***********************/
app.get('/', (req, res) => {
	if (req.session.user) {
		console.log('Im going to the petition follow me');
		res.redirect('/petition');
	} else {
		console.log('Im going to the register follow me');
		res.redirect('/register');
	}
});
/*********************** Register  
		 get***********************/
app.get('/register', (req, res) => {
	if (req.session.user) {
		console.log('Im going to the petition follow me');
		res.redirect('/petition');
	} else {
		console.log('Im going to the register follow me');
		res.render('register');
	}
});
/*********************** Register  
		 Post***********************/
app.post('/register', (req, res) => {
	let first = req.body.first;
	let last = req.body.last;
	let email = req.body.email;
	let password = req.body.pw;
	console.log(password);
	if (first != '' && last != '' && email != '' && password != '') {
		hash(password)
			.then((hashPassword) => {
				console.log(hashPassword);
				return db.getRegister(first, last, email, hashPassword);
			})
			.then((results) => {
				console.log(results.rows[0].id, 'results');
				req.session.user = {
					first: first,
					last: last,
					userId: results.rows[0].id,
				};
				res.redirect('/profile');
			})
			.catch((err) => {
				console.log('Catching Error in the Registration');
				res.render('register');
			});
	} else {
		res.render('register');
	}
});

/*********************** login 
		 get***********************/
app.get('/login', (req, res) => {
	if (req.session.user) {
		res.redirect('/petition');
	} else {
		res.render('login');
	}
});
/*********************** login 
		 post***********************/
app.post('/login', (req, res) => {
	let password = req.body.pw;
	let email = req.body.email;
	let first;
	let last;
	let hashPassword;
	let id;
	req.session.user = {};
	console.log(req.session.user);
	db.getLogin(email)
		.then((results) => {
			//results.rows
			// id: 36,
			// first: 'name',
			// last: 'name',
			// email: 'email@email',
			//hashed password
			// password: '$2a$10$6WGSW0jqYCsGeZzT8oW1/u5tuioQKsl1XK8VWlVMz0tuEtsmst9M.',
			// created_at: timetone
			console.log('results : ', results.rows);

			// continue
			hashPassword = results.rows[0].password;
			id = results.rows[0].id;
			console.log('hashedPassword', hashPassword);
			console.log('the id ', id);
			first = results.rows[0].first;
			last = results.rows[0].last;
			return hashPassword;
		})
		.then((hashPassword) => {
			//We return the compared password and hashPassword
			//password: '$2a$10$6WGSW0jqYCsGeZzT8oW1/u5tuioQKsl1XK8VWlVMz0tuEtsmst9M.',
			return compare(password, hashPassword);
		})
		.then((ifMatch) => {
			if (ifMatch) {
				req.session.user = {
					// id: 36,
					// first: 'name',
					// last: 'name',
					fName: first,
					lName: last,
					userId: id,
				};
				console.log('They match');
				console.log(req.session.user.userId);
				return req.session.user.userId;
			} else if (!ifMatch) {
				console.log('They dont match');
				console.log("I'm going back to the login");
				res.render('login');
			}
		})
		.then((userId) => {
			//Setting the signatures now
			db.getSignatures(userId)
				.then((signatureId) => {
					//SIG ----> Thanks page
					if (signatureId.rows[0].id) {
						req.session.user.signatureId = signatureId.rows[0].id;
						console.log('You are going to thank you page');
						res.redirect('/thanks');
					} //NoSIG ----> petition page to resign it ..
					else if (!signatureId.rows[0].id) {
						console.log('You are going to the petition page');
						res.redirect('/petition');
					}
				})
				.catch((err) => {
					console.log('You still have an error in the Signature!');
				});
		})
		.catch((err) => {
			console.log('You are not logged in try another things');
			res.render('login');
			console.log('error', err);
		});
});

/*********************** profile 
		 get***********************/
app.get('/profile', (req, res) => {
	if (req.session.user) {
		res.render('profile');
		console.log('You are going to the profile page');
	} else {
		res.redirect('/register');
		console.log('You are going to the register page');
	}
});

/*********************** petition  
		post***********************/
app.post('/petition', (req, res) => {
	let signature = req.body.signature;
	console.log(signature);
	const { user } = req.session;
	if (signature != '') {
		db.getAccess(signature, user.userId)
			.then((results) => {
				user.signatureId = results.rows[0].id;
				console.log(user);
				console.log('You are going to the thanks page');
				res.redirect('/thanks');
			})
			.catch((error) => {
				console.log('ERROR in getACCESS');
			});
	} else if (signature == '') {
		res.render('petition');
	}
});

/*********************** petition 
		get***********************/

app.get('/petition', (req, res) => {
	if (req.session.user.signatureId) {
		console.log('You are going to the thank you page');
		res.redirect('/thanks');
	} else {
		console.log('You are going to the petition incase you signed');
		res.render('petition');
	}
});
/*********************** profile 
		post***********************/
app.post('/profile', (req, res) => {
	let age = req.body.age;
	let city = req.body.city;
	let url = req.body.url;
	const { user } = req.session;
	console.log(age, city, url);
	db.getProfileInfo(age, city, url, user.userId)
		.then(() => {
			console.log('You are going to the petition follow me ');
			res.redirect('/petition');
		})
		.catch((err) => {
			console.log('You are having problems', err);
			res.render('profile');
			console.log('you are going to the profile');
		});
});
/*********************** profile 
		Edit***********************/
app.get('/profile/edit', (req, res) => {
	const { user } = req.session;
	db.getDisplay(user.userId).then((results) => {
		console.log(results);
		res.render('edit', {
			results,
		});
	});
});
app.post('/profile/edit', (req, res) => {
	let first = req.body.first;
	let last = req.body.last;
	let email = req.body.email;
	let pw = req.body.pw;
	let age = req.body.age;
	let city = req.body.city;
	let url = req.body.url;
	const { user } = req.session;
	console.log(user);
	console.log(first, last, email, pw, age, city, url);
	if (pw != '') {
		hash(pw).then((hashPassword) => {
			Promise.all([
				db.getUpdate(first, last, email, hashPassword, user.userId),
				db.getProfileInfo(age, city, url, user.userId),
			])
				.then(() => {
					user.edit = true;
					console.log((user.firstName = first));
					user.firstName = first;
					console.log((user.lastName = last));
					user.lastName = last;
					console.log('I am going to the thanks page');
					res.redirect('/thanks');
				})
				.catch((error) => {
					console.log(error);
					db.displayInfo(user.userId)
						.then((results) => {
							results.error = true;
							res.render('edit', {
								results,
							});
						})
						.catch((error) => {
							console.log(error);
						});
				});
		});
	} else {
		Promise.all([
			db.getUpdateInfo(first, last, email, user.userId),
			db.getProfileInfo(age, city, url, user.userId),
		])
			.then(() => {
				user.edit = true;
				user.firstName = first;
				user.lastName = last;
				res.redirect('/thanks');
			})
			.catch((err) => {
				console.log('Error in partial update: ', err);

				db.displayInfo(user.userId)
					.then((results) => {
						results.error = true;
						res.render('edit', {
							results,
						});
					})
					.catch((err) => {
						console.log('Error in re-rendering /thanks: ', err);
					});
			});
	}
});

app.post('/thanks/delete', (req, res) => {
	db.getDelete(req.session.user.userId)
		.then(() => {
			// delete signature ID cookie
			delete req.session.user.signatureId;
			console.log('Redirecting go the petition');
			res.redirect('/petition');
		})
		.catch((error) => {
			console.log('Error in deleteSignature: ', err);
		});
});

/*
Thanks page
*/
app.get('/thanks', (req, res) => {
	const { user } = req.session;
	let supportNumber;
	console.log(user);
	console.log('everything under control');
	if (user.signatureId) {
		db.getSigners()
			.then((results) => {
				supportNumber = results;
				console.log(supportNumber);
			})
			.catch((err) => {
				console.log('error bitch');
			});
		db.getSignature(user.signatureId)
			.then((results) => {
				if (user.edit) {
					delete user.edit;
					res.render('thanks', {
						signature: results,
						number: supportNumber,
					});
				} else {
					console.log('thanks');
					res.render('thanks', {
						signature: results,
						number: supportNumber,
					});
				}
			})
			.catch((error) => {
				console.log('Catching errors in the thanks page');
			});
	} else {
		console.log('You are going to the petition to resign again');
		res.redirect('/petition');
	}
});
/*
Signers page
*/
app.get('/signers', (req, res) => {
	const { user } = req.session;
	console.log(user);
	if (user) {
		if (user.signatureId) {
			db.getSupport()
				.then((results) => {
					console.log(results.rows);
					return results.rows;
				})
				.then((results) => {
					res.render('signers', { people: results });
				})
				.catch((error) => {
					console.log('Error in getSupporters: ', error);
				});
		} else {
			// if no signature, back to signing!
			res.redirect('/petition');
		}
	} else {
		res.redirect('/register');
	}
});
console.log('db: ', db);

app.get('/signers/:city', (req, res) => {
	const { user } = req.session;
	console.log(user);
	if (user) {
		const city = req.params.city;
		console.log(city);
		db.getCity(city)
			.then((results) => {
				console.log(results.rows);
				return results.rows;
			})
			.then((results) => {
				res.render('city', { place: city, cityResults: results });
			})
			.catch((errors) => {
				console.log('There is an error');
			});
	} else {
		res.redirect('/register');
	}
});
app.get('/logout', (req, res) => {
	req.session = null;
	res.redirect('/login');
});
/*
listening
*/
if (require.main === module) {
	app.listen(process.env.PORT || 8080, () =>
		console.log('Petition server is listening')
	);
}
