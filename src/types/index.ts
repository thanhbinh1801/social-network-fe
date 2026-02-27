export interface UserPublicObject {
    id: number;
    username: string;
    email: string;
    avatar: string | null;
    cover: string | null;
    bio: string;
    website: string;
    location: string;
    followers_count: number;
    following_count: number;
    is_following: boolean;
    date_joined: string;
}

export interface PostMedia {
    id: number;
    file: string;
    media_type: "image" | "video";
}

export interface Hashtag {
    id: number;
    name: string;
}

export interface PostObject {
    id: number;
    author: UserPublicObject;
    body: string;
    visibility: "public" | "friends" | "private";
    media: PostMedia[];
    hashtags: Hashtag[];
    reactions_count: number;
    comments_count: number;
    is_saved: boolean;
    user_reaction: ReactionType | null;
    created_at: string;
    updated_at: string;
}

export interface CommentObject {
    id: number;
    user: UserPublicObject;
    body: string;
    parent: number | null;
    replies: CommentObject[];
    replies_count: number;
    created_at: string;
    updated_at: string;
}

export interface FeedResponse {
    results: PostObject[];
    offset: number;
    limit: number;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface DetailResponse {
    detail: string;
}

export type ReactionType = "like" | "love" | "haha" | "sad" | "angry";

export interface FollowRelation {
    id: number;
    follower: UserPublicObject;
    following: UserPublicObject;
    created_at: string;
}
