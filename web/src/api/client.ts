// ── Shared response types ──

export type Post = {
  id: string;
  title: string;
  content: string;
  courseId: string;
  authorId: string;
  createdAt: number;
  savesCount: number;
  hasSaved: boolean;
};

export type SavedPost = Post & {
  savedAt: number;
};

export type User = {
  id: string;
  name: string;
  role: "student" | "moderator";
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

export type ToggleSaveResponse = {
  data: {
    postId: string;
    hasSaved: boolean;
    savesCount: number;
  };
};

// ── Typed API client ──

type ClientOptions = {
  userId: string;
  userRole: string;
};

function buildHeaders(opts: ClientOptions): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-user-id": opts.userId,
    "x-user-role": opts.userRole,
  };
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = {
  getPosts(
    opts: ClientOptions & { courseId: string; page?: number; limit?: number }
  ) {
    const params = new URLSearchParams({
      courseId: opts.courseId,
      page: String(opts.page ?? 1),
      limit: String(opts.limit ?? 10),
    });
    return request<PaginatedResponse<Post>>(`/api/posts?${params}`, {
      headers: buildHeaders(opts),
    });
  },

  createPost(
    opts: ClientOptions & { title: string; content: string; courseId: string }
  ) {
    return request<{ data: Post }>("/api/posts", {
      method: "POST",
      headers: buildHeaders(opts),
      body: JSON.stringify({
        title: opts.title,
        content: opts.content,
        courseId: opts.courseId,
      }),
    });
  },

  deletePost(opts: ClientOptions & { postId: string }) {
    return request<{ success: boolean }>(`/api/posts/${opts.postId}`, {
      method: "DELETE",
      headers: buildHeaders(opts),
    });
  },

  getSaved(opts: ClientOptions & { page?: number; limit?: number }) {
    const params = new URLSearchParams({
      page: String(opts.page ?? 1),
      limit: String(opts.limit ?? 10),
    });
    return request<PaginatedResponse<SavedPost>>(`/api/saved?${params}`, {
      headers: buildHeaders(opts),
    });
  },

  toggleSave(
    opts: ClientOptions & { postId: string; intent: "save" | "unsave" }
  ) {
    return request<ToggleSaveResponse>("/api/saved", {
      method: "POST",
      headers: buildHeaders(opts),
      body: JSON.stringify({ postId: opts.postId, intent: opts.intent }),
    });
  },

  getCourses() {
    return request<{ data: { id: string; title: string }[] }>("/api/courses", {});
  },

  getUsers() {
    return request<{ data: User[] }>("/api/users", {});
  },
};
