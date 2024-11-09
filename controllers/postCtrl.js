const { Types: { ObjectId } } = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const pLimit = require('p-limit');
const Posts = require('../models/postModel');
const POST = require('../consts/post');

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
				format: 'webp',
			},
			function onEnd(error, result) {
				if (error) return reject(error);
				resolve(result);
			}
		).end(buffer);
	});
};

const limit = pLimit(5);

const isObjectId = v => /^[0-9a-fA-F]{24}$/.test(v);

const fieldHandler = {
	post: ([ field, value ]) => {
		const VALIDATIONS = {
			title: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "El titulo de la obra es obligatorio."
				};
	
				if (value.length > 50) return {
					status: 400,
					success: false,
					content: "El titulo excede los 50 caracteres de longitud."
				};
			},
			description: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "La descripción de la obra es obligatoria."
				};
	
				if (value.length > 5000) return {
					status: 400,
					success: false,
					content: "La descripción excede los 5000 caracteres de longitud."
				};
			},
			tags: value => {
				if (!value?.length) return {
					status: 400,
					success: false,
					content: "Al menos una etiqueta es obligatoria."
				};
	
				if (!value.every(tag => tag.length && POST.tags.includes(tag))) return {
					status: 400,
					success: false,
					content: `La etiqueta es inválida.`
				};
			},
			images: value => {
				if (!value?.length) return {
					status: 400,
					success: false,
					content: "Al menos una imagen es obligatoria."
				};
			}
		};
	
		return VALIDATIONS[field](value);
	},
	rating: ([ field, value ]) => {
		const VALIDATIONS = {
			comment: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "El comentario de la reseña es obligatorio."
				};
	
				if (value.length > 600) return {
					status: 400,
					success: false,
					content: "El comentario excede los 600 caracteres de longitud."
				};
			},
			value: value => {
				if (!value) return {
					status: 400,
					success: false,
					content: "La puntuación de la reseña es obligatoria."
				};
	
				if (typeof value === 'string' || value < 0.5 || value > 5) return {
					status: 400,
					success: false,
					content: "La puntuación es inválida."
				};
			},
		};
	
		return VALIDATIONS[field](value);
	}
};

const SORT = {
	asc: 1,
	desc: -1
};

const queryToRegex = query => {
	try {
		return new RegExp(`${ query.split(' ').map(w => `(?=.*?\\b${ w })`).join('') }.*`);
	} catch (error) {
		return query;
	};
};

const postCtrl = {
	getById: async (req, res) => {
		try {
			const { post_id } = req.params;

			if (!isObjectId(post_id)) return res.json({
				status: 400,
				success: false,
				content: "Página no encontrada."
			});

			const [ post ] = await Posts.aggregate([
				{
					$match: {
						_id: new ObjectId(post_id)
					}
				},
				{
					$lookup: {
						from: 'users',
						let: { authorID: '$author' },
						pipeline: [
							{
								$match: {
									$expr: { $eq: [ '$_id', '$$authorID' ] }
								}
							},
							{
								$project: { contact: 0, email: 0, password: 0, role: 0, createdAt: 0, updatedAt: 0, __v: 0 }
							}
						],
						as: 'author'
					}
				},
				{
					$unwind: '$author'
				},
				{
					$lookup: {
						from: 'users',
						let: {
							ratings: '$ratings'
						},
						pipeline: [
							{
								$match: {
									$expr: { $in: [ '$_id', '$$ratings.author' ] }
								}
							},
							{
								$addFields: {
									timestamp: {
										$getField: {
											field: 'timestamp',
											input: {
												$arrayElemAt: [
													"$$ratings",
													{
														$indexOfArray: [
															"$$ratings.author",
															"$_id"
														]
													}
												]
											}
										}
									}
								}
							},
							{
								$sort: { timestamp: -1 }
							},
							{
								$project: { email: 0, password: 0, role: 0, createdAt: 0, updatedAt: 0, __v: 0, timestamp: 0 }
							}
						],
						as: 'authors'
					}
				},
				{
					$addFields: {
						ratings: {
							$map: {
								input: "$authors",
								in: {
									$mergeObjects: [
										{
											$arrayElemAt: [
												"$ratings",
												{
													$indexOfArray: [
														"$ratings.author",
														"$$this._id"
													]
												}
											]
										},
										{
											author: "$$this"
										}
									]
								}
							}
						},
						rating: {
							$ifNull: [ { $avg: "$ratings.value" }, 0 ]
						},
						authors: "$$REMOVE"
					}
				},
				{
					$project: {
						_id: 0,
						updatedAt: 0,
						__v: 0
					}
				}
			]);

			if (!post) return res.json({
				status: 400,
				success: false,
				content: "Página no encontrada."
			});

			return res.json({
				status: 200,
				success: true,
				content: post
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
	getPosts: async (req, res) => {
		try {
			const queries = req.query;
			const limit = parseInt(queries?.limit) || 20;
			const page = parseInt(queries?.page) || 1;
			const sort = SORT[queries?.sort] || -1;
			const search = queries?.search?.trim() || "";

			const [ posts ] = await Posts.aggregate([
				{
					$match: {
						...(
							search ?
								{
									$expr: {
										$regexMatch: {
											input: {
												$concat: [
													"$title",
													" ",
													{
														$reduce: {
															input: "$tags",
															initialValue: "",
															in: {
																$concat: [
																	"$$value",
																	" ",
																	"$$this"
																]
															}
														}
													}
												]
											},
											regex: queryToRegex(search),
											options: "ix"
										}
									}
								}
							:
								{}
						)
					}
				},
				{
					$facet: {
						docs: [
							{
								$lookup: {
									from: 'users',
									let: { authorID: '$author' },
									pipeline: [
										{
											$match: {
												$expr: { $eq: [ '$_id', '$$authorID' ] }
											}
										},
										{
											$project: { _id: 0, contact: 0, email: 0, password: 0, role: 0, createdAt: 0, updatedAt: 0, __v: 0 }
										}
									],
									as: 'author'
								}
							},
							{
								$unwind: '$author'
							},
							{
								$addFields: {
									rating: {
										$ifNull: [ { $avg: "$ratings.value" }, 0 ]
									}
								}
							},
							{
								$project: {
									rating: 0,
									ratings: 0,
									tags: 0,
									updatedAt: 0,
									__v: 0
								}
							},
							{
								$sort: {
									createdAt: sort
								}
							},
							{ $skip: page * limit - limit },
							{ $limit: limit }
						],
						count: [
							{ $count: "qty" }
						]
					}
				},
				{
					$project: {
						docs: 1,
						qty: {
							$ifNull: [ { $first: "$count.qty" }, 0 ]
						}
					}
				}
			]);

			if (posts?.qty < 1) return res.json({
				status: 400,
				success: false,
				content: "No hay obras disponibles."
			});

			return res.json({
				status: 200,
				success: true,
				content: posts
			});
		} catch (err) {
			const { message } = err;

			return res.json({
				status: 500,
				success: false,
				content: "No hay obras disponibles."
			});
		};
	},
	createPost: async (req, res) => {
		try {
			const { title, description, tags } = req.body;

			const parsedTags = JSON.parse(tags || "[]");

			if (!title) return res.json({
				status: 400,
				success: false,
				content: "El titulo de la obra es obligatorio."
			});

			if (title.length > 50) return res.json({
				status: 400,
				success: false,
				content: "El titulo excede los 50 caracteres de longitud."
			});

			if (!description) return res.json({
				status: 400,
				success: false,
				content: "La descripción de la obra es obligatoria."
			});

			if (description.length > 5000) return res.json({
				status: 400,
				success: false,
				content: "La descripción excede los 5000 caracteres de longitud."
			});
		
			if (!parsedTags?.length) return res.json({
				status: 400,
				success: false,
				content: "Al menos una etiqueta es obligatoria."
			});

			if (!parsedTags.every(tag => tag.length && POST.tags.includes(tag))) return res.json({
				status: 400,
				success: false,
				content: `La etiqueta es inválida.`
			});

			if (!req.files.images?.length) return res.json({
				status: 400,
				success: false,
				content: "Al menos una imagen es obligatoria."
			});

			const imgToUpload = req.files.images.map(img =>
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

			const post = {
				title,
				description,
				tags: parsedTags,
				images: images,
				author: req.user.id
			};

			const newPost = new Posts(post);

			await newPost.save();

			return res.json({
				status: 200,
				success: true,
				content: newPost
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
	deletePost: async (req, res) => {
		try {
			const { post_id } = req.params;
			const userId = req.user.id;

			if (!isObjectId(post_id)) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const post = await Posts.findOneAndDelete({ _id: post_id, author: userId });

			if (!post) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const imgToDelete = post.images.map(({ public_id }) =>
				limit(async () => {
					await cloudinary.uploader.destroy(public_id);
				})
			);

			await Promise.all(imgToDelete);

			return res.json({
				status: 200,
				success: true,
				content: "Obra eliminada exitosamente."
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
	editPost: async (req, res) => {
		try {
			const { post_id } = req.params;
			const userId = req.user.id;

			if (!isObjectId(post_id)) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const post = await Posts.findOne({ _id: post_id, author: userId });

			if (!post) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const fields = Object.entries({
				...req.body,
				...req.files
			})
			.filter(([ _, value ]) => value)
			.map(([ key, value ]) => {
				if (key === 'tags') return [ key, JSON.parse(value || "[]") ];
				return [ key, value ];
			});

			if (!fields.length) return res.json({
				status: 400,
				success: false,
				content: "No hay campos por actualizar."
			});

			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];

				const error = fieldHandler.post(field);

				if (error) return res.json(error);

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

					const imgToDelete = post.images.map(({ public_id }) =>
						limit(async () => {
							await cloudinary.uploader.destroy(public_id);
						})
					);
		
					await Promise.all(imgToDelete);
					
					post[key] = images;
					continue;
				};

				post[key] = value;
			};

			await post.save();

			return res.json({
				status: 200,
				success: true,
				content: post
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
	ratePost: async (req, res) => {
		try {
			const { post_id } = req.params;
			const userId = req.user.id;

			if (!isObjectId(post_id)) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const post = await Posts.findOne({ _id: post_id });

			if (!post) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			if (post.ratings.find(({ author }) => author.equals(userId)) || post.author.equals(userId)) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			})

			const fields = Object.entries({
				...req.body
			});

			if (fields.length !== 2) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida."
			});

			const rating = {};

			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];

				const error = fieldHandler.rating(field);

				if (error) return res.json(error);

				const [ key, value ] = field;

				rating[key] = value;
			};

			post.ratings.push({
				author: userId,
				...rating,
				timestamp: new Date().toISOString()
			});

			await post.save();

			return res.json({
				status: 200,
				success: true,
				content: post
			});
		} catch (err) {
			const { message } = err;

			return res.json({
				status: 500,
				success: false,
				content: message
			});
		};
	}
};

module.exports = postCtrl;