---
name: security memory
description: Guidance for security scanners on accepted patterns in ServexIQ.
type: constraint
---
# Accepted patterns (do NOT re-flag)

- **Intra-tenant profile visibility**: `profiles` policy "Members view company profiles" intentionally exposes co-workers' name/email/phone to other authenticated members of the same `company_id`. This is required for a team SaaS (dispatch, assignment, contact). No cross-tenant leakage exists. Do not flag.

- **SECURITY DEFINER helpers** (`has_role`, `is_company_admin`, `get_my_company_id`, `ensure_user_workspace`, `handle_new_user`): intentionally callable by `authenticated`. They are the multi-tenant access primitives used by every RLS policy. Do not recommend revoking EXECUTE or switching to SECURITY INVOKER.
