# Production QA Checklist

Run through this list before publishing or onboarding a paying customer.

## Authentication
- [ ] Sign up creates a profile, company, and `owner` role automatically
- [ ] Login redirects to `/`
- [ ] Forgot/reset password flow works end-to-end
- [ ] Sign out clears the session
- [ ] Protected routes redirect unauthenticated users to `/login`

## Company / Workspace
- [ ] `companyId` is available across the app after login
- [ ] Sidebar footer + header show the real company name (no `Acme`/`Northstar`/`Bay Area`)
- [ ] Company Settings page saves and reloads correctly

## Customers / Properties / Equipment
- [ ] Add, edit, delete a customer
- [ ] Add a property under that customer
- [ ] Add equipment under that property; persists after refresh

## Jobs / Schedule / Dispatch
- [ ] Create a job; appears on Schedule and Dispatch
- [ ] Assign a technician; status updates persist
- [ ] Reschedule and cancel a job

## Estimates / Invoices / Payments
- [ ] Create estimate with options + line items
- [ ] Approve estimate, convert to invoice (line items carry over)
- [ ] Record partial then full payment; status flips `partial` → `paid`

## Inventory
- [ ] Add an item; edit quantity to trigger low-stock alert
- [ ] Delete an item

## Technicians / Tickets / Reports / Settings
- [ ] Add a technician
- [ ] Open a service ticket
- [ ] Reports show real numbers (or empty state)
- [ ] Settings save successfully

## Mobile / iPad
- [ ] Sidebar opens/closes via SidebarTrigger
- [ ] No horizontal page overflow at 375px
- [ ] Tables scroll horizontally inside their cards
- [ ] Dialogs fit screen and scroll internally

## Security
- [ ] `.env` is **not** committed (verify with `git ls-files | grep .env`)
- [ ] No service-role keys, tokens, or third-party secrets in `src/`
- [ ] Every business table has RLS enabled and `company_id = get_my_company_id()`
- [ ] Cross-tenant test: log in as user B, cannot read user A's records

## Error handling
- [ ] Failed inserts/updates/deletes show a toast
- [ ] Global error boundary renders fallback (not a blank page) on crash
- [ ] Console has no unhandled-promise warnings during normal use

## Performance
- [ ] Initial route under ~3s on 4G throttling
- [ ] No N+1 query storms in dashboard / list pages
- [ ] Images are sized; no layout shift on load

## Final launch approval
- [ ] Owner has reviewed Company Settings (logo, address, tax, prefixes)
- [ ] At least one real customer + job + invoice exists
- [ ] Backup/export plan documented
- [ ] On-call contact set