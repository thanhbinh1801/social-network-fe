import { unwrapList } from "@/lib/api";
import { api } from "@/lib/axios";
import type { NotificationObject, PaginatedResponse } from "@/types";

export const notificationsApi = {
    getAll: async () => {
        const res = await api.get<
            NotificationObject[] | PaginatedResponse<NotificationObject>
        >("/notifications/");
        return unwrapList(res.data);
    },

    markRead: (id?: number) =>
        api.post<{ detail: string }>("/notifications/mark-read/", id ? { id } : {}),
};
