const Users = require('../models/userModel');

const isAdmin = async (req, res, next) => {
	try {
		const user = await Users.findById(req.user.id);

		if (user.role !== 0) return res.status(400).json({
			msg: "Admin resources access denied."
		});

		next();
	} catch (err) {
		return res.status(500).json({ msg: err.message });
	};
};

module.exports = isAdmin;