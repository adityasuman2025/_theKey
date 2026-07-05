"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/i18n/context";
import { useUser } from "@/context/user";
import { apiClient } from "@/api/client";
import { usePosts, useToggleSave, useDeletePost } from "@/hooks/usePosts";
import CourseTabs from "@/components/feed/CourseTabs";
import PostCard from "@/components/common/PostCard";
import NewPostForm from "@/components/feed/NewPostForm";
import Pagination from "@/components/common/Pagination";
import HandleRender from "@/components/common/HandleRender";

type CoursePostsProps = {
  courseId: string;
  courseTitle: string;
};

const CoursePosts = function CoursePosts({ courseId, courseTitle }: CoursePostsProps) {
  const { t } = useT();
  const { currentUser } = useUser();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [courseId]);

  const {
    data: postsData,
    isLoading: postsLoading,
    isError: postsError,
    refetch: refetchPosts,
  } = usePosts(courseId, page);

  const toggleSave = useToggleSave();
  const deletePost = useDeletePost();

  const handleToggleSave = useCallback(
    (id: string, intent: "save" | "unsave") => {
      toggleSave.mutate({ postId: id, intent });
    },
    [toggleSave]
  );

  const handleDeletePost = useCallback(
    (id: string) => {
      deletePost.mutate(id);
    },
    [deletePost]
  );

  const posts = useMemo(() => postsData?.data ?? [], [postsData?.data]);
  const meta = postsData?.meta;
  const isMod = currentUser?.role === "moderator";

  return (
    <HandleRender isLoading={postsLoading} isError={postsError} onRetry={refetchPosts}>
      <>
        <div className="feed-header">
          <h2>{courseTitle}</h2>
          <NewPostForm courseId={courseId} />
        </div>

        {posts.length === 0 ? (
          <p className="empty-state">{t("feed.empty")}</p>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleSave={handleToggleSave}
                onDelete={isMod ? handleDeletePost : undefined}
                isModerator={isMod ?? false}
                isSaving={toggleSave.isPending && toggleSave.variables?.postId === post.id}
                isDeleting={deletePost.isPending && deletePost.variables === post.id}
              />
            ))}
            {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </>
    </HandleRender>
  );
};

const MemoizedCoursePosts = memo(CoursePosts);

export default function HomePage() {
  const { currentUser } = useUser();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.getCourses(),
  });

  const courses = useMemo(() => coursesData?.data ?? [], [coursesData?.data]);

  useEffect(() => {
    setActiveCourseId(null);
  }, [currentUser?.id]);

  useEffect(() => {
    if (courses.length > 0 && !activeCourseId) {
      setActiveCourseId(courses[0].id);
    }
  }, [courses, activeCourseId]);

  const activeCourseTitle = useMemo(() => {
    return courses.find((c) => c.id === activeCourseId)?.title ?? "";
  }, [courses, activeCourseId]);

  return (
    <HandleRender isLoading={coursesLoading} isError={coursesError} onRetry={refetchCourses}>
      <div>
        <CourseTabs
          courses={courses}
          activeCourseId={activeCourseId}
          onSelectCourse={setActiveCourseId}
        />

        {activeCourseId && (
          <MemoizedCoursePosts
            courseId={activeCourseId}
            courseTitle={activeCourseTitle}
          />
        )}
      </div>
    </HandleRender>
  );
}
