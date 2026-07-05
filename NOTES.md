# NOTES.md

## Key Design Decisions

### Schema shape
- **`saved_posts`** uses a composite primary key `(user_id, post_id)` — this structurally prevents duplicate saves without needing a unique index.
- An `active` boolean column implements soft-delete. Un-saving sets `active = false`; re-saving sets `active = true` and refreshes `saved_at`. The row is never deleted, preserving full history.
- **`saves_count`** is denormalized on the `posts` table and updated atomically in the same operation as the `saved_posts` mutation. This avoids a `COUNT(*)` subquery on every feed request.

### Where auth lives
- The Express middleware (`server/src/middleware/auth.ts`) extracts credentials, and the `getUser` helper retrieves them cleanly.

### Efficient hasSaved / savesCount fetching
- The feed query uses a single `LEFT JOIN` on `saved_posts` (filtered to the current user) to hydrate `hasSaved` alongside the posts. No N+1 queries.
- `savesCount` comes directly from the denormalized column on `posts` — zero additional queries.

### Business logic separation
- `computeSaveTransition()` in `server/src/core/business.ts` is a pure state machine. Given the existing record state and the user's intent, it returns the exact action (`INSERT`, `REACTIVATE`, `SOFT_DELETE`, `NO_OP`), count delta, and resulting `hasSaved`. The route handler just applies the transition — it doesn't reason about idempotency itself.

### Client architecture
- **Typed API client** (`web/src/api/client.ts`) wraps `fetch` with typed request/response shapes and custom `ApiError` class. React Query hooks never call `fetch` directly.
- **Query-key factory** (`web/src/api/queryKeys.ts`) centralizes all cache keys for consistent invalidation.
- **Optimistic updates** on the save toggle: the mutation immediately updates all matching query caches (hasSaved + savesCount), then rolls back on error. This keeps the bookmark toggle feeling instant.

## Trade-offs and Descoped Items

- **Express over Elysia**: Used Express as the API router since it's the stack I'm more familiar with.
- **Stubbed auth**: User simulation via request headers + a dropdown selector. No JWT, sessions, or cookies.
- **No real-time updates**: Save counts don't update live across tabs/users. Would need WebSocket or polling.
- **No comments/likes**: The forum slice only includes posts and bookmarks — enough to make Saved Posts meaningful.

## What I'd Do Next With Another Day

1. **Real authentication** — JWT or session-based auth with proper login/logout flow.
3. **WebSocket for live counts** — broadcast `savesCount` changes so other users see updates in real time.
4. **Cursor-based pagination** — more robust than offset-based for feeds with frequent insertions.
6. **Optimistic UI for post creation** — immediately render the new post in the feed before the API confirms.
7. **Accessibility audit** — proper ARIA labels, keyboard navigation, focus management.
