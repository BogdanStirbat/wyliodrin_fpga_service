function createRandomString(n) {
	var text = '';
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i=0; i<n; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

exports.createRandomString = createRandomString;