const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
	try {
		const token = req.header("Authorization");
		
		if (!token) return res.status(400).json({ msg: `Invalid authentication in token verify, token = ${token}` });

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
			if (err) {
				return res.status(400).json({
					msg: `Invalid authentication in jwt.verify, token = ${token}`,
					error: err
				});
			};

			req.user = user;
			next();
		});

	} catch (err) {
		return res.status(500).json({ msg: err.message });
	};
};

module.exports = isAuth;