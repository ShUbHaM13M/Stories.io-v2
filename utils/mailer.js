
const nodemailer = require('nodemailer')

module.exports = async function (options) {
	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: 587,
		secure: false,
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD
		}
	})

	const info = await transporter.sendMail(options)

	console.log(info.messageId)

}