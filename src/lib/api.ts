import type { PaginatedResponse } from "@/types";

export function unwrapList<T>(data: T[] | PaginatedResponse<T>): T[] {
    return Array.isArray(data) ? data : data.results;
}
