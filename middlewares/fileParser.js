const Writable = require('stream').Writable;
const { formidable } = require('formidable');

const supportedFormats = /image\/(png|jpg|jpeg|webp)/i;

const fileParser = (req, res, next) => {
	try {
		const bufferFiles = [];
		
		const form = formidable({
			fileWriteStreamHandler: () => {
				const chunks = [];

				const writable = new Writable({
					write: (chunk, _, next) => {
						chunks.push(chunk);
						next();
					},
					final: cb => {
						const buffer = Buffer.concat(chunks);
						bufferFiles.push(buffer);
						cb();
					}
				});

				return writable;
			},
			filter: ({ mimetype }) => {
				const valid = mimetype && supportedFormats.test(mimetype);

				if (!valid) form.emit('error', 'Tipo de archivo inválido.');

				return valid;
			}
		});

		form.parse(req, (err, fields) => {
			if (err) return res.json({
				status: 400,
				success: false,
				content: err
			});

			req.body = Object.fromEntries(
				Object.entries(fields).map(([ key, value ]) => [ key, value[0] ]),
			);
			req.files = {
				...( bufferFiles.length ? { images: bufferFiles } : {} )
			};
			
			return next();
		});
	} catch (err) {
		const { message } = err;
		
		return res.json({
			status: 500,
			success: false,
			content: message
		});
	};
};

module.exports = fileParser;