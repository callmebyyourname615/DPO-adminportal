> **Current integration:** The portal now uses the real DPO API only. Set `VITE_DPO_API_BASE_URL` to the API origin (for example `http://localhost:3000`), start the API and sign in with an admin account. The legacy mock-mode instructions below are obsolete. See [API endpoints](docs/BACKEND_ENDPOINTS.md).

# DPO Content Hub

# Lovable prompt — DPO Admin Portal

แนบไฟล์ `admin-dashboard-reference.jpg`, `tokens.css` และ `LOVABLE_BRIEF.md` พร้อม prompt นี้

---

สร้าง DPO Admin Portal สำหรับจัดการเนื้อหาของเว็บไซต์สำนักงานปกป้องเงินฝาก โดยใช้ภาพ dashboard ที่แนบเป็น reference หลักด้านโครงสร้าง ความหนาแน่น การ์ด ตาราง กราฟ และ sidebar ใช้ design token และแนวทางจากไฟล์ที่แนบ เปลี่ยนธีมแดงในภาพเป็นสีน้ำเงิน DPO ตาม `tokens.css` และรักษาสีแดงไว้สำหรับ error / destructive action เท่านั้น

## ขอบเขต

สร้าง frontend admin portal ที่รองรับ desktop, tablet และ mobile พร้อมหน้าและฟอร์มตามรายการด้านล่าง โดยให้ API ที่ระบุเป็น **สัญญาเสนอสำหรับการเชื่อมต่อในอนาคต** ไม่ต้องอ้างว่า API มีอยู่หรือส่งข้อมูลสำเร็จหากยังไม่มี backend จริง แยก API client / data service ออกจาก components และใช้ environment variable สำหรับ base URL; ไม่ใส่ credentials หรือ secret ใน frontend หาก API ยังไม่มี ให้แสดงสถานะ “ยังไม่ได้เชื่อมต่อ API” พร้อม loading, empty และ error states ที่ชัดเจน ห้ามสร้างข้อมูลทางธุรกิจปลอมเพื่อแสดงเป็นข้อมูลจริง

หากนำไปใช้กับโปรเจกต์ IT Remind ที่มีอยู่ ให้รักษา authentication, permission, Supabase integration และข้อมูลเดิม ไม่ลบหรือแทนที่ระบบที่ใช้งานอยู่ ใช้ข้อมูลจริงเมื่อมีการเชื่อมต่อเท่านั้น หากสร้างเป็นโปรเจกต์ DPO ใหม่ ให้เตรียมโครงสร้าง route และ service โดยไม่สร้างระบบ backend ปลอม

## หน้าที่ต้องสร้าง

1. **Dashboard** — ภาพรวมข่าว เอกสาร คำถามติดต่อ และข้อมูลอื่นที่มี API รองรับ แสดง KPI, กราฟ, รายการล่าสุด และสถานะการเชื่อมต่อ เฉพาะค่าที่ได้จาก API จริง หากยังไม่มี endpoint สำหรับสถิติ ให้แสดง placeholder ว่า “ยังไม่มีข้อมูล” ไม่คำนวณหรืออ้างเป็นตัวเลขจริง
2. **จัดการข่าว** — ตารางข่าว ค้นหา/กรองหมวดหมู่และแบ่งหน้า พร้อมหน้าเพิ่ม/แก้ไข title, slug, category, excerpt, เนื้อหา, ภาพปก, gallery, วันที่ และสถานะ draft/published แสดง preview และลิงก์ไปหน้าข่าวสาธารณะ รองรับข่าวความร่วมมือสากลด้วยหมวดหมู่ `international`
3. **จัดการเอกสาร** — ตาราง PDF/XLSX ค้นหา กรองประเภท ได้แก่ ดำรัส ข้อตกลง แจ้งการ แบบพิมพ์ บทแนะนำ FSNP และข้อมูลทั่วไป พร้อมหน้าเพิ่ม/แก้ไขชื่อ หมวด วันที่ และไฟล์ รวม action เปิดดู ดาวน์โหลด และสถานะไฟล์
4. **กล่องคำถามติดต่อ** — รายการข้อความจากหน้าติดต่อและ FAQ แสดงชื่อ อีเมล หัวข้อ ข้อความ วันที่ และสถานะ พร้อมหน้ารายละเอียดและตัวกรองสถานะ ห้ามแสดงว่าส่งตอบกลับได้หากไม่มี API รองรับ
5. **จัดการ FAQ** — รายการคำถาม/คำตอบ เพิ่ม แก้ไข จัดลำดับ และเปิด/ปิดการเผยแพร่ พร้อม preview แบบ accordion
6. **จัดการหน่วยงานเชื่อมต่อ** — เพิ่ม/แก้ไขชื่อหน่วยงาน โลโก้ ที่อยู่ ข้อมูลติดต่อ URL และลำดับการแสดง ตรวจสอบรูปแบบ URL ก่อนบันทึก
7. **จัดการหน้าแรก** — รายการ banner พร้อมภาพ ลิงก์ ลำดับและสถานะ; ส่วนเนื้อหาแนะนำ พร้อม preview
8. **จัดการหน้าเนื้อหา** — เกี่ยวกับ ประวัติ พันธกิจ/หน้าที่ และโครงสร้างองค์กร จัดการ title, slug, เนื้อหา รูป และสถานะ พร้อม preview
9. **ตั้งค่าเว็บไซต์** — อีเมล เบอร์โทร ที่อยู่ ลิงก์โซเชียล แผนที่ และไฟล์เสียงของ footer พร้อมฟอร์มแก้ไข
10. **จัดการไฟล์สื่อ** — รายการรูป/PDF/XLSX แสดงชื่อ ชนิด ขนาด วันที่ อัปโหลด และเลือกไฟล์สำหรับเนื้อหา โดยออกแบบให้ต่อกับ object storage ในอนาคต; แสดง validation และ upload progress เมื่อ backend รองรับ
11. **ผู้ใช้และสิทธิ์** — ออกแบบหน้าเฉพาะเมื่อระบบ auth และ admin API รองรับจริง แยกสิทธิ์ admin/editor/viewer และตรวจสอบสิทธิ์ทั้งฝั่ง UI และ backend ห้ามสร้างการอนุมัติปลอมผ่าน frontend

## สัญญา API สาธารณะที่ frontend เว็บไซต์จะใช้

| Method | Endpoint | ข้อมูล |
| --- | --- | --- |
| GET | `/api/news?page=1&limit=10&category=...` | รายการข่าวและ pagination |
| GET | `/api/news/:slug` | เนื้อหาและรูปข่าว |
| GET | `/api/documents?q=...&category=...` | รายการและผลค้นหาเอกสาร |
| POST | `/api/inquiries` | รับชื่อ อีเมล หัวข้อ และข้อความจากหน้าสาธารณะ |
| GET | `/api/search?q=...` | ค้นหาข่าว เอกสาร และหน้าเนื้อหา |
| GET | `/api/faqs` | รายการ FAQ ที่เผยแพร่ |
| GET | `/api/partners` | รายการหน่วยงานเชื่อมต่อ |
| GET | `/api/home` | banner และเนื้อหาหน้าแรก |
| GET | `/api/pages/:slug` | เนื้อหาหน้าสถาบันตาม slug |
| GET | `/api/site-settings` | ข้อมูล footer และช่องทางติดต่อที่เผยแพร่ |

Admin ต้องมี API เพิ่มสำหรับอ่านข้อมูลที่ยังไม่เผยแพร่ สร้าง/แก้ไข/ลบเนื้อหา จัดการไฟล์ และอ่าน/จัดการข้อความติดต่อ เช่น `/api/admin/news`, `/api/admin/documents`, `/api/admin/inquiries`, `/api/admin/faqs`, `/api/admin/partners`, `/api/admin/home`, `/api/admin/pages`, `/api/admin/site-settings`, `/api/admin/media` ซึ่งเป็น **ข้อเสนอ endpoint เท่านั้น** ให้ยืนยัน contract กับ backend ก่อนเชื่อมต่อจริง อย่าใช้ public `POST /api/inquiries` เป็น API สำหรับแอดมินอ่าน inbox

## Data และการเชื่อมต่อ

- กำหนด TypeScript types สำหรับ `News`, `Document`, `Inquiry`, `FAQ`, `Partner`, `Banner`, `Page`, `SiteSettings`, `Media` และ `PaginatedResponse` โดยเตรียม ID, timestamps, publish status และ fields ที่เกี่ยวข้อง
- บันทึกวันที่เป็น ISO 8601 จาก API แล้วจัดรูปแบบตาม locale ใน UI; ตรวจสอบ slug ซ้ำกับ backend เมื่อมี endpoint รองรับ
- เตรียมจุดเชื่อม `GET`, `POST`, `PATCH`, `DELETE` สำหรับ admin ผ่าน service layer แต่ไม่เดารูปแบบ response, auth token หรือ upload flow ว่ามีอยู่จริง ให้แสดงสถานะยังไม่เชื่อมต่อจนกว่าจะกำหนด contract
- กรอกฟอร์มแล้วต้องมี validation, loading, success/error feedback ตามผลจริง; confirm ก่อนลบหรือยกเลิกการเผยแพร่ และห้ามแสดง success แบบสมมติ
- ไฟล์ขนาดใหญ่ให้แสดงขนาดและความคืบหน้าเมื่อ upload API รองรับ เก็บไฟล์ใน object storage ผ่าน backend หรือ signed upload ที่ปลอดภัยตาม contract; ไม่ embed base64 ลง database โดยอัตโนมัติ
- ออกแบบการค้นหา, pagination, filter และ empty state ให้รองรับข้อมูลจริง คำค้นภาษาลาว และ URL query parameters
- ข้อมูลติดต่อเป็นข้อมูลส่วนบุคคล: จำกัดสิทธิ์เข้าถึง/จัดการที่ backend, ตรวจสอบข้อมูลขาเข้า และเตรียมป้องกัน spam/rate limiting สำหรับ endpoint สาธารณะ

## UX และมาตรฐานการส่งมอบ

- Sidebar แสดงเมนู Dashboard, ข่าว, เอกสาร, ข้อความติดต่อ, FAQ, หน่วยงานเชื่อมต่อ, หน้าแรก, หน้าเนื้อหา, สื่อ และตั้งค่า; แสดงผู้ใช้/สิทธิ์เฉพาะระบบที่รองรับ
- ทุกหน้ามี page title, breadcrumb, action หลัก, ตารางหรือฟอร์ม, loading/empty/error states และ responsive layout ตามความเหมาะสม
- ใช้ข้อความภาษาไทยหรือลาวที่สอดคล้องกันทั้งระบบ และเตรียมโครงสร้างแปลภาษา ไม่ใช้ข้อความฟิตเนสจากภาพ
- รองรับคีย์บอร์ด, focus-visible, labels, alt text และ reduced motion; กราฟมี legend/ข้อความประกอบ
- นำ `tokens.css` ไปใช้โดยแก้ CSS cascade ตาม `LOVABLE_BRIEF.md`; ตรวจ hard-coded สีแดงเดิมและคงสีสถานะ error ไว้
- ส่งมอบ UI routes, reusable components, API types/service interfaces, ตัวอย่าง `.env.example` ที่ไม่มีความลับ และรายการ endpoint ที่ยังต้องทำฝั่ง backend พร้อมระบุอย่างชัดเจนว่าฟังก์ชันใดยังเชื่อมต่อไม่ได้

เริ่มจากสร้าง frontend ทั้งชุดและโครงสร้าง integration ให้พร้อม โดยไม่ deploy และไม่แก้ backend หรือข้อมูลจริง เว้นแต่ได้รับคำสั่งเพิ่มเติม

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c3d3bb18-671f-4d66-98b3-46d7d2474add).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
