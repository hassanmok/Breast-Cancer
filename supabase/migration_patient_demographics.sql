-- Run this entire file in Supabase → SQL Editor

-- 1) New columns
alter table oncology_cases
  add column if not exists patient_name text,
  add column if not exists age int,
  add column if not exists gender text;

-- 2) Allow authenticated users to update (for edits / re-seed)
drop policy if exists "Authenticated users can update oncology_cases" on oncology_cases;

create policy "Authenticated users can update oncology_cases"
  on oncology_cases for update
  to authenticated
  using (true)
  with check (true);

-- 3) Fill all existing rows with name, age, gender (deterministic per id)
update oncology_cases
set
  patient_name = (
    array[
      'فاطمة العلي','مريم حسن','سارة إبراهيم','عائشة محمود','نور الدين',
      'هدى الشمري','ريم العتيبي','لمى السعيد','أمل الخالد','زينب القحطاني',
      'منى الحربي','سلمى الغامدي','دانية المطيري','ياسمين الزهراني','إيناس العنزي',
      'نادية الراشد','سعاد الفهد','كريمة الدوسري','حنان السبيعي','ليلى المالكي',
      'رنا الشهري','غادة العمري','هيفاء البلوي','سمر الجهني','جواهر الثبيتي',
      'بشرى الحازمي','وفاء العسيري','مها القرشي','نهى السديري','دلال الماجد',
      'ابتسام الحكيم','سناء الراجحي','إيمان الفيصل','خلود النجار','رغد السهلي',
      'تغريد العبدالله','ميسون الشريف','شيماء الحسين','نهلة العلي','سجى المبارك',
      'رحمة السالم','بسمة الخير','عزة النور','وفاء الأحمد','سهام العلي',
      'نجلاء الحسن','سعاد المرزوق','هالة السويلم','لمياء العتيبي','أروى الشمري',
      'فريدة القحطاني','ماجدة الحربي','نجوى الغامدي','سناء المطيري','هند الزهراني',
      'لطيفة العنزي','صفية الراشد','جميلة الفهد','كوثر الدوسري','بثينة السبيعي',
      'عالية المالكي','شادية الشهري','وئام العمري','إخلاص البلوي','فدوى الجهني',
      'حياة الثبيتي','سعاد الحازمي','منال العسيري','سهير القرشي','نعمة السديري',
      'أمينة الماجد','زكية الحكيم','راضية الراجحي','فاطمة الزهراء','مريم العلي',
      'خديجة السعد','عائشة النور','حليمة الأحمد','زينب الحسين','سكينة العلي',
      'محمد العلي','أحمد الحسن','علي محمود','خالد السعيد','يوسف إبراهيم'
    ]
  )[1 + (abs(hashtext(id::text)) % 75) + 1],
  age = 28 + (abs(hashtext(id::text || 'age')) % 53),
  gender = case
    when abs(hashtext(id::text || 'gender')) % 100 < 97 then 'Female'
    else 'Male'
  end
where patient_name is null or age is null or gender is null;

-- 4) Optional: index for filtering
create index if not exists idx_oncology_cases_gender on oncology_cases (gender);
create index if not exists idx_oncology_cases_age on oncology_cases (age);
