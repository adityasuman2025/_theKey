"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type Post, type PaginatedResponse } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useUser } from "@/context/user";

export function usePosts(courseId: string | null, page: number) {
  const { currentUser } = useUser();

  return useQuery({
    queryKey: queryKeys.posts.list(courseId ?? "", page, currentUser?.id),
    queryFn: () =>
      apiClient.getPosts({
        userId: currentUser!.id,
        userRole: currentUser!.role,
        courseId: courseId!,
        page,
      }),
    enabled: !!currentUser && !!courseId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  return useMutation({
    mutationFn: (params: { title: string; content: string; courseId: string }) =>
      apiClient.createPost({ userId: currentUser!.id, userRole: currentUser!.role, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  return useMutation({
    mutationFn: (params: { postId: string; intent: "save" | "unsave" }) =>
      apiClient.toggleSave({ userId: currentUser!.id, userRole: currentUser!.role, ...params }),
    onMutate: async ({ postId, intent }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.saved.all });

      const prev = queryClient.getQueriesData<PaginatedResponse<Post>>({ queryKey: queryKeys.posts.all });

      queryClient.setQueriesData<PaginatedResponse<Post>>(
        { queryKey: queryKeys.posts.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === postId
                ? { ...p, hasSaved: intent === "save", savesCount: p.savesCount + (intent === "save" ? 1 : -1) }
                : p
            ),
          };
        }
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.saved.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  return useMutation({
    mutationFn: (postId: string) =>
      apiClient.deletePost({ userId: currentUser!.id, userRole: currentUser!.role, postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.saved.all });
    },
  });
}
