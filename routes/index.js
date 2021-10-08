const auth = require('./auth')
const user = require('./user')
const story = require('./story')

module.exports = app => {
	app.use('/api/auth', auth)
	app.use('/api/user', user)
	app.use('/api/story', story)
}