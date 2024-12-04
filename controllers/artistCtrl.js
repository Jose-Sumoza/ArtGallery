const Users = require('../models/userModel');

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

const artistCtrl = {
	getById: async (req, res) => {
		try {
			const { artist_id } = req.params;

			const [ artist ] = await Users.aggregate([
				{
					$match: {
						username: artist_id,
						role: 1
					}
				},
				{
					$lookup: {
						from: 'posts',
						let: { authorID: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: { $eq: [ "$author", "$$authorID" ] } ,
								}
							},
							{ $sort: { createdAt: -1 } },
							{
								$project: {
									author: 0,
									description: 0,
									ratings: 0,
									updatedAt: 0,
									__v: 0
								}
							}
						],
						as: 'posts'
					}
				},
				{
					$project: {
						_id: 0,
						password: 0,
						role: 0,
						updatedAt: 0,
						__v: 0
					}
				}
			]);

			if (!artist) return res.json({
				status: 400,
				success: false,
				content: "Artista no encontrado."
			});

			return res.json({
				status: 200,
				success: true,
				content: artist
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
	getArtists: async (req, res) => {
		try {
			const queries = req.query;
			const limit = parseInt(queries?.limit) || 20;
			const page = parseInt(queries?.page) || 1;
			const sort = SORT[queries?.sort] || -1;
			const search = queries?.search.trim() || "";

			const [ artists ] = await Users.aggregate([
				{
					$match: {
						role: 1,
						...(
							search ?
								{
									$expr: {
										$regexMatch: {
											input: {
												$concat: [
													"$names",
													" ",
													"$lastnames",
													" ",
													"$username"
												]
											},
											regex: queryToRegex(search),
											options: 'ix'
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
									from: 'posts',
									let: { authorID: '$_id' },
									pipeline: [
										{
											$match: {
												$expr: { $eq: [ "$author", "$$authorID" ] } ,
											}
										}
									],
									as: 'posts'
								}
							},
							{
								$match: {
									$expr: {
										$gt: [
											{ $size: "$posts" },
											0
										]
									}
								}
							},
							{
								$project: {
									posts: 0,
									email: 0,
									password: 0,
									role: 0,
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
							{
								$lookup: {
									from: 'posts',
									let: { authorID: '$_id' },
									pipeline: [
										{
											$match: {
												$expr: { $eq: [ "$author", "$$authorID" ] } ,
											}
										}
									],
									as: 'posts'
								}
							},
							{
								$match: {
									$expr: {
										$gt: [
											{ $size: "$posts" },
											0
										]
									}
								}
							},
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

			if (artists?.qty < 1) return res.json({
				status: 400,
				success: false,
				content: "No hay artistas disponibles."
			});

			return res.json({
				status: 200,
				success: true,
				content: artists
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

module.exports = artistCtrl;