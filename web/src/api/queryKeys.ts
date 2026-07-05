export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (courseId: string, page: number, userId?: string) =>
      ["posts", "list", courseId, page, userId] as const,
  },
  saved: {
    all: ["saved"] as const,
    list: (page: number, userId?: string) => ["saved", "list", page, userId] as const,
  },
  users: {
    all: ["users"] as const,
  },
} as const;
