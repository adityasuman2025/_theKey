"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useUser } from "@/context/user";

export function useSaved(page: number) {
  const { currentUser } = useUser();

  return useQuery({
    queryKey: queryKeys.saved.list(page, currentUser?.id),
    queryFn: () =>
      apiClient.getSaved({
        userId: currentUser!.id,
        userRole: currentUser!.role,
        page,
      }),
    enabled: !!currentUser,
  });
}
