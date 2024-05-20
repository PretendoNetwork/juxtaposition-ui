import { Model, Types, HydratedDocument } from 'mongoose';

export interface IUser {
    pid: number;
    official: boolean;
    read: boolean;
}

export type UserModel = Model<IUser, object>;

export interface IConversation {
    id: string;
    created_at: Date;
    last_updated: Date;
    message_preview: string;
    users: Types.Array<IUser>;
}

export interface IConversationMethods {
    newMessage(message: string, senderPID: number): Promise<void>;
    markAsRead(receivedPID: number): Promise<void>;
}

export type ConversationModel = Model<IConversation, object, IConversationMethods>;

export type HydratedConversationDocument = HydratedDocument<IConversation, IConversationMethods>;