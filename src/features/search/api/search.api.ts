import { unwrapList } from "@/lib/api";
import { api } from "@/lib/axios";
import type {
    Hashtag,
    PaginatedResponse,
    SearchResults,
    UserPublicObject,
} from "@/types";

export const searchApi = {
    search: (query: string, type: "all" | "users" | "posts" | "hashtags" = "all") =>
        api.get<SearchResults>("/search/", { params: { q: query, type } }),

    getTrending: async () => {
        const res = await api.get<Hashtag[] | PaginatedResponse<Hashtag>>("/search/trending/");
        return unwrapList(res.data);
    },

    getSuggestions: async () => {
        const res = await api.get<UserPublicObject[] | PaginatedResponse<UserPublicObject>>(
            "/search/suggestions/"
        );
        return unwrapList(res.data);
    },
};
