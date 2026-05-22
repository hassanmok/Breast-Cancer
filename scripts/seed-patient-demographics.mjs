/**
 * Run AFTER migration_patient_demographics.sql (or if columns already exist).
 * Usage: node scripts/seed-patient-demographics.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const lines = readFileSync(join(root, '.env'), 'utf8').trim().split('\n')
  const url = lines.find((l) => l.startsWith('VITE_SUPABASE_URL='))?.split('=').slice(1).join('=')
  const key =
    lines.find((l) => l.includes('PUBLISHABLE'))?.split('=').slice(1).join('=') ||
    lines.find((l) => l.includes('ANON'))?.split('=').slice(1).join('=')
  return { url, key }
}

const FEMALE_NAMES = [
  'فاطمة العلي', 'مريم حسن', 'سارة إبراهيم', 'عائشة محمود', 'نور الدين',
  'هدى الشمري', 'ريم العتيبي', 'لمى السعيد', 'أمل الخالد', 'زينب القحطاني',
  'منى الحربي', 'سلمى الغامدي', 'دانية المطيري', 'ياسمين الزهراني', 'إيناس العنزي',
  'نادية الراشد', 'سعاد الفهد', 'كريمة الدوسري', 'حنان السبيعي', 'ليلى المالكي',
  'رنا الشهري', 'غادة العمري', 'هيفاء البلوي', 'سمر الجهني', 'جواهر الثبيتي',
  'بشرى الحازمي', 'وفاء العسيري', 'مها القرشي', 'نهى السديري', 'دلال الماجد',
]
const MALE_NAMES = ['محمد العلي', 'أحمد الحسن', 'علي محمود', 'خالد السعيد', 'يوسف إبراهيم']

function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function demographicsForId(id) {
  const h = hash(id)
  const female = h % 100 < 97
  const names = female ? FEMALE_NAMES : MALE_NAMES
  return {
    patient_name: names[h % names.length],
    age: 28 + (hash(id + 'age') % 53),
    gender: female ? 'Female' : 'Male',
  }
}

const { url, key } = loadEnv()
const supabase = createClient(url, key)

const email = process.env.SEED_EMAIL
const password = process.env.SEED_PASSWORD
if (!email || !password) {
  console.error('Set SEED_EMAIL and SEED_PASSWORD env vars (your Supabase login).')
  process.exit(1)
}

const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
if (authErr) {
  console.error('Auth failed:', authErr.message)
  process.exit(1)
}

const { error: probeErr } = await supabase.from('oncology_cases').select('patient_name').limit(1)
if (probeErr?.message?.includes('does not exist')) {
  console.error('\nRun supabase/migration_patient_demographics.sql in Supabase SQL Editor first.\n')
  process.exit(1)
}

let from = 0
const pageSize = 500
let updated = 0

while (true) {
  const { data, error } = await supabase
    .from('oncology_cases')
    .select('id')
    .range(from, from + pageSize - 1)

  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  if (!data?.length) break

  for (const row of data) {
    const demo = demographicsForId(row.id)
    const { error: upErr } = await supabase
      .from('oncology_cases')
      .update(demo)
      .eq('id', row.id)
    if (upErr) {
      console.error('Update failed:', upErr.message)
      process.exit(1)
    }
    updated++
  }

  console.log(`Updated ${updated}...`)
  if (data.length < pageSize) break
  from += pageSize
}

console.log(`Done. Updated ${updated} records.`)
