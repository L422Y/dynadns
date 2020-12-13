const dotenv = require('dotenv')
const dyndns = require('./lib/dyndns')
const providers = require('./lib/providers')
try {
	const env = dotenv.config()
	if (env.parsed) {
		const opts = env.parsed

		if (process.env.PROVIDER in providers) {
			let instance = new dyndns(opts);
		} else {
			console.log(`Provider not found: ${process.env.PROVIDER}`)
		}
	} else {
		console.error('Error reading your .env configuration')
		process.exit(1)
	}
} catch (err) {
	console.log(err)
	process.exit(1)
}
