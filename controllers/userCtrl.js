const { v2: cloudinary } = require('cloudinary');
const pLimit = require('p-limit');
const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET
});

const uploadStreamAsync = buffer => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload_stream(
			{
				folder: 'ArtGallery - Photos',
				resource_type: "image",
				transformation: {
					width: 240,
					height: 240,
					crop: "lfill",
					quality: 90
				},
				format: 'webp',
			},
			function onEnd(error, result) {
				if (error) return reject(error);
				resolve(result);
			}
		).end(buffer);
	});
};

const limit = pLimit(1);

const validUsername = v => /^[0-9a-zA-ZÁÉÍÓÚáéíóúñÑ_-]+$/.test(v);

const fieldHandler = {
	user: ([ field, value ]) => {
		const VALIDATIONS = {
			names: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "Los nombres son obligatorios."
				};
	
				if (value.length < 3) return {
					status: 400,
					success: false,
					content: "El campo de nombres debe tener como mínimo 3 caracteres de longitud."
				};
	
				if (value.length > 35) return {
					status: 400,
					success: false,
					content: "El campo de nombres debe tener como máximo 35 caracteres de longitud."
				};
			},
			lastnames: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "Los apellidos son obligatorios."
				};
	
				if (value.length < 3) return {
					status: 400,
					success: false,
					content: "El campo de apellidos debe tener como mínimo 3 caracteres de longitud."
				};
	
				if (value.length > 25) return {
					status: 400,
					success: false,
					content: "El campo de apellidos debe tener como máximo 25 caracteres de longitud."
				};
			},
			username: value => {
				if (value.length < 3) return {
					status: 400,
					success: false,
					content: "El nombre de usuario debe tener como mínimo 3 caracteres de longitud."
				};
	
				if (value.length > 63) return {
					status: 400,
					success: false,
					content: "El nombre de usuario debe tener como máximo 63 caracteres de longitud."
				};
	
				if (!isNaN(Number(value))) return {
					status: 400,
					success: false,
					content: "El nombre de usuario no debe tener solo dígitos."
				};
	
				if (!isNaN(Number(value[0]))) return {
					status: 400,
					success: false,
					content: "El nombre de usuario no debe empezar con un dígito."
				};
	
				if (value[0] === '-' || value[ value.length - 1 ] === '-') return {
					status: 400,
					success: false,
					content: 'El nombre de usuario no debe empezar ni terminar con un "-".'
				};
	
				if (value[0] === '_' || value[ value.length - 1 ] === '_') return {
					status: 400,
					success: false,
					content: 'El nombre de usuario no debe empezar ni terminar con un "_".'
				};

				if (!validUsername(value)) return res.json({
					status: 400,
					success: false,
					content: 'El nombre de usuario solo puede tener letras, números, guiones y guiones bajos.'
				});
			},
			headline: value => {
				if (!value.length) return;

				if (value.length < 3) return {
					status: 400,
					success: false,
					content: "El título profesional debe tener como mínimo 3 caracteres de longitud."
				};

				if (value.length > 60) return {
					status: 400,
					success: false,
					content: "El título profesional debe tener como máximo 60 caracteres de longitud."
				};
			},
			summary: value => {
				if (value.length > 128) return {
					status: 400,
					success: false,
					content: "El resumen excede los 128 caracteres de longitud."
				};
			},
			email: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "El correo electrónico es requerido."
				};
			}
		};
	
		return VALIDATIONS[field](value);
	}
};

const userCtrl = {
	register: async (req, res) => {
		try {
			const { names, lastnames, username, email, password } = req.body;

			if (names.length < 3) return res.json({
				status: 400,
				success: false,
				content: "El campo de nombres debe tener como mínimo 3 caracteres de longitud."
			});

			if (names.length > 35) return res.json({
				status: 400,
				success: false,
				content: "El campo de nombres puede tener como máximo 35 caracteres de longitud."
			});

			if (lastnames.length < 3) return res.json({
				status: 400,
				success: false,
				content: "El campo de apellidos debe tener como mínimo 3 caracteres de longitud."
			});

			if (lastnames.length > 25) return res.json({
				status: 400,
				success: false,
				content: "El campo de apellidos puede tener como máximo 25 caracteres de longitud."
			});

			if (username.length < 3) return res.json({
				status: 400,
				success: false,
				content: "El nombre de usuario debe tener como mínimo 3 caracteres de longitud."
			});

			if (username.length > 63) return res.json({
				status: 400,
				success: false,
				content: "El nombre de usuario puede tener como máximo 63 caracteres de longitud."
			});

			if (username.includes(' ')) return res.json({
				status: 400,
				success: false,
				content: "El nombre de usuario solo puede tener como máximo 63 caracteres de longitud."
			})

			if (!isNaN(Number(username))) return res.json({
				status: 400,
				success: false,
				content: "El nombre de usuario no debe tener solo números."
			});

			if (!isNaN(Number(username[0]))) return res.json({
				status: 400,
				success: false,
				content: "El nombre de usuario no debe empezar con un número."
			});

			if (username[0] === '-' || username[ username.length - 1 ] === '-') return res.json({
				status: 400,
				success: false,
				content: 'El nombre de usuario no debe empezar ni terminar con un "-".'
			});

			if (username[0] === '_' || username[ username.length - 1 ] === '_') return res.json({
				status: 400,
				success: false,
				content: 'El nombre de usuario no debe empezar ni terminar con un "_".'
			});

			if (!validUsername(username)) return res.json({
				status: 400,
				success: false,
				content: 'El nombre de usuario solo puede tener letras, números, guiones y guiones bajos.'
			});

			const usernameExist = await Users.findOne({ username });
			if (usernameExist) return res.json({
				status: 400,
				success: false,
				content: "El nombre de usuario ya existe."
			});

			if (!email) return res.json({
				status: 400,
				success: false,
				content: "El correo electrónico es requerido."
			});

			const user = await Users.findOne({ email });
			if (user) return res.json({
				status: 400,
				success: false,
				content: "El correo electrónico ya existe."
			});

			if (password.length < 6) return res.json({
				status: 400,
				success: false,
				content: "La contraseña debe tener como mínimo 6 caracteres de longitud."
			});

			const passwordHash = await bcrypt.hash(password, 11);

			const data = {
				names: names.replaceAll('  ', ' ').trim(),
				lastnames: lastnames.replaceAll('  ', ' ').trim(),
				username: username.replaceAll(' ', '').trim(),
				email: email.replaceAll(' ', ' ').trim(),
				password: passwordHash,
				role: 1
			};
			
			const newUser = new Users(data);

			await newUser.save();

			return res.json({
				status: 200,
				success: true,
				content: "Se ha registrado exitosamente."
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	login: async (req, res) => {
		try {
			const { email, password } = req.body;

			if (!email) return res.json({
				status: 400,
				success: false,
				content: "Correo requerido."
			});

			if (!password) return res.json({
				status: 400,
				success: false,
				content: "Contraseña requerida."
			});

			const user = await Users.findOne({ email });

			if (!user) return res.json({
				status: 400,
				success: false,
				content: "Datos incorrectos."
			});

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) return res.json({
				status: 400,
				success: false,
				content: "Datos incorrectos."
			});

			const refreshToken = createRefreshToken({ id: user._id });

			res.cookie('e229146b1984cd62e322005c53468c', refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'Strict',
				path: '/user/e229146b1984cd62e322005c53468c',
				expires: new Date(Date.now() + (400 * 24 * 3600000))
			});

			return res.json({
				status: 200,
				success: true
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	logout: async (req, res) => {
		try {
			res.clearCookie('e229146b1984cd62e322005c53468c', {
				path: '/user/e229146b1984cd62e322005c53468c'
			});

			return res.json({
				status: 200,
				success: true,
				content: "Logged out, cookies cleared."
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	refreshToken: async (req, res) => {
		try {
			const rf_token = req.cookies["e229146b1984cd62e322005c53468c"];
			if (!rf_token) {
				const error = {
					status: 400,
					success: false,
					content: "Please login or register."
				};

				console.error(error);
				return res.json(error);
			};
	
			jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
				if (err) {
					const error = {
						status: 400,
						success: false,
						content: "Please login or register."
					};
	
					console.error(error);
					return res.json(error);
				};

				const accessToken = createAccessToken({ id: user.id });

				res.json({
					status: 200,
					success: true,
					content: accessToken
				});
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	getInfo: async (req, res) => {
		try {
			const user = await Users.findById(req.user.id).select("-password -__v -updatedAt");
			if (!user) return res.json({
				status: 400,
				success: false,
				content: "El usuario no existe"
			});

			return res.json({
				status: 200,
				success: true,
				content: user
			});
		} catch (err) {
			const { message } = err;
			const error = {
				status: 500,
				success: false,
				content: message
			};
			return res.json(error);
		};
	},
	edit: async (req, res) => {
		try {
			const userId = req.user.id;

			const user = await Users.findById(userId);

			if (!user) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const fields = Object.entries({
				...req.body,
				...req.files
			});

			if (!fields.length) return res.json({
				status: 400,
				success: false,
				content: "No hay campos por actualizar."
			});

			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];

				const [ key, value ] = field;

				if (key === 'images') {
					const imgToUpload = value.map(img =>
						limit(async () => {
							const result = await uploadStreamAsync(img);
							const { public_id, secure_url } = result;
		
							return { public_id, url: secure_url };
						})
					);
		
					const images = await Promise.all(imgToUpload);
		
					if (!images.every(({ public_id }) => public_id)) {
						const imgToDelete = images.filter(({ public_id }) => public_id).map(({ public_id }) =>
							limit(async () => {
								await cloudinary.uploader.destroy(public_id);
							})
						);
		
						await Promise.all(imgToDelete);
		
						return res.json({
							status: 400,
							success: false,
							content: "No se pudieron subir las imágenes."
						});
					};
		
					if (user.photo?.public_id) await Promise.all([
						limit(async () => {
							await cloudinary.uploader.destroy(user.photo.public_id);
						})
					]);
					
					user.photo = images[0];
					continue;
				};

				const error = fieldHandler.user(field);

				if (error) return res.json(error);

				user[key] = value;
			};

			await user.save();

			return res.json({
				status: 200,
				success: true,
				content: user
			});
		} catch (err) {
			const { message } = err;

			return res.json({
				status: 500,
				success: false,
				content: message
			});
		};
	},
	updateEmail: async (req, res) => {
		try {
			const userId = req.user.id;

			const user = await Users.findById(userId);

			if (!user) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const { email, password } = req.body;

			if (!email) return res.json({
				status: 400,
				success: false,
				content: "El correo es obligatorio."
			});

			if (!password) return res.json({
				status: 400,
				success: false,
				content: "La contraseña es obligatoria."
			});

			const userFound = await Users.findOne({ email });

			if (userFound) return res.json({
				status: 400,
				success: false,
				content: "El correo electrónico ya existe."
			});

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) return res.json({
				status: 400,
				success: false,
				content: "Datos incorrectos."
			});

			user.email = email;

			await user.save();

			return res.json({
				status: 200,
				success: true,
				content: user
			});
		} catch (err) {
			const { message } = err;
			console.log(err);
			return res.json({
				status: 500,
				success: false,
				content: message
			});
		};
	}
};

const createAccessToken = user => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = user => {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = userCtrl;