const mongoose = require('mongoose');
const slugify = require('slugify')

const StorySchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	content: {
		type: String,
		required: true,
	},
	likes: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'users',
		default: [],
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	writtenBy: {
		type: String,
		required: true
	},
	comments: {
		type: [{
			content: String,
			by: String
		}],
		default: []
	},
	isPrivate: { type: Boolean, default: false }
}, { timestamps: true })

StorySchema.pre('validate', function (next) {
	if (this.title) {
		this.slug = slugify(this.title, {
			lower: true,
			strict: true
		})
	}

	next()
})

module.exports = mongoose.model('Story', StorySchema, 'story')