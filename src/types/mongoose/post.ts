import { Model, Types, HydratedDocument } from 'mongoose';

export interface IPost {
    id: string;
    title_id: string;
    screen_name: string;
    body: string;
    app_data: string;
    painting: string;
    screenshot: string;
    screenshot_length: number;
    search_key: Types.Array<string>;
    topic_tag: string;
    community_id: string;
    created_at: Date;
    feeling_id: number;
    is_autopost: number;
    is_community_private_autopost: number;
    is_spoiler: number;
    is_app_jumpable: number;
    empathy_count: number;
    country_id: number;
    language_id: number;
    mii: string;
    mii_face_url: string;
    pid: number;
    platform_id: number;
    region_id: number;
    parent: string;
    reply_count: number;
    verified: boolean;
    message_to_pid: string;
    removed: boolean;
    removed_reason: string;
    removed_by: number;
    removed_at: Date;
    yeahs: Types.Array<number>
}

export interface IPostMethods {
    unReply(): Promise<void>;
    downReply(): Promise<void>;
    removePost(reason: string, pid: number): Promise<void>;
    unRemove(reason: string): Promise<void>;
}

export type PostModel = Model<IPost, object, IPostMethods>;

export type HydratedPostDocument = HydratedDocument<IPost, IPostMethods>;