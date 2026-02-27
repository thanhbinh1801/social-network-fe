import { api } from "@/lib/axios";
import type { FeedResponse } from "@/types";

export const feedApi = {
    getFeed: (offset: number, limit = 20) =>
        api.get<FeedResponse>(`/feed/`, { params: { offset, limit } }),
};
