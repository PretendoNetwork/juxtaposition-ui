import type { Model, Types, HydratedDocument } from 'mongoose';

export interface IUser {
	user: string;
	timestamp: Date
}

export interface INotification {
	pid: string;
	type: string;
	link: string;
	objectID: string;
	users: Types.Array<IUser>;
	read: boolean;
	lastUpdated: Date;
}

export interface INotificationMethods {
	markRead(): Promise<void>;
}

export type NotificationModel = Model<INotification, object, INotificationMethods>;

export type HydratedNotificationDocument = HydratedDocument<INotification, INotificationMethods>;