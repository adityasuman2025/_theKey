"use client";

import { memo, useCallback } from "react";
import { useT } from "@/i18n/context";
import type { Post } from "@/api/client";

type Props = {
  post: Post;
  onToggleSave: (postId: string, intent: "save" | "unsave") => void;
  onDelete?: (postId: string) => void;
  isModerator: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
};

const PostCard = function PostCard({
  post,
  onToggleSave,
  onDelete,
  isModerator,
  isSaving = false,
  isDeleting = false,
}: Props) {
  const { t } = useT();

  const handleToggle = useCallback(() => {
    onToggleSave(post.id, post.hasSaved ? "unsave" : "save");
  }, [post.id, post.hasSaved, onToggleSave]);

  const handleDelete = useCallback(() => {
    if (confirm(t("post.delete_confirm"))) {
      onDelete?.(post.id);
    }
  }, [post.id, onDelete, t]);

  return (
    <article className="post-card">
      <div className="post-header">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-actions">
          <button
            className={`save-btn ${post.hasSaved ? "saved" : ""}`}
            onClick={handleToggle}
            disabled={isSaving || isDeleting}
          >
            <span aria-hidden="true">{post.hasSaved ? "★ " : "☆ "}</span>
            {post.hasSaved ? t("post.unsave") : t("post.save")}
          </button>
          {isModerator && onDelete && (
            <button
              className="delete-btn"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
            >
              {t("post.delete")}
            </button>
          )}
        </div>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-footer">
        <span>{t("saves_count", { count: post.savesCount })}</span>
      </div>
    </article>
  );
};

export default memo(PostCard);
