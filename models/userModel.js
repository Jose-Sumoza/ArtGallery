const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	names: {
		type: String,
		required: true,
		trim: true
	},
	lastnames: {
		type: String,
		required: true,
		trim: true
	},
	username: {
		type: String,
		required: true,
		trim: true,
		unique: true
	},
	headline: {
		type: String,
		trim: true,
		default: ''
	},
	summary: {
		type: String,
		trim: true,
		default: ''
	},
	photo: {
		type: {
			_id: false,
			public_id: {
				type: String,
				required: true
			},
			url: {
				type: String,
				required: true
			}
		},
		default: null
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: Number,
		required: true
	}
}, {
	timestamps: true
});

userSchema.index({ names: 'text', lastnames: 'text', username: 'text' });
userSchema.index({ names: 1 });
userSchema.index({ lastnames: 1 });
userSchema.index({ username: 1 });

module.exports = model('Users', userSchema);