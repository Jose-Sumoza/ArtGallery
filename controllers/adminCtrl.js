const { Types: { ObjectId } } = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const pLimit = require('p-limit');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const { Base64Encode } = require('base64-stream');
const { join } = require('path');
const canvas = require('canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Users = require('../models/userModel');
const Posts = require('../models/postModel');

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET
});

const limit = pLimit(5);

PDFDocument.prototype.addSVG = function (svg, x, y, options) {
	return SVGtoPDF(this, svg, x, y, options), this;
};

const emptyDoughnut = {
	id: 'emptyDoughnut',
	afterDraw(chart, args, options) {
		const { datasets } = chart.data;
		const { color, width, radiusDecrease } = options;
		let hasData = false;

		for (let i = 0; i < datasets.length; i += 1) {
			const dataset = datasets[i];
			hasData |= dataset.data.length > 0;
		}

		if (!hasData) {
			const { chartArea: { left, top, right, bottom }, ctx } = chart;
			const centerX = (left + right) / 2;
			const centerY = (top + bottom) / 2;
			const r = Math.min(right - left, bottom - top) / 2;

			ctx.beginPath();
			ctx.lineWidth = width;
			ctx.strokeStyle = color;
			ctx.arc(centerX - 8, r + 28, (r - radiusDecrease || 0), 0.5 * Math.PI, 2.5 * Math.PI);
			ctx.stroke();
		}
	}
};

const toBase64 = doc => {
    return new Promise((resolve, reject) => {
        try {
            const stream = doc.pipe(new Base64Encode());

            let base64Value = 'data:application/pdf;base64,';
            stream.on('data', chunk => {
                base64Value += chunk;
            });
            
            stream.on('end', () => {
                resolve(base64Value);
            });
        } catch (error) {
            reject(error);
        }
    });
};

const adminCtrl = {
	getReport: async (req, res) => {
		try {
			const day = new Date().toLocaleString('es-VE', { day: '2-digit' });
			const month = new Date().toLocaleString('es-VE', { month: 'long' });
			const year = new Date().toLocaleString('es-VE', { year: 'numeric' });
			const mm = `${month[0].toUpperCase()}${month.slice(1)}`;
			const newDate = `${day} de ${mm} de ${year}`;
			const time =  new Date().toLocaleTimeString('es-VE', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true,
				timeZone: 'America/Caracas'
			})
			.replace("p. m.", "PM")
			.replace("a. m.", "AM");

			const [ userStats ] = await Users.aggregate([
				{
					$match: {
						$expr: {
							$eq: [
								{ 
									$dayOfMonth: {
										date: "$createdAt",
										timezone: "America/Caracas"
									}
								},
								{
									$dayOfMonth: {
										date: "$$NOW",
										timezone: "America/Caracas"
									}
								}
							]
						}
					}
				},
				{
					$facet: {
						count: [
							{ $count: "total" }
						]
					}
				},
				{
					$project: {
						_id: 0,
						users: {
							registered: {
								$ifNull: [ { $first: "$count.total" }, 0 ]
							}
						}
					}
				}
			]);

			const [ postStats ] = await Posts.aggregate([
				{
					$facet: {
						total: [
							{
								$match: {
									$expr: {
										$eq: [
											{ 
												$dayOfMonth: {
													date: "$createdAt",
    												timezone: "America/Caracas"
												}
											},
											{
												$dayOfMonth: {
													date: "$$NOW",
    												timezone: "America/Caracas"
												}
											}
										]
									}
								}
							},
							{ $count: "total" }
						],
						reviewsTotal: [
							{
								$match: {
									$and: [
										{
											$expr: {
												$gt: [
													{ $size: "$ratings" },
													0
												]
											}
										},
										{
											$expr: {
												$in: [
													{
														$dayOfMonth: {
															date: "$$NOW",
															timezone: "America/Caracas"
														}
													},
													{
														$map: {
															input: "$ratings",
															as: "rating",
															in: {
																$dayOfMonth: {
																	date: "$$rating.timestamp",
																	timezone: "America/Caracas"
																}
															}
														}
													}
												]
											}
										}
									]
								}
							},
							{
								$group: {
									_id: null,
									total: {
										$sum: {
											$size: {
												$filter: {
													input: "$ratings",
													as: "rating",
													cond: {
														$eq: [
															{
																$dayOfMonth: {
																	date: "$$NOW",
																	timezone: "America/Caracas"
																}
															},
															{
																$dayOfMonth: {
																	date: "$$rating.timestamp",
																	timezone: "America/Caracas"
																}
															}
														]
													}
												}
											}
										}
									}
								}
							},
							{
								$project: {
									_id: 0
								}
							}
						],
						reviewed: [
							{
								$match: {
									$and: [
										{
											$expr: {
												$gt: [
													{ $size: "$ratings" },
													0
												]
											}
										},
										{
											$expr: {
												$in: [
													{
														$dayOfMonth: {
															date: "$$NOW",
															timezone: "America/Caracas"
														}
													},
													{
														$map: {
															input: "$ratings",
															as: "rating",
															in: {
																$dayOfMonth: {
																	date: "$$rating.timestamp",
																	timezone: "America/Caracas"
																}
															}
														}
													}
												]
											}
										}
									]
								}
							},
							{ $count: "total" }
						],
						tags: [
							{
								$match: {
									$expr: {
										$eq: [
											{
												$dayOfMonth: {
													date: "$createdAt",
    												timezone: "America/Caracas"
												}
											},
											{
												$dayOfMonth: {
													date: "$$NOW",
    												timezone: "America/Caracas"
												}
											}
										]
									}
								}
							},
							{
								$unwind: "$tags"
							},
							{
								$group: {
									_id: "$tags",
									count: { $sum: 1 }
								}
							},
							{
								$sort: {
									count: -1
								}
							},
							{
								$limit: 5
							},
							{
								$group: {
									_id: null,
									tags: {
										$push: {
											name: "$_id",
											count: "$count"
										}
									}
								}
							},
							{
								$project: {
									_id: 0
								}
							}
						]
					}
				},
				{
					$project: {
						posts: {
							total: {
								$ifNull: [ { $first: "$total.total" }, 0 ]
							},
							reviews: {
								total: {
									$ifNull: [ { $first: "$reviewsTotal.total" }, 0 ]
								},
								reviewed: {
									$ifNull: [ { $first: "$reviewed.total" }, 0 ]
								}
							},
							tags: {
								$ifNull: [ { $first: "$tags.tags" }, [] ]
							}
						}
					}
				}
			]);

			const reportData = {
				...userStats,
				...postStats
			};

			const { users, posts } = reportData;
			const { total, reviews, tags } = posts;

			const RobotoURL = join(__dirname, '../assets', 'fonts', 'Roboto-Regular.ttf');
			const RobotoBlackURL = join(__dirname, '../assets', 'fonts', 'Roboto-Black.ttf');

			const PaletteSVG = '<svg viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,512.000000) scale(0.1,-0.1)" fill="#141c24" stroke="none"><path d="M2200 4130 c-348 -36 -778 -159 -1075 -308 -165 -82 -402 -259 -541 -403 -251 -260 -364 -520 -364 -834 0 -201 47 -386 149 -589 207 -410 519 -682 976 -851 546 -202 1352 -218 2033 -39 631 164 1128 542 1392 1055 70 137 95 207 115 326 21 127 17 365 -9 458 -60 219 -221 395 -434 472 -349 128 -643 19 -857 -317 -26 -41 -84 -111 -129 -156 -65 -65 -92 -85 -134 -99 -109 -35 -222 -5 -277 73 -27 40 -30 51 -30 121 0 73 2 81 37 133 20 31 81 94 136 141 216 186 268 334 170 482 -87 131 -374 279 -623 321 -108 18 -416 26 -535 14z m557 -325 c114 -34 197 -151 196 -275 -1 -79 -20 -127 -75 -187 -54 -58 -108 -84 -184 -91 -82 -6 -150 17 -212 73 -70 63 -96 127 -90 225 3 43 12 89 21 107 68 130 206 189 344 148z m-1677 -619 c97 -33 548 -223 1198 -506 l1043 -453 62 19 c42 13 92 19 152 19 79 0 98 -4 155 -31 145 -68 277 -238 350 -448 l18 -53 -49 32 c-85 58 -135 69 -273 61 -165 -9 -194 -8 -243 14 -52 23 -134 98 -174 160 l-30 47 -1052 474 c-1037 467 -1181 537 -1334 650 -57 42 -67 54 -58 68 9 16 72 2 235 -53z" /></g></svg>';

			const chartCallback = ChartJS => {
				ChartJS.defaults.responsive = true;
				ChartJS.defaults.maintainAspectRatio = true;
			};

			const doc = new PDFDocument({
				size: 'A4',
				margin: 25
			});

			doc.registerFont('rbt', RobotoURL);
			doc.registerFont('rbt-b', RobotoBlackURL);
		
			const chartJSNodeCanvas = new ChartJSNodeCanvas({
				type: 'svg',
				width: doc.page.width - 150,
				height: 250,
				chartCallback
			});

			chartJSNodeCanvas.registerFont(RobotoURL, {
				family: 'Roboto',
				weight: 'normal'
			});
		
			chartJSNodeCanvas.registerFont(RobotoBlackURL, {
				family: 'Roboto-Black',
				weight: 'black'
			});

			doc.addSVG(PaletteSVG, (doc.page.width / 2) - 30, doc.y, {
				assumePt: true,
				width: 60,
				height: 60
			});

			doc.font('rbt-b');

			doc.moveDown();
			doc.moveDown();
			doc.moveDown();
			doc.moveDown();
			doc.moveDown();
			doc.moveDown();

			doc.fontSize(14).text("Reporte Diario", { align: 'center' });

			doc.moveDown();
			doc.moveDown();

			doc
				.fontSize(12)
				.text("Fecha:", { continued: true })
				.font('rbt')
				.text(` ${ newDate }, ${ time }`);

			doc
				.font('rbt-b')
				.text("Usuarios registrados:", { continued: true })
				.font('rbt')
				.text(` ${ users.registered }`);

			doc
				.font('rbt-b')
				.text("Calificaciones totales:", { continued: true })
				.font('rbt')
				.text(` ${ reviews.total }`);

			const dataTags = {
				labels: tags.map(t => t.name),
				datasets: [
					{
						data: tags.map(t => t.count),
						backgroundColor: [
							'rgba(255, 99, 132, 0.5)',
							'rgba(255, 159, 64, 0.5)',
							'rgba(255, 205, 86, 0.5)',
							'rgba(75, 192, 192, 0.5)',
							'rgba(54, 162, 235, 0.5)'
						],
						borderColor: [
							'rgb(255, 99, 132)',
							'rgb(255, 159, 64)',
							'rgb(255, 205, 86)',
							'rgb(75, 192, 192)',
							'rgb(54, 162, 235)',
							'rgb(153, 102, 255)',
							'rgb(201, 203, 207)'
						],
						borderWidth: 1
					}
				]
			};

			const configTags = {
				type: 'doughnut',
				data: dataTags,
				options: {
					plugins: {
						legend: {
							position: 'left',
							labels: {
								font: {
									family: 'Roboto',
									weight: 'normal'
								},
								color: 'black'
							}
						},
						title: {
							display: true,
							text: 'Etiquetas más usadas',
							color: 'black',
							font: {
								family: 'Roboto-Black',
								weight: 'black'
							}
						},
						emptyDoughnut: {
							color: '#eee',
							width: 50,
							radiusDecrease: 30
						}
					}
				},
				plugins: [ emptyDoughnut ]
			};

			const ptBuffer = chartJSNodeCanvas.renderToBufferSync(configTags, 'image/svg+xml');

			const popularTagsChart = Buffer.from(ptBuffer).toString('utf-8');

			doc.addSVG(popularTagsChart, (doc.page.width / 2) - ((doc.page.width - 150) / 2), doc.y, {
				assumePt: true,
				width: doc.page.width - 150,
				height: 250
			});

			const dataPosts = {
				labels: [ "Publicadas", "Calificadas" ],
				datasets: [
					{
						label: "dataset",
						data: [ total, reviews.reviewed ],
						barPercentage: .5,
						backgroundColor: [
							'rgba(54, 162, 235, 0.5)',
							'rgba(153, 102, 255, 0.5)',
						],
						borderColor: [
							'rgb(54, 162, 235)',
							'rgb(153, 102, 255)',
						],
						borderWidth: 1
					}
				]
			};

			const configPosts = {
				type: "bar",
				data: dataPosts,
				options: {
					scales: {
						y: {
							ticks: {
								font: {
									family: 'Roboto',
									weight: 'normal'
								},
								color: 'black',
								stepSize: 1
							}
						},
						x: {
							ticks: {
								font: {
									family: 'Roboto',
									weight: 'normal'
								},
								color: 'black'
							}
						}
					},
					plugins: {
						legend: {
							display: false,
							labels: {
								font: {
									family: 'Roboto',
									weight: 'normal'
								},
								color: 'black'
							}
						},
						title: {
							display: true,
							text: "Obras",
							color: "black",
						}
					}
				}
			};

			const postsBuffer = chartJSNodeCanvas.renderToBufferSync(configPosts, 'image/svg+xml');

			const postsChart = Buffer.from(postsBuffer).toString('utf-8');

			doc.addSVG(postsChart, (doc.page.width / 2) - ((doc.page.width - 150) / 2), doc.y + 300, {
				assumePt: true,
				width: doc.page.width - 150,
				height: 250
			});

			doc.end();

			const data = await toBase64(doc);

			return res.json({
				status: 200,
				success: true,
				content: data
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
	setFeatured: async (req, res) => {
		try {
			const { post_id } = req.params;

			const oldFeatured = await Posts.findOneAndUpdate({ featured: true }, { featured: false });
			
			if (!oldFeatured?._id.equals(post_id)) await Posts.findOneAndUpdate(
				{ _id: post_id },
				[
					{
						$set: {
							featured: { $ne: [ true, "$featured" ] }
						}
					}
				]
			);

			return res.json({
				status: 200,
				success: true
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
	deleteUser: async (req, res) => {
		try {
			const { user_id } = req.params;

			const [ user ] = await Users.aggregate([
				{
					$match: {
						username: user_id,
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
									$expr: { $eq: [ "$author", "$$authorID" ] },
								}
							},
							{
								$project: {
									_id: 1,
									images: 1
								}
							}
						],
						as: 'posts'
					}
				},
				{
					$lookup: {
						from: 'posts',
						let: { authorID: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: { $in: [ '$$authorID', '$ratings.author' ] }
								}
							},
							{
								$project: {
									_id: 1
								}
							}
						],
						as: 'ratings'
					}
				},
				{
					$project: {
						_id: 1,
						photo: 1,
						posts: 1,
						ratings: 1
					}
				}
			]);

			if (!user) return res.json({
				status: 400,
				success: false,
				content: "Acción inválida"
			});

			const { _id, photo, posts, ratings } = user;

			const bulkOps = [
				...(
					posts?.length ?
						[
							{
								deleteMany: {
									filter: {
										_id: {
											$in: posts.map(({ _id }) => new ObjectId(_id))
										}
									}
								}
							}
						]
					:
						[]
				),
				...(
					ratings?.length ?
						[
							{
								updateMany: {
									filter: {
										_id: {
											$in: ratings.map(({ _id }) => new ObjectId(_id))
										}
									},
									update: {
										$pull: {
											ratings: { author: _id }
										}
									}
								}
							}
						]
					:
						[]
				)
			];

			if (bulkOps?.length) await Posts.bulkWrite(bulkOps);

			await Users.findByIdAndDelete(_id);

			const imgToDelete = [
				...posts,
				...(
					photo ?
						[
							{
								images: [
									{ public_id: photo.public_id }
								]
							}
						]
					:
						[]
				)
			]
			.map(({ images }) =>
				limit(async () => {
					await cloudinary.uploader.destroy(images[0].public_id);
				})
			);

			if (imgToDelete?.length) await Promise.all(imgToDelete);

			return res.json({
				status: 200,
				success: true,
				content: "Usuario eliminado exitosamente"
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

module.exports = adminCtrl;