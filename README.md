# مِرفق — MRFQ
## Facilities Management & Operations Platform

نسخة تشغيلية كاملة لمنصة العناية بالمرافق والنظافة والبلاغات.

## الدخول
يتم تسجيل الدخول باستخدام بيانات الحسابات المُعدَّة مسبقًا في النظام.
لا تُحفظ بيانات الدخول في الكود المصدري.

## المميزات
- لوحة تحكم كاملة العرض Full Width
- إدارة المستخدمين والصلاحيات من داخل النظام (دعم أكثر من دور لكل مستخدم)
- إدارة مرافق متعددة وليس دورات مياه فقط
- بلاغات نظافة وتوجيهها لعامل ومرفق
- واجهة عامل مستقلة
- كاميرا Fullscreen
- تصوير متعدد ومعاينة الصور
- QR لكل مرفق
- تقارير واعتماد / رفض / إعادة تنظيف
- وحدة الضيافة: طلبات (Hospitality Orders)، مطابخ، وقائمة أصناف، مع صفحة طلب عامة لغير المسجلين
- عربي وإنجليزي
- PWA Ready

## ملفات الهوية
ضع الملفات داخل public/assets:
- mrfq-logo-icon-dark-v4.svg / mrfq-logo-icon-light-v4.svg
- IBMPlexSansArabic-Regular.ttf
- IBMPlexSansArabic-Medium.ttf
- IBMPlexSansArabic-SemiBold.ttf
- IBMPlexSansArabic-Bold.ttf

## Architecture

MRFQ follows a 3-layer architecture:

1. **Presentation Layer**
   HTML/CSS/JavaScript UI for desktop, tablet, and mobile.

2. **Application/API Layer**
   Node.js backend, API routes, permissions, workflow, and validation.

3. **Data Layer**
   SQLite demo database for prototype use.
   The production database can be replaced later after approval.
