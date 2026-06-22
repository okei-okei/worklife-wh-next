# WorkLife WH

WorkLife WH is a Next.js App Router application for managing working-holiday jobs, housing, living-cost planning, resumes, and application support.

## Local development

```bash
npm install
npm run dev
```

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_EMAIL=worklife.wh@gmail.com
SUPABASE_SERVICE_ROLE_KEY=
```

## Listing workflow

1. A job or property listing is submitted from `/company/submit`.
2. Submission data is stored in `listing_submissions` with `status = pending`.
3. Listing images are uploaded to the `listing-images` Storage bucket.
4. An administrator reviews submissions at `/admin/submissions`.
5. Approval copies the structured data to `public_jobs` or `public_properties`.
6. Rejection keeps the listing private and stores `rejected_reason`.

Run the following migration in Supabase before enabling the expanded form:

```text
supabase/listing_workflow_enhancements.sql
```

The administrator email is configured with the server-only `ADMIN_EMAIL`.
`NEXT_PUBLIC_ADMIN_EMAIL` remains supported for backward compatibility. The
migration also prepares `profiles.role` for `admin` and `owner` role checks.

## Legal routes

The common footer links to the legal document set under `/legal`.
Document metadata and content are maintained in:

```text
app/legal/_data/legalDocuments.ts
```

Legal document versions are recorded during signup and listing consent flows.
Cookie consent UI is currently not displayed because the application only
uses necessary authentication cookies. The Cookie Policy remains published
for future analytics and advertising support.

## Application writing

Job application and property inquiry pages currently use template generation.
AI controls are disabled in the UI and reserved for a future opt-in release.

## Verification

```bash
npm run lint
npm run build
```
