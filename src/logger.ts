import fs from 'fs-extra';
import colors from 'colors';

colors.enable();

const root = __dirname;
fs.ensureDirSync(`${root}/logs`);

const streams = {
	latest: fs.createWriteStream(`${root}/logs/latest.log`),
	success: fs.createWriteStream(`${root}/logs/success.log`),
	error: fs.createWriteStream(`${root}/logs/error.log`),
	warn: fs.createWriteStream(`${root}/logs/warn.log`),
	info: fs.createWriteStream(`${root}/logs/info.log`),
	audit: fs.createWriteStream(`${root}/logs/audit.log`),
} as const;

export function success(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [SUCCESS]: ${input}`;
	streams.success.write(`${input}\n`);

	console.log(`${input}`.green.bold);
}

export function error(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [ERROR]: ${input}`;
	streams.error.write(`${input}\n`);

	console.log(`${input}`.red.bold);
}

export function warn(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [WARN]: ${input}`;
	streams.warn.write(`${input}\n`);

	console.log(`${input}`.yellow.bold);
}

export function info(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [INFO]: ${input}`;
	streams.info.write(`${input}\n`);

	console.log(`${input}`.cyan.bold);
}

export function audit(input: string): void {
	const time = new Date();
	input = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] [Audit]: ${input}`;
	streams.audit.write(`${input}\n`);

	console.log(`${input}`.white.bold);
}

export default {
	success,
	error,
	warn,
	info,
	audit
};