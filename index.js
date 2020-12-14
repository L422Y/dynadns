const fs = require('fs');
const dyndns = require('./lib/dyndns')
const providers = require('./lib/providers')
try {
	let config = JSON.parse(fs.readFileSync('config.json'));
	let configError = false;
	if ('accounts' in config) {
		Object.values(config.accounts).forEach(acct => {
			if (!(acct.provider in providers)) {
				console.log(`[config] provider "${acct.provider}" not supported`)
				configError = true
			}
		});
	} else {
		console.log(`[config] "accounts" config tree not found`)
		configError = true
	}
	if (configError) process.exit(1);
	let instance = new dyndns(config);
} catch (err) {
	console.log(err)
	process.exit(1)
}
