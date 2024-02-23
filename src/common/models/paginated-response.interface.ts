export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  totalPages: number;
  currentPages: number;
}
