const express = require('express')
const User = require('../models/user')

const router = express.Router()

const getAvatar = seed => `https://avatars.dicebear.com/api/pixel-art/${seed}.svg`

router.post('/update-avatar', async (req, res) => {
	const { username, avatar } = req.body

	try {
		const user = await User.findOne({ username })
		if (user) {
			user.avatar = avatar
			user.save()
			return res.status(200).json({
				type: 'success',
				avatar: user.avatar
			})
		}
		return res.status(404).json({
			type: 'danger',
			message: 'User not found'
		})
	} catch (err) {
		return res.status(500).json({
			type: 'danger',
			message: err.message
		})
	}

})

router.post('/revert-avatar', async (req, res) => {
	const { username } = req.body
	try {
		const user = await User.findOne({ username })
		if (user) {
			user.avatar = getAvatar(username)
			user.save()
			return res.status(200).json({
				type: 'success',
				avatar: user.avatar
			})
		}
		return res.status(404).json({
			type: 'danger',
			message: 'User not found'
		})

	} catch (err) {
		return res.status(500).json({
			type: 'danger',
			message: err.message
		})
	}
})

router.post('/get-avatar', async (req, res) => {
	const users = req.body.users
	try {
		const user = await User.find({ username: users })
			.select(['avatar', 'username'])

		if (user)
			return res.status(200).json({
				type: 'success',
				data: user
			})
		return res.status(404).json({
			type: 'danger',
			message: 'Data not found'
		})
	} catch (error) {
		return res.status(500).json({
			type: 'danger',
			message: error.message
		})
	}


})

module.exports = router