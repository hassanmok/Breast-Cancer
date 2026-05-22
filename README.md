# سجل سرطان الثدي — Oncology Data Registry

موقع React لعرض وتحليل بيانات `oncology_cases` وإدخال حالات جديدة، مع تسجيل دخول عبر Supabase.

## الصفحات

| المسار | الوصف |
|--------|--------|
| `/login` | تسجيل الدخول (Email + Password) |
| `/dashboard` | لوحة تحليل مع رسوم بيانية وحركات |
| `/data-entry` | نموذج إدخال حالة جديدة |

## الإعداد

### 1. Supabase

- أنشئ مشروعاً وأضف جدول `oncology_cases` (الـ schema الذي أرسلته).
- من **Authentication → Users** أضف مستخدماً (Email + Password).
- من **Project Settings → API Keys** انسخ:
  - Project URL → `VITE_SUPABASE_URL`
  - Publishable key (`sb_publishable_...`) → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 2. Row Level Security

نفّذ الملف `supabase/policies.sql` في SQL Editor حتى يتمكن المستخدمون المسجّلون من القراءة والإدراج.

### 3. المشروع المحلي

```bash
cp .env.example .env
# عدّل .env بقيم Supabase

npm install
npm run dev
```

افتح `http://localhost:5173` وسجّل الدخول بالمستخدم الذي أنشأته في Supabase.

## البناء للإنتاج

```bash
npm run build
npm run preview
```

## الحقول في إدخال البيانات

| العمود | النوع في النموذج |
|--------|------------------|
| patient_id | نص |
| sample_id | نص (مطلوب، فريد) |
| cancer_type | قائمة |
| cancer_type_detailed | نص |
| er_status / her2_status / pr_status | Positive / Negative / فارغ |
| grade | 1–3 أو فارغ |
| sample_type | Primary / Metastatic / Recurrent |
| tumor_size | رقم (mm) |
| tumor_stage | نص |
| source | يُحفظ تلقائياً كـ `manual` |
