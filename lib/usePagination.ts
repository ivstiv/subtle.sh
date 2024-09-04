import { useEffect, useMemo, useState } from "react";
import drop from "lodash/drop";

type UsePaginationResult<T> = PaginateResult<T> & {
  nextPage: () => void;
  previousPage: () => void;
  currentPageIndex: number;
};

type UsePaginationProps<T> = {
  items: T[];
  initialPage: number;
  pageSize: number;
};

type UsePagination = <T>(
  props: UsePaginationProps<T>,
) => UsePaginationResult<T>;
export const usePagination: UsePagination = (props) => {
  const [currentPage, setCurrentPage] = useState<number>(props.initialPage);
  const pagination = useMemo(
    () => paginate(props.items, currentPage, props.pageSize),
    [props.items, currentPage, props.pageSize],
  );

  useEffect(() => {
    // if we filter while on a non-initial page
    // we can end up in the situation "Page 2 of 1"
    // so we need to reset the current page
    if (pagination.totalPages < currentPage) {
      setCurrentPage(props.initialPage);
    }
  }, [pagination.totalPages, currentPage, props.initialPage]);

  return {
    ...pagination,
    nextPage: () =>
      setCurrentPage((oldPage) => {
        const newPage = oldPage + 1;
        return newPage > pagination.totalPages ? oldPage : newPage;
      }),
    previousPage: () =>
      setCurrentPage((oldPage) => {
        const newPage = oldPage - 1;
        return newPage < 1 ? oldPage : newPage;
      }),
    currentPageIndex: currentPage,
  };
};

type PaginateResult<T> = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  currentPage: T[];
};
type PaginateFunction = <T>(
  items: T[],
  page: number,
  pageSize: number,
) => PaginateResult<T>;

/**
 * @param items All items to paginate.
 * @param page Page to return.
 * @param pageSize Items per page to return.
 * @returns {PaginateResult} An object with paginated items and metadata.
 */
export const paginate: PaginateFunction = (items, page, pageSize) => {
  const pg = page || 1,
    pgSize = pageSize || 100,
    offset = (pg - 1) * pgSize,
    pagedItems = drop(items, offset).slice(0, pgSize);
  return {
    page: pg,
    pageSize: pgSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pgSize),
    currentPage: pagedItems,
  };
};
