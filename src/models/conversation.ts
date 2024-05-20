import { ConversationModel, HydratedConversationDocument, IConversation, IConversationMethods, IUser, UserModel } from '@/types/mongoose/conversation';
import { Schema, model } from 'mongoose';
import { Snowflake } from 'node-snowflake';

const user = new Schema<IUser, UserModel>({
	pid: Number,
	official: {
		type: Boolean,
		default: false
	},
	read: {
		type: Boolean,
		default: true
	}
});

export const ConversationSchema = new Schema<IConversation, ConversationModel, IConversationMethods>({
	id: {
		type: String,
		default: Snowflake.nextId()
	},
	created_at: {
		type: Date,
		default: new Date(),
	},
	last_updated: {
		type: Date,
		default: new Date(),
	},
	message_preview: {
		type: String,
		default: ''
	},
	users: [user]
});

ConversationSchema.method<HydratedConversationDocument>('newMessage', async function(message: string, senderPID: number) {
	this.last_updated = new Date();
	this.message_preview = message;
	const sender = this.users.find(user => user.pid === senderPID);
	if (sender) {
		sender.read = false;
	}
	await this.save();
});

ConversationSchema.method<HydratedConversationDocument>('markAsRead', async function(receiverPID: number) {
	const receiver = this.users.find(user => user.pid === receiverPID);
	if (receiver) {
		receiver.read = true;
	}
	await this.save();
});

export const CONVERSATION = model<IConversation, ConversationModel>('CONVERSATION', ConversationSchema);