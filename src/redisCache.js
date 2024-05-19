const redis = require('redis');
const logger = require('./logger');
const config = require('../config.json');
const { host, port } = config.redis;

const redisClient = redis.createClient({ host, port });

redisClient.on('error', (error) => {
	logger.error(error);
});

redisClient.on('connect', () => {
	logger.success('Redis connected');
});

async function setValue(key, value, expireTime) {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.set(key, value, 'EX', expireTime);
	return true;
}

async function getValue(key) {
	if (!redisClient.isOpen) {
		return false;
	}

	const result = await redisClient.get(key);
	return result;
}

async function removeValue(key) {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.del(key);
	return true;
}


module.exports = {
	redisClient,
	setValue,
	getValue,
	removeValue
};