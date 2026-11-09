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
| Visitors | GET /api/admin/analytics/visitors · GET /events · GET /export (XLSX); filters: from, to, country, device, path |
| News | GET/POST /api/admin/news · GET/PATCH/DELETE /api/admin/news/:id · GET /api/admin/news/slug-check |
| Documents | GET/POST /api/admin/documents · GET/PATCH/DELETE /:id |
| Inquiries | GET /api/admin/inquiries · GET/PATCH /:id (status only; reply email not implemented) |
| FAQs | GET/POST /api/admin/faqs · GET/PATCH/DELETE /:id |
| Partners | GET/POST /api/admin/partners · GET/PATCH/DELETE /:id |
| Home | GET/POST /api/admin/home/banners · GET/PATCH/DELETE /:id · GET/PATCH /api/admin/home/intro |
| Pages | GET/POST /api/admin/pages · GET/PATCH/DELETE /:id · GET /api/admin/pages/slug-check |
| Settings | GET/PATCH /api/admin/site-settings |
| Media | GET /api/admin/media · GET /api/admin/media/audio-options · POST /api/admin/media/upload (multipart field `file`) · DELETE /:id |
| Users | GET/POST /api/admin/users · PATCH/DELETE /api/admin/users/:id (admin only) |

List responses expected as `PaginatedResponse<T>` `{ data, page, limit, total, totalPages }`; dates ISO 8601.

## Not implemented
Replying to inquiries by email, notifications, and upload progress reporting.

## File storage and previews

The portal resolves `/api/assets/...` and `/api/media/...` against
`VITE_DPO_API_BASE_URL` when showing images or opening files. Original
`/assets/dpo/...` paths are resolved through `/api/assets/dpo/...` for compatibility.
Stored values are preserved when editing and saving records.

Public website files are organized in the API's `uploads/assets/images`, `icons`,
`fonts`, `audio`, and `documents` directories. Original `/api/assets/dpo/...` URLs
are still supported by the API. New uploads use the existing authenticated
`POST /api/admin/media/upload` endpoint and are stored in `uploads/media/<UUID>`;
the response contains the URL and metadata to attach to a content record.
The Media list represents database `Media` records for admin uploads; imported
public files are referenced from their news, banner, page, or document records.

Settings audio pickers use `GET /api/admin/media/audio-options`, returning an array
of `{url, fileName}` for uploaded audio and the original files in `assets/audio`.
MP3, WAV, and OGG uploads are limited to 10 MB and checked by MIME type and file
signature. Selecting or uploading an audio file does not delete previous files;
the website changes only after saving Settings. Both footer audio fields protect
referenced uploads from deletion.

## Visitor monitor

`/visitors` renders real analytics reports using Recharts. It supports a full
monitor view, 30-second refresh with pause, date presets/custom ranges, country,
device and exact-path filters, landing-page statistics and XLSX export. Recent
anonymous events and detailed filters are collapsed so the overview emphasizes
graphs. The public site posts page views to `POST /api/analytics/visitors`.
Unique visitors are approximate distinct browsers; sessions expire after 30
minutes of inactivity. Detailed data covers the last 90 local calendar days.
Older footer counts are shown separately. Country results use the local IP
database or a verified proxy country header; localhost shows Unknown. See the
API project's `VISITORS.md` for deployment, DB-IP attribution and updates.

Visitor exports return `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
The client downloads the binary response as `.xlsx`; the workbook starts with a Summary sheet for Visitors, Sessions and Page views,
followed by the Visitors detail sheet. Both use the selected filters and one
database snapshot, with minimal headers, freeze panes and column filters.

Account deletion uses `DELETE /api/admin/users/:id` and returns 204. The server
rejects self-deletion, preserves an active admin, and serializes deletion with
role/status updates. Existing tokens stop working after the account is deleted.
The Users page requires confirmation and displays success/error container alerts.

Password reset uses `PATCH /api/admin/users/:id` with `{password}` (admin only).
Create/reset passwords accept 6–128 characters. The Users page has show/hide
password controls and a reset dialog with confirmation. Resetting increments
the private token version, invalidating previous sessions; resetting the signed-in
account clears its local session and returns to login. Deploy the Prisma migration
and regenerate the client before restarting the API. Existing accounts/tokens
remain valid until their password is reset.
