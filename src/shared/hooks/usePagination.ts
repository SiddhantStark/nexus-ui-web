import { useState } from 'react';
/** Derive a valid page immediately when filtering or mutations shrink a result set. */
export function usePagination(itemCount: number, perPage: number) {
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.ceil(itemCount / perPage);
  const page = Math.min(Math.max(1, totalPages), Math.max(1, requestedPage));
  return { page, totalPages, setPage };
}
