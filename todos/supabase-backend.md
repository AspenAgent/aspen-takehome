# Supabase backend

## Problem

Today all persistent state lives in two files:
- `data/contact.ts` / `data/advisor.ts` — hardcoded, per-user.
- `data/palettes.json` — grows on generation, race-y on concurrent writes.

Neither shape survives multi-user, multi-advisor, or a serverless
deployment where the filesystem is read-only.

## Why not MVP

- A take-home with one seeded client doesn't need a database.
- Supabase setup (project creation, migration discipline, RLS policies)
  is 30-60 minutes of undifferentiated work that doesn't demonstrate the
  agent.

## Sketch

The three Supabase repositories are already scaffolded in
`lib/data/repositories/supabase/` — each one throws "not wired." Wiring
looks like:

1. Create a Supabase project; copy URL + anon key into `.env.local`.
2. Add `@supabase/supabase-js` to dependencies.
3. Migrations:
   ```sql
   create table clients (
     id text primary key,
     name text not null,
     age int not null,
     state text not null,
     occupation text not null,
     investable_assets text not null,
     goals text not null,
     notes text not null
   );
   create table advisors (
     id text primary key,
     name text not null,
     firm text not null,
     email text not null,
     phone text not null,
     disclosure text not null
   );
   create table palettes (
     id text primary key,  -- advisorId:clientId
     name text not null,
     rationale text not null,
     tokens jsonb not null,
     typography jsonb not null,
     created_at timestamptz not null default now(),
     revisions jsonb not null default '[]'
   );
   ```
4. Replace each `throw new Error("not wired")` with the actual client call;
   return `Zod.parse(row)` so the schema invariants are still enforced.
5. Set `DATA_BACKEND=supabase` in `.env.local`.

## Existing seams that make it small

- Repository interface pattern is already in place; no code outside
  `lib/data/repositories/` needs to change.
- Zod schemas are the SQL contract — every column has a matching field.
- Palette id format (`advisorId:clientId`) is already the natural primary
  key.
- The JSON versions stay intact as a development/offline fallback.
