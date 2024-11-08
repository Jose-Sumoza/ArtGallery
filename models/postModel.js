const { Schema, model } = require('mongoose');

const postsSchema = new Schema({
	author: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	title: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		required: true,
		trim: true
	},
	images: {
		type: [
			{
				_id: false,
				public_id: {
					type: String,
					required: true,
					unique: true
				},
				url: {
					type: String,
					required: true,
					unique: true
				}
			}
		],
		required: true
	},
	tags: {
		type: [ String ],
		required: true
	},
	ratings: {
		type: [
			{
				_id: false,
				author: {
					type: Schema.Types.ObjectId,
					ref: 'Users'
				},
				comment: {
					type: String,
					required: true,
					trim: true
				},
				value: {
					type: Number,
					required: true
				},
				timestamp: {
					type: Date,
					required: true
				}
			}
		],
		default: []
	}
}, {
	timestamps: true
});

postsSchema.index({ title: 'text', tags: 'text' });
postsSchema.index({ title: 1 });
postsSchema.index({ tags: 1 });

postsSchema.searchIndex({
	name: 'title',
	definition: {
		mappings: {
			dynamic: false,
			fields: {
				title: {
					type: 'autocomplete',
					analyzer: 'lucene.standard',
					tokenization: 'edgeGram',
					minGrams: 1,
					maxGrams: 5,
					foldDiacritics: true
				}
			}
		}
	}
});

module.exports = model('Posts', postsSchema);