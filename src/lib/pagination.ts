/**
 * Pagination parameters interface.
 */
export interface PaginationParams {
    limit: number;
    offset: number;
    cursor?: string;
}

/**
 * Paginated response structure.
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        nextOffset: number | null;
        nextCursor?: string | null;
        hasMore: boolean;
        total?: number;
    };
}

/**
 * Encode a tuple (timestamp, id) into a base64 cursor string.
 */
export function encodeCursor(t: string, i: string): string {
    return Buffer.from(JSON.stringify({ t, i })).toString('base64');
}

/**
 * Decode a base64 cursor string back to a tuple.
 */
export function decodeCursor(cursor: string): { t: string; i: string } | null {
    try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed.t === 'string' && typeof parsed.i === 'string') {
            return parsed;
        }
    } catch {
        // ignore errors and return null
    }
    return null;
}

/**
 * Extracts and validates pagination parameters from a query object.
 *
 * @param query - The query object from an Express request
 * @param defaultLimit - Default limit if not provided (default 10)
 * @param maxLimit - Maximum allowed limit (default 100)
 * @returns Parsed and validated pagination parameters
 */
export function getPaginationParams(
    query: Record<string, any>,
    defaultLimit = 10,
    maxLimit = 100
): PaginationParams {
    let limit = defaultLimit;
    let offset = 0;
    let cursor: string | undefined = undefined;

    if (query.limit !== undefined) {
        const parsedLimit = parseInt(String(query.limit), 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            limit = Math.min(parsedLimit, maxLimit);
        }
    }

    if (query.offset !== undefined) {
        const parsedOffset = parseInt(String(query.offset), 10);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
            offset = parsedOffset;
        }
    }

    if (typeof query.cursor === 'string' && query.cursor.length > 0) {
        cursor = query.cursor;
    }

    return { limit, offset, cursor };
}

/**
 * Builds a standardized paginated response.
 *
 * @param data - The array of data items for the current page
 * @param limit - The requested limit
 * @param offset - The requested offset
 * @param total - Optional total number of items
 * @param nextCursor - Optional cursor for the next page
 * @returns A structured paginated response
 */
export function buildPaginatedResponse<T>(
    data: T[],
    limit: number,
    offset: number,
    total?: number,
    nextCursor?: string | null
): PaginatedResponse<T> {
    const hasMore = data.length >= limit;
    const nextOffset = hasMore ? offset + data.length : null;

    return {
        data,
        pagination: {
            nextOffset,
            nextCursor,
            hasMore,
            ...(total !== undefined ? { total } : {}),
        },
    };
}
