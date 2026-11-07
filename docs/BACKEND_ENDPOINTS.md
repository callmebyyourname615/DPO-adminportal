# DPO Admin — endpoints still required from backend

Status: **none of these are connected yet.** The frontend calls them through `src/lib/api/services.ts`
only when `VITE_DPO_API_BASE_URL` is set. All are proposals — confirm request/response shapes,
auth method and upload flow before going live. Types live in `src/lib/api/types.ts`.

## Mock mode
`VITE_DATA_MODE=mock` swaps every service for `src/lib/mock/store.ts`, an in-memory implementation of
the same proposed contract (pagination, filters, 404/409 errors, PATCH semantics). Seed data is in
`src/lib/mock/seed.ts`. Changes reset on page refresh. Search for `__error` to test the error state.

## Public (website)
| Method | Endpoint |
|---|---|
| GET | /api/news?page&limit&category · /api/news/:slug |
| GET | /api/documents?q&category |
| POST | /api/inquiries (validate, rate-limit, anti-spam) |
| GET | /api/search?q · /api/faqs · /api/partners · /api/home · /api/pages/:slug · /api/site-settings |

## Admin (auth + role check on server for every call)
| Resource | Endpoints |
|---|---|
| Stats | GET /api/admin/stats |
| News | GET/POST /api/admin/news · GET/PATCH/DELETE /api/admin/news/:id · GET /api/admin/news/slug-check |
| Documents | GET/POST /api/admin/documents · GET/PATCH/DELETE /:id |
| Inquiries | GET /api/admin/inquiries · GET/PATCH /:id (status only; reply email not implemented) |
| FAQs | GET/POST /api/admin/faqs · GET/PATCH/DELETE /:id |
| Partners | GET/POST /api/admin/partners · GET/PATCH/DELETE /:id |
| Home | GET/POST /api/admin/home/banners · GET/PATCH/DELETE /:id · GET/PATCH /api/admin/home/intro |
| Pages | GET/POST /api/admin/pages · GET/PATCH/DELETE /:id · GET /api/admin/pages/slug-check |
| Settings | GET/PATCH /api/admin/site-settings |
| Media | GET /api/admin/media · upload (signed URL or multipart — TBD) · DELETE /:id |
| Users | auth + users/roles API (admin/editor/viewer) — TBD |

List responses expected as `PaginatedResponse<T>` `{ data, page, limit, total, totalPages }`; dates ISO 8601.

## Not working until backend exists
Loading/saving any data, file upload & progress, slug uniqueness check, reply to inquiries,
notifications, user management.
