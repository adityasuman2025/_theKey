"use client";

import { useState, memo, useCallback } from "react";
import { useT } from "@/i18n/context";
import { useCreatePost } from "@/hooks/usePosts";

type Props = {
  courseId: string;
};

const NewPostForm = function NewPostForm({ courseId }: Props) {
  const { t } = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createPost = useCreatePost();

  const isCreating = createPost.isPending;

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (title.trim() && content.trim() && !isCreating) {
        createPost.mutate(
          { title: title.trim(), content: content.trim(), courseId },
          {
            onSuccess: () => {
              setIsOpen(false);
              setTitle("");
              setContent("");
            },
          }
        );
      }
    },
    [title, content, isCreating, courseId, createPost]
  );

  if (!isOpen) {
    return (
      <div className="new-post-trigger">
        <button onClick={handleOpen}>{t("feed.new_post")}</button>
      </div>
    );
  }

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={t("form.title_placeholder")}
        value={title}
        onChange={handleTitleChange}
        disabled={isCreating}
        required
      />
      <textarea
        placeholder={t("form.content_placeholder")}
        value={content}
        onChange={handleContentChange}
        rows={4}
        disabled={isCreating}
        required
      />
      <div className="form-actions">
        <button type="submit" disabled={isCreating}>
          {isCreating ? t("loading") : t("form.submit")}
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={isCreating}
        >
          {t("form.cancel")}
        </button>
      </div>
    </form>
  );
};

export default memo(NewPostForm);
