const supertest = require('supertest');
const { app } = require('./index');
const cookieSession = require('cookie-session');

test('Users who are logged out are redirected to the registration page when they attempt to go to the petition page', () => {
	//this code makes the request to our server
	return (
		supertest(app)
			.get('/petition')
			//.then receives the response from our server
			.then((res) => {
				//res is the response we receive from our server
				// console.log('response from the server: ', res);
				//3 most commonly used properties of res are:
				/**
				 * 1- status code
				 * 2- text - html of the response
				 * 3-header - any head we are send as part of the response
				 */
				expect(res.statusCode).toBe(302);
				expect(res.text).toBe('go to reg');
			})
	);
});

// npm test
// interested in
