const socket = require('socket.io')
const { likeStory } = require('./story')
const User = require('../models/user')
const Story = require('../models/story')
let io = null

const getUser = async (username) => {
	try {
		const user = await User.findOne({ username })
		if (user) return user
		return null
	} catch (err) {
		return err
	}
}

const cors = {
	origin: '*',
	methods: ['GET', 'POST'],
	credentials: true
}

const socketIO = {
	initialize: function (server) {
		io = socket(server, { cors })
		io.on('connection', async socket => {
			const id = socket.handshake.query.id
			socket.join(id)

			console.log(`${socket.id} connected`)
			socket.on('like-story', async ({ storySlug, id, writtenBy }) => {
				const data = await likeStory(storySlug, id)
				const user = await getUser(writtenBy)
				const payload = { totalLikes: data.likes, storySlug }
				if (user) {
					socket.broadcast.to(user._id).emit(`${user.username}-story-liked`, payload)
				}
				socket.broadcast.emit('story-liked', payload)
				socket.broadcast.emit(`${storySlug}-liked`, payload)
			})

			socket.on('add-new-story', async ({ storyId }) => {
				const newStory = await Story.findById(storyId)
				socket.broadcast.emit('new-story-added', { newStory })
			})

			socket.on("delete-story", ({ storyId }) => {
				socket.broadcast.emit("story-deleted", { storyId })
			})

			socket.on("add-comment", async ({ by, user, story }) => {
				const userData = await getUser(user)
				socket.broadcast.to(userData._id.toString()).emit('story-commented', {
					story,
					by
				})
			})

			socket.on("delete-comment", ({ comment_id, storySlug }) => {
				socket.broadcast.emit(`${storySlug}-comment-deleted`, { comment_id })
			})

			socket.on('disconnect', async () => {
				console.log(`${socket.id} got disconnected`)
			})
		})
	},
	getInstance: () => io
}

module.exports = socketIO