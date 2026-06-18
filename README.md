# مِرفق — MRFQ
## Facilities Management & Operations Platform

منصة متكاملة لإدارة المرافق تشمل وحدات النظافة والصيانة والضيافة مع دعم كامل للأدوار المتعددة وسير العمل التشغيلي.

---

## الوحدات (Modules)

### 🧹 النظافة — Cleaning
- بلاغات نظافة من الموظفين أو المشرفين
- توجيه تلقائي للعمال أو قائمة انتظار المشرف
- تقارير دورية مع صور قبل/بعد ومهام مرفقة
- اعتماد / رفض / إعادة تنظيف من المشرف
- تقييم الفنيين من المشرف والمدير
- لوحة أداء شهرية (منصة تكريم + جدول كامل)
- جدولة مهام متكررة مع توليد تلقائي

### 🔧 الصيانة — Maintenance
- أوامر عمل مع تتبع حالة تفصيلي (submitted → diagnosing → in_progress → waiting_verification → completed)
- إسناد فنيين وتحديد قائد الفريق (lead technician)
- إدارة قطع الغيار (spare parts) وربطها بأوامر العمل
- أصول ومعدات (assets) مع تتبع الحالة
- جدولة صيانة وقائية (preventive)
- تقارير بتقييمات المشرف والمدير
- لوحة أداء موحدة مع وحدة النظافة
- تصعيد تلقائي عند تجاوز SLA

### ☕ الضيافة — Hospitality
- قائمة أصناف مع صور وتصنيفات وفئات وترتيب مخصص
- إدارة مطابخ وتعيين العمال المسؤولين
- طلبات ضيافة من **قناة الموظف** داخل التطبيق (بعد تسجيل دخول)
- **صفحة طلب عامة** بدون تسجيل دخول (`/order/hospitality`)
- تتبع الحالة من التقديم حتى التسليم (accepted → preparing → ready → out_for_delivery → delivered)
- توزيع الطلبات على المطابخ والعمال
- سجل نشاط تفصيلي لكل طلب
- تتبع SLA (60 دقيقة) مع تنبيه للطلبات المتأخرة

### 👤 الموظف — Employee
- ثلاث قنوات خدمة: نظافة / صيانة / ضيافة
- كل قناة قابلة للتفعيل/التعطيل من لوحة الإعدادات
- موقع المكتب الافتراضي يملأ تلقائياً في طلبات الضيافة
- تاريخ شامل لجميع الطلبات مع حالة كل طلب

---

## الأدوار (Roles)

| الدور | الصلاحيات الرئيسية |
|-------|-------------------|
| `system_admin` | وصول كامل لجميع الوحدات، إدارة المستخدمين، الحذف، التقارير، الإعدادات |
| `facility_manager` | صلاحيات واسعة في جميع الوحدات، الحذف، تقارير الأداء |
| `cleaning_manager` | إدارة كاملة لوحدة النظافة، اعتماد تقارير، تقييم العمال، حذف التذاكر |
| `cleaning_supervisor` | إشراف على الفريق، مراجعة البلاغات، توزيع المهام، تقييم العمال |
| `cleaner` | تنفيذ المهام، رفع التقارير مع صور قبل/بعد |
| `maintenance_manager` | إدارة كاملة للصيانة، أوامر العمل، القطع، الأصول، الحذف |
| `maintenance_supervisor` | إشراف على الفريق، مراجعة أوامر العمل، التقييم |
| `maintenance_worker` | قبول وتنفيذ أوامر العمل، رفع تقارير الإغلاق |
| `hospitality_manager` | إدارة القائمة والمطابخ والطلبات، تجاوز أي حالة |
| `hospitality_supervisor` | إسناد الطلبات، متابعة التنفيذ، تتبع SLA |
| `hospitality_worker` | استلام وتنفيذ طلبات الضيافة حتى التسليم |
| `employee` | تقديم طلبات نظافة وصيانة وضيافة، متابعة حالة الطلبات |

---

## مصفوفة الصلاحيات (Permission Matrix)

| الدور | إنشاء | مراجعة تقارير | حذف | إسناد | تقييم عمال |
|-------|:-----:|:-------------:|:---:|:-----:|:----------:|
| system_admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| facility_manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| cleaning_manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| cleaning_supervisor | ✅ | ✅ | ❌ | ✅ | ✅ |
| cleaner | ❌ | ❌ | ❌ | ❌ | ❌ |
| maintenance_manager | ✅ | ✅ | ✅ | ✅ | ✅ |
| maintenance_supervisor | ✅ | ✅ | ❌ | ✅ | ✅ |
| maintenance_worker | ❌ | ❌ | ❌ | ❌ | ❌ |
| hospitality_manager | ✅ | ✅ | ❌ | ✅ | ✅ |
| hospitality_supervisor | ✅ | ✅ | ❌ | ✅ | ✅ |
| hospitality_worker | ❌ | ❌ | ❌ | ❌ | ❌ |
| employee | ✅* | ❌ | ❌ | ❌ | ❌ |

*الموظف يقدم طلبات (requests)، وليس أوامر عمل (work orders)

---

## معادلة الأداء (Performance Score)

تُحسب نقاط كل فني/عامل بالمعادلة الموحدة في جميع الوحدات (نظافة وصيانة):

```
النقاط = (معدل الاعتماد × 40%) + (تقييم المشرف / 5 × 100 × 30%) + (تقييم المدير / 5 × 100 × 20%) + (100 - عبء العمل × 10%)
```

---

## البنية التقنية (Architecture)

```
MRFQ/
├── public/
│   ├── app.js          # تطبيق SPA كامل (vanilla JS، ~7000 سطر)
│   ├── style.css       # تصميم كامل مع CSS Variables ودعم RTL
│   └── assets/         # خطوط، شعارات، صور القائمة
├── server.js           # Node.js HTTP server، API routes، SQLite
├── db.js               # مخطط قاعدة البيانات والترحيلات (v16)
├── data.db             # قاعدة بيانات SQLite
└── package.json
```

### Stack
- **Frontend:** Vanilla JS (SPA)، CSS Variables، PWA-ready، RTL-first
- **Backend:** Node.js (built-in `http` module، no framework)
- **Database:** SQLite via `better-sqlite3`
- **Auth:** Session-based (JWT in HttpOnly cookie)
- **Realtime:** Server-Sent Events (SSE) للتحديثات الفورية
- **Offline:** Queue محلي للطلبات عند انقطاع الشبكة

---

## التشغيل (Run Locally)

```bash
npm install
node server.js
# → http://localhost:3000
```

---

## ملفات الهوية المطلوبة

ضع الملفات التالية داخل `public/assets/logos/`:

```
mrfq-logo-icon-dark-v4.svg
mrfq-logo-icon-light-v4.svg
```

وداخل `public/assets/fonts/`:

```
IBMPlexSansArabic-Regular.ttf
IBMPlexSansArabic-Medium.ttf
IBMPlexSansArabic-SemiBold.ttf
IBMPlexSansArabic-Bold.ttf
```

---

## نقاط النهاية الرئيسية (Key API Endpoints)

### المصادقة
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `POST` | `/api/auth/login` | تسجيل دخول |
| `POST` | `/api/auth/logout` | تسجيل خروج |
| `GET` | `/api/data` | تحميل بيانات الجلسة (bootstrap) |

### النظافة
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET/POST` | `/api/tickets` | تذاكر النظافة |
| `PUT` | `/api/tickets/:id` | تحديث حالة تذكرة |
| `DELETE` | `/api/tickets/:id` | حذف تذكرة (manager+) |
| `GET/POST` | `/api/reports` | تقارير النظافة |
| `POST` | `/api/reports/review` | اعتماد/رفض تقرير |
| `GET` | `/api/performance` | بيانات أداء عمال النظافة |
| `GET/POST` | `/api/recurring-tasks` | المهام المتكررة |

### الصيانة
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET/POST` | `/api/maintenance-tickets` | أوامر عمل الصيانة |
| `PUT` | `/api/maintenance-tickets/:id` | تحديث حالة أمر عمل |
| `GET/POST` | `/api/maintenance-reports` | تقارير الصيانة |
| `POST` | `/api/maintenance-reports/review` | مراجعة تقرير صيانة |
| `GET/POST` | `/api/maintenance-parts` | قطع الغيار |
| `GET/POST` | `/api/maintenance-assets` | الأصول والمعدات |
| `GET/POST` | `/api/maintenance-schedules` | جداول الصيانة الوقائية |

### الضيافة
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET/POST` | `/api/hospitality/orders` | طلبات الضيافة (مسجّل) |
| `PUT` | `/api/hospitality/orders/:id` | تحديث حالة طلب |
| `GET` | `/api/hospitality/orders/:id/activity` | سجل نشاط طلب |
| `GET/POST` | `/api/hospitality/menu` | إدارة قائمة الأصناف (admin) |
| `GET/POST` | `/api/hospitality/menu-categories` | إدارة التصنيفات (admin) |
| `GET/POST` | `/api/hospitality/kitchens` | إدارة المطابخ (admin) |
| `GET/POST` | `/api/public/hospitality/orders` | طلبات الضيافة (عام، بدون تسجيل) |
| `GET` | `/api/public/hospitality/menu` | قائمة الأصناف (عام) |
| `GET` | `/api/public/hospitality/kitchens` | المطابخ (عام) |
| `GET` | `/api/public/hospitality/menu-categories` | التصنيفات (عام) |

### الإدارة
| الطريقة | المسار | الوصف |
|---------|--------|-------|
| `GET/POST` | `/api/users` | إدارة المستخدمين |
| `PUT` | `/api/users/:id` | تحديث مستخدم (يشمل defaultLocationId) |
| `GET/POST` | `/api/locations` | إدارة المرافق والمواقع |
| `GET/POST` | `/api/settings` | الإعدادات العامة |
| `POST` | `/api/order` | تقديم طلب نظافة أو صيانة (employee) |

---

## تدفق البيانات — موقع المكتب

```
Admin → تعيين defaultLocationId للموظف → users.default_location_id (DB)
  ↓
Login → publicUser() → me.defaultLocationId
  ↓
Employee → فتح قناة الضيافة → empHospLocId = me.defaultLocationId
  ↓
حقل الموقع يملأ تلقائياً → الموظف يعدّله إذا كان خارج مكتبه
  ↓
يُحفظ في localStorage('mrfq_hosp_loc') للزيارات التالية
```

---

## حالات الطلبات (State Machines)

### النظافة والصيانة
```
submitted → assigned → diagnosing → in_progress → waiting_verification → completed
                                                                        → cancelled
```

### الضيافة
```
submitted → accepted → preparing → ready → out_for_delivery → delivered
         → rejected
```

---

## المشكلات المعروفة (Known Issues)

| # | الأولوية | الوصف | الموقع |
|---|----------|-------|--------|
| 1 | 🔴 حرجة | فلتر تصنيفات الضيافة في نموذج الموظف يستخدم `categoryId` بينما الـ API يُرجع `category`، مما يُعطّل الفلترة | `app.js:4664` |
| 2 | 🟡 بسيطة | تبويب "المزيد" في واجهة الموظف فارغ بدون محتوى | `app.js:4548` |

---

## اللغات

النظام يدعم العربية والإنجليزية بالكامل مع تبديل فوري بدون إعادة تحميل الصفحة.
