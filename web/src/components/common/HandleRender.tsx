"use client";

import { memo } from "react";
import { useT } from "@/i18n/context";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type Props = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: React.ReactNode;
};

const HandleRender = function HandleRender({ isLoading, isError, onRetry, children }: Props) {
  const { t } = useT();

  if (isLoading) {
    return <LoadingSpinner message={t("loading")} />;
  }

  if (isError) {
    return (
      <div className="error-state">
        <p>{t("error.generic")}</p>
        <button onClick={onRetry}>{t("error.retry")}</button>
      </div>
    );
  }

  return <>{children}</>;
};

export default memo(HandleRender);
