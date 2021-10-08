const Story = require('../models/story')

exports.getStories = async (req, res) => {
	const username = req.query.username
	const limit = Math.abs(req.query.limit) || 10
	const page = (Math.abs(req.query.page) || 1) - 1
	let filter = {}
	if (username) {
		filter = { writtenBy: username }
	} else {
		filter = { isPrivate: false }
	}
	try {
		const stories = await Story.find(filter)
			.select("-comments")
			.limit(limit)
			.skip(limit * page)
		if (stories)
			return res.status(200).json({
				stories,
				type: 'success'
			})
		return res.status(404).json({
			message: 'No stories found',
			type: 'danger'
		})
	} catch (err) {
		return res.status(500).json({
			message: err.message,
			type: 'danger'
		})
	}
}

exports.getStoryBySlug = async (req, res) => {
	try {
		const story = await Story.findOne({
			slug: req.params.slug
		})
		if (story)
			return res.status(200).json({
				type: 'success',
				story
			})
		return res.status(404).json({
			type: 'danger',
			message: 'Story not found'
		})
	} catch (err) {
		return res.status(500).json({
			type: 'danger',
			message: err.message
		})

	}
}

exports.editStory = async (req, res) => {
	try {
		const story = await Story.findById(req.params.id)
		if (story.writtenBy == req.body.username) {
			story.title = req.body.title
			story.content = req.body.content
			story.isPrivate = req.body.isPrivate
			const updatedStory = await story.save()
			return res.status(200).json({
				type: 'success',
				updatedStory
			})
		}
		else
			return res.status(401).json({
				type: 'danger',
				message: 'Not allowed to edit the story'
			})
	} catch (err) {
		return res.status(500).json({
			type: 'danger',
			message: err.message
		})
	}
}

exports.deleteStory = async (req, res) => {
	try {
		const story = await Story.findById(req.params.id)
		if (story.writtenBy == req.body.username) {
			Story.deleteOne({ _id: story._id }, err => {
				if (err) return res.status(409).json({
					message: 'Unable to delete',
					type: 'danger'
				})
				return res.status(200).json({
					message: 'deleted the story',
					type: 'success'
				})
			})
		}
		else
			return res.status(405).json({
				message: 'Not allowed',
				type: 'danger'
			})
	} catch (err) {
		return res.status(500).json({
			message: err.message,
			type: 'danger'
		})

	}
}

exports.newStory = async (req, res) => {

	const story = new Story({
		title: req.body.title,
		content: req.body.content,
		writtenBy: req.body.writtenBy,
		isPrivate: req.body.isPrivate || false
	})

	try {
		await story.save((err, doc) => {
			if (err)
				return res.status(500).json({
					message: err.message,
					type: 'danger'
				})
			return res.status(200).json({
				type: 'success',
				story: doc
			})
		})
	} catch (err) {
		return res.status(500).json({
			type: 'danger',
			message: err.message
		})
	}

}

exports.like = async (req, res) => {
	const userId = req.body.id
	const storySlug = req.params.slug
	const data = await this.likeStory(storySlug, userId)
	return res.status(data.statusCode).json({
		type: data.type,
		isLiked: data.isLiked,
		likes: data.likes
	})
}

exports.likeStory = async (storySlug, userId) => {
	let isLiked = false
	try {
		const story = await Story.findOne({ slug: storySlug })
		if (story) {
			if (story.likes.indexOf(userId) === -1) {
				story.likes.push(userId)
				isLiked = true
			} else {
				story.likes.pull(userId)
				isLiked = false
			}

			await story.save()

			return {
				type: 'success',
				likes: story.likes,
				isLiked,
				statusCode: 200
			}
		}
		return {
			type: 'danger',
			message: 'Story not found',
			statusCode: 404
		}
	} catch (err) {
		return {
			type: 'danger',
			message: err.message,
			statusCode: 500
		}
	}
}

exports.addComment = async (req, res) => {
	const slug = req.params.slug

	Story.findOneAndUpdate(
		{ slug },
		{ $push: { comments: { ...req.body } } },
		{ safe: true, upsert: true, new: true },
		(err, doc) => {
			if (err)
				return res.status(500).json({
					type: 'danger',
					message: err.message
				})
			return res.status(200).json({
				type: 'success',
				comments: doc.comments
			})
		}
	)
}

exports.removeComment = async (req, res) => {
	const slug = req.params.slug
	const comment_id = req.query.comment_id

	Story.findOneAndUpdate(
		{ slug },
		{ $pull: { comments: { _id: comment_id } } },
		{ safe: true, upsert: true, new: true },
		(err, doc) => {
			if (err)
				return res.status(500).json({
					type: 'danger',
					message: err.message
				})
			return res.status(200).json({
				type: 'success',
				comments: doc.comments
			})
		}
	)
}

exports.getComments = async (req, res) => {
	const slug = req.params.slug

	try {
		const story = await Story.findOne({ slug }).select(["comments"])
		if (story)
			return res.status(200).json({
				type: 'success',
				comments: story.comments,
			})

		return res.status(404).json({
			type: 'danger',
		})
	} catch (err) {
		return res.status(500).json({
			type: 'danger',
			message: err.message
		})
	}
}