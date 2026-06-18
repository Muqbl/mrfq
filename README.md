# مِرفق — MRFQ
## Facilities Management & Operations Platform

منصة متكاملة لإدارة المرافق تشمل وحدات النظافة والصيانة والضيافة مع دعم كامل للأدوار المتعددة وسير العمل التشغيلي.

---

## الوحدات (Modules)

### 🧹 النظافة — Cleaning
- بلاغات نظافة من الموظفين أو المشرفين
- توجيه تلقائي للعمال أو قائمة انتظار المشرف
- تقارير دورية مع صور ومهام مرفقة
- اعتماد / رفض / إعادة تنظيف
- تقييم الفنيين من المشرف والمدير
- لوحة أداء شهرية (منصة تكريم + جدول كامل)
- جدولة مهام متكررة

### 🔧 الصيانة — Maintenance
- أوامر عمل مع تتبع حالة تفصيلي (diagnosing → in_progress → waiting_verification → completed)
- إسناد فنيين وتحديد قائد الفريق (lead technician)
- إدارة قطع الغيار (spare parts) وربطها بأوامر العمل
- أصول ومعدات (assets) مع تتبع الحالة
- جدولة صيانة دورية
- تقارير بتقييمات المشرف والمدير
- لوحة أداء موحدة مع وحدة النظافة
- تصعيد تلقائي عند تجاوز SLA

### ☕ الضيافة — Hospitality
- قائمة أصناف مع صور وتصنيفات وفئات
- إدارة مطابخ وتعيين المسؤولين
- طلبات ضيافة موثّقة (للمستخدمين المسجلين)
- **صفحة طلب عامة** بدون تسجيل دخول (`/order/hospitality`)
- تتبع الحالة من التقديم حتى التسليم
- توزيع الطلبات على المطابخ والعمال

---

## الأدوار (Roles)

| الدور | الصلاحيات الرئيسية |
|-------|-------------------|
| `system_admin` | وصول كامل لجميع الوحدات، إدارة المستخدمين، الحذف، التقارير |
| `facility_manager` | صلاحيات واسعة في جميع الوحدات، الحذف، تقارير الأداء |
| `cleaning_manager` | إدارة كاملة لوحدة النظافة، اعتماد تقارير، تقييم العمال |
| `cleaning_supervisor` | إشراف على الفريق، مراجعة البلاغات، توزيع المهام |
| `cleaner` | تنفيذ المهام، رفع التقارير مع الصور |
| `maintenance_manager` | إدارة كاملة للصيانة، أوامر العمل، القطع، الأصول |
| `maintenance_supervisor` | إشراف على الفريق، مراجعة أوامر العمل |
| `maintenance_worker` | قبول وتنفيذ أوامر العمل، رفع تقارير الإغلاق |
| `hospitality_manager` | إدارة القائمة، المطابخ، الطلبات |
| `hospitality_supervisor` | إسناد الطلبات، متابعة التنفيذ |
| `hospitality_worker` | استلام وتنفيذ طلبات الضيافة |
| `employee` | تقديم طلبات نظافة وصيانة وضيافة، متابعة حالة الطلبات |

---

## معادلة الأداء (Performance Score)

تُحسب نقاط كل فني/عامل بالمعادلة الموحدة في جميع الوحدات:

```
النقاط = (معدل الاعتماد × 40%) + (تقييم المشرف / 5 × 100 × 30%) + (تقييم المدير / 5 × 100 × 20%) + (100 - عبء العمل × 10%)
```

---

## البنية التقنية (Architecture)

```
MRFQ/
├── public/
│   ├── app.js          # تطبيق SPA كامل (vanilla JS، ~7500+ سطر)
│   ├── style.css       # تصميم كامل مع CSS Variables ودعم RTL
│   └── assets/         # خطوط، شعارات، صور القائمة
├── server.js           # Node.js HTTP server، API routes، SQLite
├── data.db             # قاعدة بيانات SQLite
└── package.json
```

### Stack
- **Frontend:** Vanilla JS (SPA)، CSS Variables، PWA-ready
- **Backend:** Node.js (built-in `http` module، no framework)
- **Database:** SQLite via `better-sqlite3`
- **Auth:** Session-based (JWT in cookie)
- **Realtime:** Server-Sent Events (SSE) للتحديثات الفورية

---

## التشغيل (Run Locally)

```bash
npm install
node server.js
# → http://localhost:3000
```

---

## ملفات الهوية المطلوبة

ضع الملفات التالية داخل `public/assets/`:

```
mrfq-logo-icon-dark-v4.svg
mrfq-logo-icon-light-v4.svg
IBMPlexSansArabic-Regular.ttf
IBMPlexSansArabic-Medium.ttf
IBMPlexSansArabic-SemiBold.ttf
IBMPlexSansArabic-Bold.ttf
```

---

## نقاط النهاية الرئيسية (Key API Endpoints)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `POST` | `/api/auth/login` | تسجيل دخول |
| `GET` | `/api/data` | تحميل بيانات الجلسة |
| `POST` | `/api/order` | تقديم طلب نظافة أو صيانة (employee) |
| `GET/POST` | `/api/tickets` | تذاكر النظافة |
| `GET/POST` | `/api/maintenance-tickets` | أوامر عمل الصيانة |
| `GET/POST` | `/api/hospitality/orders` | طلبات الضيافة (مسجّل) |
| `GET/POST` | `/api/public/hospitality/orders` | طلبات الضيافة (عام، بدون تسجيل) |
| `GET` | `/api/performance` | بيانات أداء عمال النظافة |
| `GET` | `/api/reports` | تقارير النظافة |
| `GET` | `/api/maintenance-reports` | تقارير الصيانة |

---

## اللغات

النظام يدعم العربية والإنجليزية بالكامل مع تبديل فوري بدون إعادة تحميل الصفحة.
