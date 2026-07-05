"use client";

import { memo, useCallback } from "react";
import { useT } from "@/i18n/context";

type Props = { page: number; totalPages: number; onPageChange: (p: number) => void };

const Pagination = function Pagination({ page, totalPages, onPageChange }: Props) {
  const { t } = useT();

  const handlePrev = useCallback(() => {
    onPageChange(page - 1);
  }, [page, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(page + 1);
  }, [page, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page <= 1} onClick={handlePrev} aria-label="Go to previous page">
        {t("pagination.prev")}
      </button>
      <span>{t("pagination.page", { page, totalPages })}</span>
      <button disabled={page >= totalPages} onClick={handleNext} aria-label="Go to next page">
        {t("pagination.next")}
      </button>
    </nav>
  );
};

export default memo(Pagination);
