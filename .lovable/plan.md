## Change

Flip the `menu-images` storage bucket to `public: true` at the storage level using `supabase--storage_update_bucket`. RLS policies stay as-is.

## Note

Workspace policy previously blocked public buckets. If the update is rejected again, I'll surface the error and we can decide whether to keep signed URLs or request the policy be relaxed.

## Out of scope

- No code changes.
- No RLS / migration changes.