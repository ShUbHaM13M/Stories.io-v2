const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Token = require('./token')

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
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
	isVerified: {
		type: Boolean,
		default: false
	},
	avatar: {
		type: String,
	}
})

UserSchema.pre('save', function (next) {
	const user = this
	if (!user.isModified('password')) return next()

	bcrypt.hash(user.password, 10, (err, hash) => {
		if (err) return next(err)
		user.password = hash
		next()
	})
})

UserSchema.pre('save', function (next) {
	if (this.username && !this.avatar) {
		this.avatar = `https://avatars.dicebear.com/api/pixel-art/${this.username}.svg`
	}

	next()
})

UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.generatePasswordReset = function () {
	this.resetPasswordToken = crypto.randomBytes(20).toString('hex')
	this.resetPasswordExpires = Date.now() + 3600000
};

UserSchema.methods.generateVerificationToken = function () {
	let payload = {
		userId: this._id,
		token: crypto.randomBytes(20).toString('hex')
	}
	return new Token(payload)
}

module.exports = mongoose.model('user', UserSchema)