const User = require('../models/user')
const sendMail = require('../utils/mailer')
const Token = require('../models/token')

exports.register = async (req, res) => {
	try {
		const { email } = req.body
		const _user = await User.findOne({ email })

		if (_user)
			return res.status(401).json({
				message: 'Entered email address is already associated with another account',
				type: 'danger'
			})

		const newUser = new User({ ...req.body })
		const user = await newUser.save()
		await sendVerificationEmail(user, req, res)
	} catch (err) {
		res.status(500).json({
			type: 'danger',
			message: err.message
		})
	}
}

exports.login = async (req, res) => {
	try {
		const { username, password } = req.body

		const user = await User.findOne({ username })

		if (!user) return res.status(401).json({
			message: 'No user with this username was found',
			type: 'danger'
		})

		if (!user.comparePassword(password)) return res.status(401).json({
			message: 'Incorrect password.',
			type: 'danger'
		})

		if (!user.isVerified) return res.status(401).json({
			type: 'danger',
			message: 'Your email is not verified'
		})

		res.status(200).json({
			user: {
				email: user.email,
				username: user.username,
				avatar: user.avatar,
				id: user._id
			},
			type: 'success'
		})

	} catch (error) {
		res.status(500).json({
			message: error.message,
			type: 'danger'
		})
	}
}

exports.verify = async (req, res) => {
	if (!req.params.token) return res.status(400).json({
		message: "We were unable to find a user for this token.",
		type: 'danger'
	})

	try {
		const token = await Token.findOne({ token: req.params.token })

		if (!token)
			return res.status(400).json({
				message: "We were unable to find a user for this token.",
				type: 'danger'
			})

		User.findOne({ _id: token.userId }, (_err, user) => {
			if (!user)
				return res.status(400).json({
					message: 'We were unable to find a user for this token.',
					type: 'danger'
				})

			if (user.isVerified)
				return res.status(400).json({
					message: 'User already Verified',
					type: 'danger'
				})

			user.isVerified = true
			user.save((err) => {
				if (err)
					return res.status(500).json({
						message: err.message,
						type: 'danger'
					})
				res.status(200).send("Your account has been verified")
			})
		})

	} catch (err) {
		res.status(500).json({
			message: error.message,
			type: 'danger'
		})
	}
}

exports.resendToken = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await User.findOne({ email });

		if (!user) return res.status(401).json({
			message: `The email address${req.body.email} is not associated with any account`,
			type: 'danger'
		});

		if (user.isVerified) return res.status(400).json({
			message: 'This account has already been verified. Please log in.',
			type: 'danger'
		});

		await sendVerificationEmail(user, req, res);
	} catch (error) {
		res.status(500).json({
			message: error.message,
			type: 'danger'
		})
	}
}

async function sendVerificationEmail(user, req, res) {
	try {
		const token = user.generateVerificationToken()

		await token.save()

		let subject = "Account Verification Token"
		let to = user.email
		let from = process.env.MAIL_USERNAME
		let link = `http://${req.headers.host}/api/auth/verify/${token.token}`

		let html = `<h1 align="center">Welcome to <br /><span style="font-size: 1.5em" >Stories.io</span></h1><hr /><p align="center">Click on the button below to verify Your Email</p><div style="display: flex; justify-content: center;"><a style="text-decoration: none; color: black; border: 2px solid black; padding: 0.5em 1em; margin: 0 auto; text-align: center;" href="${link}">Verify Email</a></div>`

		await sendMail({ from, to, subject, html })

		res.status(200).json({
			type: 'success',
			message: `A verification email has been sent to ${user.email}.`
		})

	} catch (error) {
		res.status(500).json({ message: error.message, type: 'danger' })
	}
}