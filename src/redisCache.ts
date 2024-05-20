import redis from 'redis';
import logger from './logger';
import config from '../config.json';
const { host, port } = config.redis;

export const redisClient = redis.createClient({ socket: { host, port } });

redisClient.on('error', (error) => {
	logger.error(error);
});

redisClient.on('connect', () => {
	logger.success('Redis connected');
});

export async function setValue(key: string, value: string, expireTime: number): Promise<boolean> {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.set(key, value, { 'EX': expireTime });
	return true;
}

// TODO once call sites are TS, make this neater
export async function getValue(key: string): Promise<string | null | false> {
	if (!redisClient.isOpen) {
		return false;
	}

	const result = await redisClient.get(key);
	return result;
}

export async function removeValue(key: string): Promise<boolean> {
	if (!redisClient.isOpen) {
		return false;
	}

	await redisClient.del(key);
	return true;
}