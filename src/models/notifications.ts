import { Schema, model } from 'mongoose';
import type { HydratedNotificationDocument, INotification, INotificationMethods, NotificationModel } from '@/types/mongoose/notifications';

export const NotificationSchema = new Schema<INotification, NotificationModel, INotificationMethods>({
	pid: String,
	type: String,
	link: String,
	objectID: String,
	users: [{
		user: String,
		timestamp: Date
	}],
	read: Boolean,
	lastUpdated: Date
});

NotificationSchema.method<HydratedNotificationDocument>('markRead', async function() {
	this.set('read', true);
	await this.save();
});

export const NOTIFICATION = model<INotification, NotificationModel>('NOTIFICATION', NotificationSchema);