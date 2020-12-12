const axios = require('axios')
const dotenv = require('dotenv')
const providers = require('./providers')

dotenv.config();

const { PROVIDER, KEY, SECRET, HOST, DOMAIN, DEBUG = false } = process.env

let l = () => {};

if (DEBUG) {
	l = console.log
}

if(PROVIDER in providers) {

	// get external ip address

	axios('https://api.ipify.org').then((response)=>{
		l(`Got external address: ${response.data}`)

		// setup template values
		let values = { HOST, DOMAIN, KEY, SECRET, IPADDRESS: response.data }

		// make the provider a JSON string for easy templating
		let provider = JSON.stringify(providers[PROVIDER])

		// apply values to entire provider template
		for (const [key, value] of Object.entries(values)) {
			provider = provider.replace(`#${key}#`,value);
		}
		provider = JSON.parse(provider)
		
		// setup axios config
		let config = {
			method: provider.method,
			url: provider.url,
			data: provider.body,
			headers: provider.headers
		};


		// issue the call to the provider
		axios(config)
			.then(response => {
				l(`Successfully updated ${values.HOST}.${values.DOMAIN} to ${values.IPADDRESS}.`)
			})
			.catch(err => {
				l(`Error: (${err.status}) ${err.statusText}`)
				l(err.response.data)
				l(err.response.data.fields)
			})

	});

} else {
	console.log(`Provider not found: ${PROVIDER}`)
}