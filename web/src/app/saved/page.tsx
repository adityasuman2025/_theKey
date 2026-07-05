"use client";

import { useState, useCallback, useMemo } from "react";
import { useT } from "@/i18n/context";
import { useSaved } from "@/hooks/useSaved";
import { useToggleSave } from "@/hooks/usePosts";
import PostCard from "@/components/common/PostCard";
import Pagination from "@/components/common/Pagination";
import HandleRender from "@/components/common/HandleRender";

export default function SavedPage() {
  const { t } = useT();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useSaved(page);
  const toggleSave = useToggleSave();

  const handleToggleSave = useCallback(
    (id: string, intent: "save" | "unsave") => {
      toggleSave.mutate({ postId: id, intent });
    },
    [toggleSave]
  );

  const posts = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  return (
    <div>
      <div className="feed-header">
        <h2>{t("saved.title")}</h2>
      </div>

      <HandleRender isLoading={isLoading} isError={isError} onRetry={refetch}>
        {posts.length === 0 ? (
          <p className="empty-state">{t("saved.empty")}</p>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleSave={handleToggleSave}
                isModerator={false}
                isSaving={toggleSave.isPending && toggleSave.variables?.postId === post.id}
              />
            ))}
            {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </HandleRender>
    </div>
  );
}
