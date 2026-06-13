# تقرير إغلاق وحدة النظافة (Cleaning Module) — نسخة مرجعية 100%
**التاريخ:** 2026-06-13
**النسخة الاحتياطية:** فرع `backup/2026-06-13_17-34` على GitHub (تم رفعه قبل بدء أي تعديل)
**Commit الأساسي قبل التعديل:** `d2013f7` ("fix: unify performance table and report ratings")

---

## 1. ملخص الحالة عند البدء

تم العثور على أن التطوير توقف عند **الخطوة 3** من خطة الإغلاق: مصفوفة حالات البلاغات
(`PUT /api/tickets/:id`) كانت تقبل أي قيمة `status` بدون أي تحقق من صلاحيتها أو من
مسار الانتقال المسموح. الخطوات 1-2 (تجميد النطاق، تنظيف المستودع) كانت مكتملة عمليًا.
الخطوات 4-8 لم تبدأ.

---

## 2. مصفوفة حالات البلاغ (Ticket Status State Machine)

تمت إضافتها في `server.js` كثوابت `TICKET_STATUSES`, `TICKET_TERMINAL`, `TICKET_TRANSITIONS`.

### الحالات الرسمية (9)

| القيمة (DB) | التسمية (AR) |
|---|---|
| `submitted` | تم الإرسال |
| `assigned` | تم التعيين |
| `accepted` | مقبول |
| `in_progress` | قيد التنفيذ |
| `waiting_verification` | بانتظار التحقق |
| `completed` | تم التنظيف (نهائية) |
| `reclean_required` | إعادة التنظيف مطلوبة |
| `rejected` | مرفوض (نهائية) |
| `cancelled` | ملغي (نهائية) |

### مصفوفة الانتقالات المسموحة

| من → إلى | الانتقالات المسموحة |
|---|---|
| `submitted` | `assigned`, `cancelled`, `rejected` |
| `assigned` | `accepted`, `in_progress`, `waiting_verification`, `reclean_required`, `submitted`, `cancelled`, `rejected` |
| `accepted` | `in_progress`, `waiting_verification`, `cancelled`, `rejected` |
| `in_progress` | `waiting_verification`, `cancelled`, `rejected` |
| `waiting_verification` | `completed`, `reclean_required`, `rejected` |
| `reclean_required` | `assigned`, `accepted`, `in_progress`, `waiting_verification`, `cancelled` |
| `completed` | — (نهائية) |
| `rejected` | — (نهائية) |
| `cancelled` | — (نهائية) |

### التحقق من الصلاحيات (Enforcement)

- `PUT /api/tickets/:id`:
  - قيمة `status` غير موجودة في `TICKET_STATUSES` → `400 { error: 'INVALID_STATUS' }`
  - انتقال غير موجود في `TICKET_TRANSITIONS[currentStatus]` → `400 { error: 'INVALID_TRANSITION' }`
  - أي محاولة تعديل حالة `completed` / `rejected` / `cancelled` (نهائية) → `400 INVALID_TRANSITION`
  - عند الانتقال إلى `accepted`/`in_progress`/`cancelled` يتم تعبئة الأعمدة
    `accepted_at` / `started_at` / `cancelled_at` المهجورة سابقًا.

- `POST /api/tickets/complete` (العامل):
  - يتطلب أن يكون الانتقال الحالي → `waiting_verification` مسموحًا، وإلا `400 INVALID_TRANSITION`.
  - عند الإكمال: الحالة تصبح `waiting_verification` (لا `completed` مباشرة) — هذا يفتح
    قائمة "بانتظار التحقق" للمشرف لأول مرة (كانت معطّلة سابقًا لأن العامل كان يضع
    الحالة `completed` مباشرة، فتتجاوز قائمة التحقق).

### مراجعة التقارير (`POST /api/reports/review`)

| الحالة المطلوبة | السلوك |
|---|---|
| ليست من `approved` / `rejected` / `needs_recleaning` | `400 INVALID_STATUS` |
| التقرير غير موجود | `404 NOT_FOUND` |
| التقرير تمت مراجعته مسبقًا (`approval_status != 'pending'`) | `400 ALREADY_REVIEWED` |
| صحيح | `200` + تحديث `approval_status` و `reviewed_by` و `reviewed_at` |

---

## 3. الاختبارات الآلية (Smoke Tests) — الخطوة 4

ملف جديد: `test/smoke.test.js` — يشغّل خادمًا منعزلًا (DB/uploads في مجلد مؤقت)
على المنفذ 3999، يُغلق ويُحذف تلقائيًا بعد الاختبارات.

تشغيل: `npm test` (= `node --test`)

**النتيجة: 25/25 اختبار ناجح ✓**

التغطية:
1. تسجيل الدخول (نجاح/فشل + كوكي)
2. `/api/bootstrap` (مُخوّل/غير مُخوّل)
3. صلاحيات الأدوار (عامل لا يُنشئ بلاغات، عامل يرى بياناته فقط، مدير يدير المستخدمين وليس المشرف)
4. دورة حياة بلاغ كاملة:
   - إنشاء بلاغ من المدير → تعيين تلقائي للعامل (`assigned`)
   - إعادة تعيين من المشرف (`assigned → assigned`)
   - رفض قيمة `status` غير معروفة (`400 INVALID_STATUS`)
   - رفض انتقال غير مسموح (`assigned → completed` مباشرة) (`400 INVALID_TRANSITION`)
   - عامل آخر غير المعيّن لا يمكنه الإكمال (`403 FORBIDDEN`)
   - العامل المعيّن يُكمل → `waiting_verification` + صور
   - محاولة إكمال ثانية على بلاغ `waiting_verification` → `400 INVALID_TRANSITION`
   - العامل يرفع تقرير تنظيف (قبل/بعد) → `pending`
   - المشرف يوثّق `waiting_verification → completed` (+ `completedAt`)
   - محاولة الخروج من حالة نهائية → `400 INVALID_TRANSITION`
5. مراجعة التقارير: قيمة غير صحيحة (`400 INVALID_STATUS`)، اعتماد (`approved`)،
   إعادة مراجعة تقرير مُراجَع مسبقًا (`400 ALREADY_REVIEWED`)
6. `/api/sla-report` (متاح للمدير، ممنوع على العامل `403`)
7. `/api/performance` (متاح للمشرف، ممنوع على العامل `403`)
8. وصول غير مُخوّل → `401 UNAUTHORIZED`

---

## 4. الفحص البصري على المتصفح (Production-like Testing) — الخطوة 6

تم التشغيل عبر بيئة معاينة منعزلة (`autoSeedIfEmpty`، قاعدة بيانات/رفع ملفات مؤقتة،
تم حذفها بالكامل بعد الانتهاء). تم التحقق من:

| الدور | تسجيل دخول + تغيير كلمة مرور إجباري | لوحة التحكم | mobile (390px) | tablet (768px) | أخطاء Console |
|---|---|---|---|---|---|
| `manager` (مدير النظافة) | ✓ | ✓ | ✓ | — | لا توجد |
| `worker6` / `worker3` (عامل) | ✓ | ✓ (بلاغاتي/المسندة) | ✓ | — | لا توجد |
| `supervisor1` (مشرف) | ✓ | ✓ (الطلبات/بانتظار التحقق) | ✓ | — | لا توجد |
| `fm` (مدير المرافق) | ✓ | ✓ (البلاغات + تعديل) | ✓ | — | لا توجد |
| `admin` (مدير النظام) | ✓ | ✓ (حذف/تعديل + لوحة شاملة) | — | ✓ | لا توجد |

### دورة حياة كاملة تم اختبارها فعليًا عبر الواجهة:

1. تسجيل دخول `worker6` → إكمال بلاغ `t-demo-1` (مع صور قبل/بعد) →
   `POST /api/tickets/complete` (200) → الحالة `waiting_verification` ✓
2. `POST /api/reports` (200) → تقرير تنظيف بحالة `pending` ✓
3. تسجيل دخول `supervisor1` → ظهور البلاغ في "بانتظار التحقق" (1) →
   الضغط على "تحقق" → `supVerify('t-demo-1','completed')` → الحالة `completed` ✓
   (القائمة عادت إلى 0 — تؤكد أن قائمة التحقق التي كانت معطّلة أصبحت تعمل)
4. اعتماد التقرير المعلّق من "التقارير للمراجعة" → `POST /api/reports/review` (200) →
   `approval_status = approved`، القائمة عادت إلى 0 ✓
5. اختبار سلبي: من حساب `admin`، تعديل بلاغ `completed` (نهائية) إلى `in_progress`
   عبر نافذة "تعديل البلاغ" → `PUT /api/tickets/t-demo-1` → **`400 INVALID_TRANSITION`**
   — الواجهة تعاملت مع الخطأ دون أي تعطل أو خطأ Console ✓

### ملاحظات حول الشبكة

- طلبات `GET /api/events` (SSE) تظهر بحالة `[FAILED: net::ERR_ABORTED]` عند كل
  تسجيل خروج/دخول — هذا سلوك طبيعي لـ `EventSource` عند تحديث الصفحة وليس خللًا.
- طلبات `GET /api/bootstrap → 401` قبل تسجيل الدخول متوقعة (الجلسة غير موجودة بعد).

---

## 5. القيود المعروفة (Known Limitations)

- اختبارات الواجهة (Step 6) أُجريت يدويًا على عدد من الأدوار وليس جميعها
  (الموظف "Employee" العام لم يُختبر بشكل مستقل — لا يوجد له حساب تجريبي مخصص في seed).
- لم يتم اختبار حالة `iPad` بدقة 1024×768 (الأفقي)، فقط 768×1024 (الرأسي).
- اختبار رفع الصور عبر الواجهة تم تنفيذه بحقن صورة PNG تجريبية في الذاكرة
  (`currentBeforePhotos`/`currentAfterPhotos`) بدل محاكاة `<input type=file>` الفعلي،
  لأن أدوات المعاينة لا تدعم رفع ملفات حقيقية. منطق التحقق من الصور (magic bytes,
  الحجم، الصيغة) مُغطّى بالكامل عبر `test/smoke.test.js`.

---

## 6. عوائق الإنتاج (Production Blockers)

لا توجد عوائق جديدة نتيجة هذا العمل. التعديلات:
- إضافة منطق تحقق فقط (لا تغييرات في المخطط `db.js`، لا أعمدة جديدة).
- إصلاح بيانات seed (`status='open'` → `'assigned'`) لتطابق الحالات الرسمية.
- إعادة تسمية حدث SSE من `ticket_completed` إلى `ticket_waiting_verification`
  (تغيير غير كاسر — اسم حدث داخلي فقط).

---

## 7. معيار القبول (الخطوة 8) — Acceptance Criteria

| المعيار | الحالة |
|---|---|
| لا أخطاء Console حرجة في أي دور تم اختباره | ✓ |
| `PUT /api/tickets/:id` لا يقبل قيم status عشوائية (يرجع 400) | ✓ |
| جميع الاختبارات الآلية تعمل (`npm test`) | ✓ 25/25 |
| جميع الأدوار المختبرة تعمل بدون أعطال | ✓ |
| لا تعديلات UI خارج النطاق (إصلاحات وظيفية فقط) | ✓ |
| التقرير النهائي مكتمل | ✓ (هذا الملف) |

---

## 8. الملفات المعدّلة في هذا الإغلاق

| الملف | التغيير |
|---|---|
| `server.js` | مصفوفة حالات البلاغات + التحقق في `PUT /api/tickets/:id`، `/api/tickets/complete`، `/api/reports/review` |
| `public/app.js` | إعادة تسمية حدث SSE `ticket_completed` → `ticket_waiting_verification` |
| `scripts/seed-demo.js` | تصحيح حالة البلاغ التجريبي من `open` إلى `assigned` |
| `test/smoke.test.js` | جديد — 25 اختبار آلي |
| `package.json` | إضافة `"test": "node --test"` |
| `.gitignore` | إضافة `.tmp-preview/` |

---

## 9. Final Commit Hash

`b95f6f0` — "feat: enforce ticket status state machine and add smoke tests"
(الأساس قبل التعديل: `d2013f7`)
