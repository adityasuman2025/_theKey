"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, type User } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import HandleRender from "@/components/common/HandleRender";

type UserContextValue = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch users dynamically using TanStack Query
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => apiClient.getUsers(),
  });

  const users = usersData?.data ?? [];

  // Default to first student once users list loads
  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      const firstStudent = users.find((u) => u.role === "student");
      if (firstStudent) setCurrentUser(firstStudent);
    }
  }, [users, currentUser]);

  const isLoading = usersLoading || !currentUser;

  return (
    <HandleRender isLoading={isLoading} isError={usersError} onRetry={refetchUsers}>
      <UserContext.Provider
        value={{ currentUser, setCurrentUser, users, isLoading }}
      >
        {children}
      </UserContext.Provider>
    </HandleRender>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
