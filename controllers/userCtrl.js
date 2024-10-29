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

const igUrlRegex = /^(?:(?:https|http):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)/;
const igUrlValidRegex = /^(?:(?:https|http):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_.]+)$/i;
const igUsernameRegex = /^[0-9a-zA-Z_.]+$/;

const ttkUrlRegex = /^(?:(?:https|http):\/\/)?(?:www\.)?tiktok\.com/;
const ttkUrlValidRegex = /^(?:(?:https|http):\/\/)?(?:www\.)?tiktok\.com\/([A-Za-z0-9-_.]+)$/i;
const ttkUsernameRegex = /^[0-9a-zA-Z_.]+$/;

const fbUrlRegex = /^(?:(?:https|http):\/\/)?(?:(?:www|m|mobile|touch|mbasic).)?(?:facebook\.com|fb(?:\.me|\.com))/;
const fbUrlValidRegex = /^(?:(?:https|http):\/\/)?(?:(?:www|m|mobile|touch|mbasic).)?(?:facebook\.com|fb(?:\.me|\.com))\/(?!$)(?:(?:\w)*#!\/)?(?:pages\/|pg\/)?(?:photo\.php\?fbid=)?(?:[\w\-]*\/)*?(?:\/)?(profile\.php\?id=[^\/?&\s]*|[^\/?&\s]*)?(?:\/|&|\?)?.*/;
const fbUsernameRegex = /^[0-9a-zA-Z.]+$/;

const ttUrlRegex = /^(?:(?:https|http):\/\/)?(?:www\.)?twitter\.com/;
const ttUrlValidRegex = /^(?:(?:https|http):\/\/)?(?:www\.)?twitter\.com\/([0-9a-zA-Z_]+)$/i;
const ttUsernameRegex = /^[0-9a-zA-Z_]+$/;

const isIgUrl = v => igUrlRegex.test(v);
const isIgUrlValid = v => igUrlValidRegex.test(v);
const isIgValid = v => igUsernameRegex.test(v);

const isTTkUrl = v => ttkUrlRegex.test(v);
const isTTkUrlValid = v => ttkUrlValidRegex.test(v);
const isTTkValid = v => ttkUsernameRegex.test(v);

const isFbUrl = v => fbUrlRegex.test(v);
const isFbUrlValid = v => fbUrlValidRegex.test(v);
const isFbValid = v => fbUsernameRegex.test(v);

const isTtUrl = v => ttUrlRegex.test(v);
const isTtUrlValid = v => ttUrlValidRegex.test(v);
const isTtValid = v => ttUsernameRegex.test(v);

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

			const user = await Users.findOne({ email: email.toLowerCase() });
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
				email: email.replaceAll(' ', '').trim().toLowerCase(),
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

			const user = await Users.findOne({ email: email.toLowerCase() });

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
				httpOnly: false,
				// secure: true,
				sameSite: 'lax',
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

				if (key === 'contact') {
					const parsedContacts = JSON.parse(value);

					for (const contact in parsedContacts) {
						const value = parsedContacts[contact];
						
						if (contact === 'instagram' && value.length) {
							if (isIgUrl(value) && !isIgUrlValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El Enlace de Instagram es inválido'
							});

							if (!isIgUrl(value) && !isIgValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Instagram contiene caracteres inválidos'
							});

							if (isIgValid(value) && value[0] === '.' || value[ value.length - 1 ] === '.') return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Instagram no puede empezar ni terminar con un "."'
							});

							if (isIgValid(value) && !isNaN(Number(value))) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Instagram no puede tener solo números'
							});

							if (value.length < 4) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario o enlace de Instagram debe tener al menos 4 caracteres'
							});

							if (value.length > 116) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario o enlace de Instagram excede el límite de 116 caracteres'
							});

							parsedContacts.instagram =
								isIgUrl(value) && isIgUrlValid(value) ?
									`https://www.instagram.com/${ value.match(igUrlValidRegex)[1] }`
								:
									`https://www.instagram.com/${ value }`;
						};
						
						if (contact === 'tiktok' && value.length) {
							if (isTTkUrl(value) && !isTTkUrlValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El Enlace de TikTok es inválido'
							});

							if (!isTTkUrl(value) && !isTTkValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de TikTok contiene caracteres inválidos'
							});

							if (isTTkValid(value) && value[ value.length - 1 ] === '.') return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de TikTok no puede terminar con un "."'
							});

							if (isTTkValid(value) && !isNaN(Number(value))) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de TikTok no puede tener solo números'
							});

							if (value.length < 4) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario o enlace de TikTok debe tener al menos 4 caracteres'
							});

							if (value.length > 116) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario o enlace de TikTok excede el límite de 116 caracteres'
							});

							parsedContacts.tiktok =
								isTTkUrl(value) && isTTkUrlValid(value) ?
									`https://www.tiktok.com/${ value.match(ttkUrlValidRegex)[1] }`
								:
									`https://www.tiktok.com/${ value }`;
						};
						
						if (contact === 'facebook' && value.length) {
							if (isFbUrl(value) && !isFbUrlValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El Enlace de Facebook es inválido'
							});

							if (!isFbUrl(value) && !isFbValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Facebook contiene caracteres inválidos'
							});

							if (value.length < 5) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Facebook debe tener al menos 5 caracteres'
							});

							if (value.length > 116) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Facebook excede el límite de 116 caracteres'
							});

							parsedContacts.facebook =
								isFbUrl(value) && isFbUrlValid(value) ?
									`https://www.facebook.com/${ value.match(fbUrlValidRegex)[1] }`
								:
									`https://www.facebook.com/${ value }`;
						};
						
						if (contact === 'twitter' && value.length) {
							if (isTtUrl(value) && !isTtUrlValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El Enlace de Twitter es inválido'
							});

							if (!isTtUrl(value) && !isTtValid(value)) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Twitter contiene caracteres inválidos'
							});

							if (isTtValid(value) && !isNaN(Number(value))) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario de Twitter no puede tener solo números'
							});

							if (value.length < 5) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario o enlace de Twitter debe tener al menos 5 caracteres'
							});

							if (value.length > 116) return res.json({
								status: 400,
								success: false,
								content: 'El nombre de usuario o enlace de Twitter excede el límite de 116 caracteres'
							});

							parsedContacts.twitter =
								isTtUrl(value) && isTtUrlValid(value) ?
									`https://www.twitter.com/${ value.match(ttUrlValidRegex)[1] }`
								:
									`https://www.twitter.com/${ value }`;
						};

						if (contact === 'email' && value.length) {
							parsedContacts.email = value.replaceAll(' ', ' ').trim().toLowerCase();
						};
					};

					user.contact = parsedContacts;
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

			const userFound = await Users.findOne({ email: email.toLowerCase() });

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

			user.email = email.toLowerCase();

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