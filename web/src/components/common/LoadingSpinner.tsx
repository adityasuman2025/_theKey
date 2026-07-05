"use client";

import { memo } from "react";

type Props = {
  message?: string;
};

const LoadingSpinner = function LoadingSpinner({ message = "Loading..." }: Props) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default memo(LoadingSpinner);
