# DPO Admin — API integration

The portal uses the DPO NestJS backend at `VITE_DPO_API_BASE_URL` (origin only). Admin requests use a bearer token from `/api/auth/login`; the token is kept in session storage, or local storage when remember me is selected, and expires after one hour. The backend enforces roles. There is no mock data fallback.

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
| Media | GET /api/admin/media · POST /api/admin/media/upload (multipart field `file`) · DELETE /:id |
| Users | GET/POST /api/admin/users · PATCH /api/admin/users/:id (admin only) |

List responses expected as `PaginatedResponse<T>` `{ data, page, limit, total, totalPages }`; dates ISO 8601.

## Not implemented
Replying to inquiries by email, notifications, and upload progress reporting.
