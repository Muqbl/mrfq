# برومبت جاهز للمطوّر / مساعد برمجي
# Copy-paste prompt for an AI coding assistant (Claude Code / Cursor)

> الصق ما تحت الخط في مساعدك البرمجي، مع إرفاق مجلد `delivery/` ومستودع نظام مِرفق.

---

أنت تعمل على نظام «مِرفق» لإدارة المرافق (Vanilla JS أمامي + SQLite خلفي، عربي RTL، خط IBM Plex Arabic، لون أساسي teal `#00848D`). مرفق مجلد `delivery/` فيه نماذج تصميم HTML ومخططات SVG وبيانات. مهمتك تنفيذ «الخرائط التفاعلية» فوق الباك-إند الحالي دون كسر ما هو موجود.

## السياق الموجود مسبقاً (لا تُعِد بناءه)
- `locationOperationalStatus(locationId)` يجمّع لكل موقع: آخر تنظيف، استحقاق، بلاغات مفتوحة، طلبات ضيافة، تجاوزات SLA.
- `/api/facilities/heatmap` يُرجع `heat_score`/`level`/`reasons` لكل مساحة.
- الهيكل: مرفق←مبنى←طابق←منطقة←مساحة عبر `/api/facilities/*`؛ و`space.legacy_location_id` يربط بالكود القديم.
- `tickets`/`reports`/`hospitalityOrders` كلها تحمل `locationId`؛ التذاكر تحمل `module` ∈ {cleaning, maintenance, hospitality}.
- `adminMaps()` شاشة فارغة («قريباً») — ازرع الخريطة فيها.

## المطلوب تنفيذه
1. **جدول `map_points`**: `(id, floor, code, x REAL, y REAL, layer, type, UNIQUE(floor,code,layer))`. الإحداثي نسبة ٪ (0..100) من أعلى-يسار المخطط.
2. **نقاط نهاية**:
   - `GET /api/maps/floors` — الطوابق + رابط SVG.
   - `GET /api/maps/:floor/points` و `PUT /api/maps/:floor/points` — قراءة/حفظ النقاط.
   - `GET /api/maps/:floor/status?layers=...` — يدمج كل نقطة مع `locationOperationalStatus(code→locationId)` ويُرجع لون/حالة كل قسم مُفعّل.
3. **استضافة** ملفات `floors/*.svg` كأصول ثابتة (كلها viewBox `0 0 1191 842`).
4. **شاشة محرّر الإحداثيات** (راجع `designs/MRFQ Coordinate Editor.dc.html`): اختر طابق→كود→انقر المخطط فيُحفظ (x,y)؛ زر تصدير يستدعي `PUT points`. القوائم من `data/floor_codes.json`.
5. **شاشة العرض الإداري** (راجع `designs/MRFQ Admin Map.dc.html`): SVG + نقاط ملوّنة + مفاتيح طبقات (نظافة/صيانة/ضيافة/سلامة/كاميرات) + بطاقة موقع عند النقر تعرض كل الأقسام المرتبطة بنفس `locationId` (راجع `designs/MRFQ Location Detail.dc.html`).
6. **التحديث الحيّ**: استخدم بثّ SSE الموجود لتحديث لون النقطة عند أي تقرير/بلاغ/طلب.

## قواعد إلزامية
- التزم بهوية النظام: نفس الـ CSS tokens، RTL، IBM Plex Arabic، لا ألوان جديدة خارج اللوحة.
- لون النقطة = أعلى خطورة بين طبقاتها المُفعّلة. الطبقة = ترشيح حسب `module`/`layer`.
- لا تكرّر منطق الحالة — استدعِ `locationOperationalStatus` / `/facilities/heatmap`.
- نماذج `.dc.html` **مرجعية للسلوك والشكل فقط** — أعد كتابتها بنمط كود النظام (Vanilla JS)، لا تستوردها.
- قبل استيراد الأكواد طبّق `data/duplicates_report.md`: اجعل `code` فريداً، وأصلح ترقيم الطابق الخامس (`6F`→`5F`)، وارفض الأكواد الفارغة.

## مخرجات متوقعة
- هجرة قاعدة بيانات للجدول الجديد.
- راوترات الـ API الأربعة.
- وحدتا واجهة (محرّر + عرض) داخل بنية الشاشات الحالية.
- ربط `adminMaps()` بشاشة العرض.
- اختبار يدوي: ضع نقاط MF، فعّل/أوقف طبقات، انقر MF-WS-03 وتأكّد ظهور الأقسام الثلاثة.

ابدأ باقتراح خطة ملفات وهجرة القاعدة، ثم نفّذ نقطة نقطة.
