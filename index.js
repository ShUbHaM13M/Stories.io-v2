if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const methodOverride = require('method-override');

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

mongoose.connect(process.env.MONGO_URI)
	.then(() => console.log('DB connected'))
	.catch(err => console.error(err.message))

// app.use((req, res, next) => {
// 	const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000'];
// 	const origin = req.headers.origin;
// 	if (allowedOrigins.includes(origin)) {
// 		res.setHeader('Access-Control-Allow-Origin', origin);
// 	}
// 	res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
// 	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// 	res.header('Access-Control-Allow-Credentials', true);
// 	return next();
// });

require('./routes')(app)

app.get('/wake-up', (_req, res) => {
	return res.status(200).json({ type: 'success', message: 'server awake' })
})

const server = app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`)
})

require('./controller/socket').initialize(server)
