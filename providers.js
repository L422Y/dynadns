exports.godaddy = {
	url: "https://api.godaddy.com/v1/domains/#DOMAIN#/records/A/#HOST#",
	body: [
			{ data: '#IPADDRESS#', ttl: 300 }
		],
	method: 'put',
	headers: {
		"Authorization": "sso-key #KEY#:#SECRET#",
		"Content-Type": "application/json" 
	},
}