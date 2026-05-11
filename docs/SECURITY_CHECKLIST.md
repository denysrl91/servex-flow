# Security Checklist

## Environment variables
- [ ] `.env` is in `.gitignore` and not tracked by git
- [ ] `.env.example` contains placeholders only — no real values
- [ ] No secret is read at module top-level in shared (client+server) files

## API keys
- [ ] Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` ship to the browser
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is referenced **only** from server functions / edge functions
- [ ] `LOVABLE_API_KEY` is never logged or returned in responses
- [ ] Third-party keys (Stripe, QuickBooks, Google, Microsoft, Calendly, etc.) live in Lovable Cloud Secrets

## Lovable Cloud / Supabase access
- [ ] Browser uses the publishable client only (`@/integrations/supabase/client`)
- [ ] Admin client (`client.server`) is imported **only** in `*.functions.ts` / `*.server.ts`
- [ ] No `localStorage` or cookies trusted as the source of auth state

## RLS policies
- [ ] Every business table has `ROW LEVEL SECURITY` enabled
- [ ] Tenant tables use `company_id = get_my_company_id()` for both `USING` and `WITH CHECK`
- [ ] `profiles` policies forbid changing `company_id` after creation
- [ ] `companies` UPDATE restricted to `is_company_admin(auth.uid(), id)`
- [ ] `notifications` scoped to `user_id = auth.uid() AND company_id = ...`

## Auth roles
- [ ] Roles stored in `user_roles` (NOT on `profiles`)
- [ ] `has_role()` / `is_company_admin()` are `SECURITY DEFINER` with `search_path = public`
- [ ] No client-side admin checks based on `localStorage` / hardcoded ids

## Company data isolation
- [ ] Every `INSERT` includes `company_id`
- [ ] Every list query is implicitly scoped through RLS (no service-role reads from the browser)
- [ ] Cross-tenant smoke test passes (user B cannot read user A's data)

## File storage
- [ ] Buckets that hold private files have RLS-equivalent storage policies
- [ ] Public buckets contain only intentionally-public assets (logos, avatars)

## Payment data
- [ ] No raw card numbers / CVVs are stored — tokens only
- [ ] Stripe webhook signature is verified before mutating data

## Third-party integrations
- [ ] Webhook routes live under `/api/public/*` and verify HMAC signatures
- [ ] OAuth client secrets stored in Cloud Secrets, not in code

## Error logging
- [ ] Errors are logged with `console.error` server-side, surfaced as toasts client-side
- [ ] Error messages shown to users never include secrets, tokens, or stack traces

## Backup & export
- [ ] Document how to export tables from Cloud → Database → Tables
- [ ] Schedule a periodic snapshot of critical tables