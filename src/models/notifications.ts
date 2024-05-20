import { HydratedNotificationDocument, INotification, INotificationMethods, NotificationModel } from '@/types/mongoose/notifications';
import { Schema, model } from 'mongoose';

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