module.exports.getUrl = (url) => {
	if (
		url != '' &&
		!url.startsWith('http://') &&
		!url.startsWith('https://')
	) {
		return null;
	} else {
		return url;
	}
};

module.exports.getData = (dataArrObj) => {
	const dataObj = {
		first: dataArrObj[0].user_firstname,
		last: dataArrObj[0].user_lastname,
		email: dataArrObj[0].user_email,
		age: dataArrObj[0].user_age,
		city: dataArrObj[0].user_city,
		url: dataArrObj[0].user_url,
	};
	return dataObj;
};
module.exports.getAge = (age) => {
	if (age == '') {
		return null;
	} else {
		return age;
	}
};
