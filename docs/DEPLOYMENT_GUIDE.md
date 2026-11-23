# 🚀 دليل التشغيل والنشر الشامل | Anwar Al Wahah Platform Deployment Guide

منظومة متجر ولوحة تحكم **مكتبة أنوار الواحة** المتكاملة مبنية بأحدث معايير Enterprise:
- **Backend:** ASP.NET Core 9 Web API (3-Layer Architecture مع PostgreSQL 16 و EF Core).
- **Frontend & Admin:** React 18 + TypeScript + Vite بتصميم عربي كامل RTL (Cairo Font & Tailwind CSS).
- **Payment Gateway:** Moyasar Payment Integration مع Webhook مزدوج التحقق ومحمي من هجمات التوقيت و Replay Attacks.
- **Containerization:** Docker Multi-stage Builds و Docker Compose متكامل.

---

## 📋 الفهرس
1. [المتطلبات الأساسية للنظام](#-المتطلبات-الأساسية-للنظام)
2. [التشغيل المحلي للتطوير (Local Development)](#-التشغيل-المحلي-للتطوير-local-development)
3. [التشغيل والإنتاج عبر Docker Compose](#-التشغيل-والإنتاج-عبر-docker-compose)
4. [قاموس متغيرات البيئة (Environment Variables)](#-قاموس-متغيرات-البيئة-environment-variables)
5. [بوابة الدفع الإلكتروني Moyasar وإعدادات Webhook](#-بوابة-الدفع-الإلكتروني-moyasar-وإعدادات-webhook)
6. [بيانات تسجيل الدخول الافتراضية للوحة التحكم](#-بيانات-تسجيل-الدخول-الافتراضية-للوحة-التحكم)
7. [التحقق واختبار النظام (Verification & Health Checks)](#-التحقق-واختبار-النظام-verification--health-checks)

---

## 🛠 المتطلبات الأساسية للنظام

للتشغيل المباشر على جهاز المطور أو خادم الإنتاج:
- **.NET 9.0 SDK**: [تنزيل .NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 20+ أو 22 LTS**: [تنزيل Node.js](https://nodejs.org)
- **PostgreSQL 16+**: قاعدة بيانات علائقية محلية أو عبر Docker
- **Docker & Docker Compose**: (اختياري للتشغيل بالحاويات بنقرة واحدة)

---

## 💻 التشغيل المحلي للتطوير (Local Development)

### 1. إعداد قاعدة البيانات والباك إند (ASP.NET Core 9 API)

1. انتقل لمجلد الباك إند:
   ```bash
   cd backend/AnwarAlwaha.API
   ```

2. تأكد من إعداد سلسلة الاتصال بـ PostgreSQL في `appsettings.Development.json` أو كمتغير بيئة:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=anwar_alwaha_db;Username=postgres;Password=postgres"
   }
   ```

3. (اختياري) تعيين بيانات حساب المشرف الافتراضي ومفاتيح مويسر عبر المتغيرات:
   ```powershell
   $env:ADMIN_INITIAL_EMAIL = "admin@anwaralwaha.com"
   $env:ADMIN_INITIAL_PASSWORD = "Admin@Password2026!"
   $env:MOYASAR_SECRET_KEY = "sk_test_..."
   $env:MOYASAR_PUBLISHABLE_KEY = "pk_test_..."
   ```

4. تشغيل المشروع (سيقوم النظام تلقائياً ببذر الأقسام الـ 15، الخدمات الـ 6، المنتجات المعتمدة، الباقات، وحساب الأدمن):
   ```bash
   dotnet run
   ```
   *يعمل الـ API على المنفذ:* `http://localhost:5000`  
   *واجهة التوثيق التفاعلية (Swagger):* `http://localhost:5000/swagger`

---

### 2. إعداد الواجهة الأمامية ولوحة التحكم (React + Vite)

1. انتقل لمجلد الواجهة الأمامية:
   ```bash
   cd frontend/anwar-alwaha-web
   ```

2. تثبيت الحزم:
   ```bash
   npm install
   ```

3. إنشاء ملف `.env` (يمكن نسخه من `.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_MOYASAR_PUBLISHABLE_KEY=pk_test_sample_key_for_anwar_alwaha_library
   ```

4. تشغيل خادم التطوير:
   ```bash
   npm run dev
   ```
   *يفتح المتجر على الرابط:* `http://localhost:5173`  
   *لوحة تحكم المشرف:* `http://localhost:5173/admin`

---

## 🐳 التشغيل والإنتاج عبر Docker Compose

لتشغيل المنظومة بالكامل (قاعدة بيانات PostgreSQL 16 + الباك إند API + الواجهة الأمامية Nginx) بضغطة زر واحدة:

1. من المجلد الرئيسي للمشروع:
   ```bash
   docker compose up --build -d
   ```

2. فحص حالة الحاويات العاملة:
   ```bash
   docker compose ps
   ```

3. الروابط المتاحة فور التشغيل:
   - **واجهة المتجر ولوحة التحكم:** [http://localhost](http://localhost) (منفذ 80)
   - **الباك إند API:** [http://localhost:5000/api](http://localhost:5000/api)
   - **قاعدة البيانات PostgreSQL:** `localhost:5432`

4. لإيقاف المنظومة:
   ```bash
   docker compose down
   ```

---

## 🔑 قاموس متغيرات البيئة (Environment Variables)

### متغيرات الباك إند (`backend/AnwarAlwaha.API`)

| المتغير | الوصف | القيمة الافتراضية / المقترحة | نوع الحساسية |
| :--- | :--- | :--- | :--- |
| `ASPNETCORE_ENVIRONMENT` | بيئة تشغيل الدوت نت (`Development` أو `Production`) | `Production` | عادي |
| `ConnectionStrings__DefaultConnection` | سلسلة الاتصال بقاعدة بيانات PostgreSQL | `Host=db;Port=5432;Database=anwar_alwaha_db;Username=postgres;Password=postgres` | **سري** |
| `JwtSettings__Secret` | المفتاح السري لتشفير وتوقيع رموز JWT (يجب أن يكون 64 بايت على الأقل) | *مفتاح عشوائي مشفر* | **سري جداً** |
| `JwtSettings__ExpiryMinutes` | مدة صلاحية رمز الدخول القصير Access Token | `30` دقيقة | عادي |
| `JwtSettings__RefreshTokenExpiryDays` | مدة صلاحية رمز التجديد Refresh Token المخزن بـ Cookie آمنة | `7` أيام | عادي |
| `ADMIN_INITIAL_EMAIL` | البريد الإلكتروني الافتراضي للمشرف عند تهيئة النظام لأول مرة | `admin@anwaralwaha.com` | عادي |
| `ADMIN_INITIAL_PASSWORD` | كلمة مرور المشرف الافتراضية عند أول تشغيل | `Admin@123456!` (يُنصح بتغييرها فوراً) | **سري** |
| `MOYASAR_SECRET_KEY` | المفتاح السري لبوابة Moyasar للتحقق من المدفوعات من الخادم | `sk_test_...` أو `sk_live_...` | **سري جداً** |
| `MOYASAR_PUBLISHABLE_KEY` | المفتاح العام المخصص للواجهة الأمامية لتشغيل نموذج الدفع | `pk_test_...` أو `pk_live_...` | عام |
| `MOYASAR_WEBHOOK_SECRET` | المفتاح السري المخصص للتحقق من توقيع إشعارات الـ Webhook | `whsec_...` | **سري جداً** |
| `MOYASAR_CALLBACK_URL` | رابط إعادة التوجيه بعد إتمام الدفع بنجاح | `http://localhost:5173/payment/callback` | عام |

### متغيرات الواجهة الأمامية (`frontend/anwar-alwaha-web`)

| المتغير | الوصف | القيمة الافتراضية |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | رابط الـ API الأساسي للاتصال بالخادم | `http://localhost:5000/api` (أو `/api` مع Nginx) |
| `VITE_MOYASAR_PUBLISHABLE_KEY` | المفتاح العام لبوابة مويسر لنموذج الدفع المباشر | `pk_test_...` |

---

## 💳 بوابة الدفع الإلكتروني Moyasar وإعدادات Webhook

### آلية الأمان المعتمدة في النظام:
1. **التحقق المشفر من التوقيع (Webhook Secret):**
   - يتم التحقق من هيدر `X-Moyasar-Signature` أو حقل `secret_token` عبر مقارنة ذات زمن ثابت (`CryptographicOperations.FixedTimeEquals`) لمنع هجمات توقيت المعالج (Timing Attacks).
2. **منع التكرار (Idempotency):**
   - يتم فحص `GatewayReferenceId` الفريد للتأكد من عدم معالجة نفس المعاملة مرتين.
3. **التحقق المباشر من خادم مويسر (Double Verification):**
   - يقوم خادم الـ API باستدعاء `GET https://api.moyasar.com/v1/payments/{id}` مباشرة للتأكد من أن المبلغ والعملة (`SAR`) والحالة `paid` أصلية وليست مزورة.
4. **أمان المخزون وحالة الطلب:**
   - تتم العملية داخل معاملة قاعدة بيانات متسلسلة (`IDbContextTransaction`)؛ في حال فشل المعاملة يتم إلغاء حجز المخزون تلقائياً وإعادة الكميات للرفوف.

### خطوات ضبط Webhook على لوحة تحكم Moyasar في بيئة الإنتاج:
1. سجل الدخول إلى [لوحة تحكم مويسر](https://dashboard.moyasar.com).
2. انتقل إلى **Settings (الإعدادات)** -> **Webhooks**.
3. أضف Webhook جديد بالرابط التالي:
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. حدد الأحداث التالية:
   - `payment.paid`
   - `payment.failed`
   - `payment.refunded`
5. انسخ قيمة **Webhook Secret** وضعها في متغير البيئة `MOYASAR_WEBHOOK_SECRET` على خادمك.

---

## 👤 بيانات تسجيل الدخول الافتراضية للوحة التحكم

- **رابط الدخول:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login) (أو `/admin/login` على النطاق الحي).
- **البريد الإلكتروني:** `admin@anwaralwaha.com`
- **كلمة المرور الافتراضية:** `Admin@123456!`  
  *(أو القيمة المعينة في متغير `ADMIN_INITIAL_PASSWORD`)*.

> [!IMPORTANT]
> بعد أول تسجيل دخول ناجح إلى لوحة التحكم، يرجى تغيير كلمة المرور للمشرف أو تحديث المتغير السري في بيئة الإنتاج لضمان الحماية القصوى.

---

## ✅ التحقق واختبار النظام (Verification & Health Checks)

### 1. فحص صحة الـ API:
```bash
curl -I http://localhost:5000/api/categories
```
*يجب أن يُرجع `HTTP/1.1 200 OK` مع قائمة الأقسام الـ 15.*

### 2. فحص توثيق Swagger:
افتح المتصفح على: `http://localhost:5000/swagger` وتأكد من ظهور كافة المسارات والمصادقة بـ Bearer Token.

### 3. فحص الواجهة الأمامية:
افتح المتصفح على: `http://localhost:5173`، تأكد من:
- عرض الأقسام والخدمات والباقات بسلاسة.
- إضافة المنتجات للسلة وإتمام الشراء التجريبي عبر Moyasar.
- متابعة الطلبات برمز التتبع ورقم الجوال.
- الوصول للوحة التحكم عبر الرابط المحمي `/admin`.

---

**مكتبة أنوار الواحة — خميس مشيط، حي الواحة**  
*جاهز للإنتاج بنسبة 100% | 2026 Production Ready*
