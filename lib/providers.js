exports.godaddy = {
	url: "https://api.godaddy.com/v1/domains/#DOMAIN#/records/#TYPE#/#HOST#",
	body: [
			{ data: '#IPADDRESS#', ttl: 600 }
		],
	method: 'put',
	headers: {
		"Authorization": "sso-key #KEY#:#SECRET#",
		"Content-Type": "application/json" 
	},
}

exports.namecheap = { 
	// namecheap.com
	// tbd
	// api docs: https://www.namecheap.com/support/api/methods/domains-dns/
}

exports.gandi = { 
	// gandi.net
	// tbd
	// api docs: https://docs.gandi.net/en/domain_names/advanced_users/api.html
}

exports.name = { 
	// name.com
	// tbd
	// api docs: https://www.name.com/api-docs/DNS#UpdateRecord
}