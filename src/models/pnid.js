const mongoose = require('mongoose');
const {pnidConnection} = require('../accountdb');

const PNIDSchema = new mongoose.Schema({
	access_level: {
		type: Number,
		default: 0  // 0: standard, 1: tester, 2: mod?, 3: dev
	},
	server_access_level: {
		type: String,
		default: 'prod' // everyone is in production by default
	},
	pid: {
		type: Number,
		unique: true
	},
	username: {
		type: String,
		unique: true,
		minlength: 6,
		maxlength: 16
	},
	birthdate: String,
	country: String,
	language: String,
	region: Number,
	mii: {
		name: String,
		primary: Boolean,
		data: String,
		id: {
			type: Number,
			unique: true
		},
		hash: {
			type: String,
			unique: true
		},
		image_url: String,
		image_id: {
			type: Number,
			unique: true
		},
	},
});

const PNID = pnidConnection.model('PNID', PNIDSchema);

module.exports = {
	PNID,
};
