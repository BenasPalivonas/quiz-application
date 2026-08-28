"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

type PaginationData = {
  current_page: number;
  last_page: number;
};

export function Pagination({
  paginationData,
}: {
  paginationData: PaginationData;
}): ReactElement | null {
  const pathname = usePathname();

  if (paginationData.last_page <= 1) {
    return null;
  }

  const { current_page, last_page } = paginationData;

  return (
    <nav className="flex items-center justify-center gap-4 text-sm">
      {current_page > 1 ? (
        <Link href={`${pathname}?page=${current_page - 1}`}>Previous</Link>
      ) : (
        <span className="invisible">Previous</span>
      )}
      <span className="text-white">
        Page {current_page} of {last_page}
      </span>
      {current_page < last_page ? (
        <Link href={`${pathname}?page=${current_page + 1}`}>Next</Link>
      ) : (
        <span className="invisible">Next</span>
      )}
    </nav>
  );
}
