import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { fetchCancerTypeDetailedOptions } from '../lib/oncologyCases'
import { useLanguage } from '../contexts/LanguageContext'
import type { OncologyCaseInsert } from '../types/oncology'

const STATUS_VALUES = ['', 'Positive', 'Negative'] as const
const SAMPLE_VALUES = ['', 'Primary', 'Metastatic', 'Recurrent'] as const
const CANCER_VALUES = ['Breast Cancer', 'Other'] as const
const GENDER_VALUES = ['Female', 'Male'] as const

const emptyForm: OncologyCaseInsert = {
  patient_id: null,
  patient_name: '',
  age: null,
  gender: 'Female',
  sample_id: '',
  cancer_type: 'Breast Cancer',
  cancer_type_detailed: '',
  er_status: '',
  her2_status: '',
  grade: null,
  pr_status: '',
  sample_type: 'Primary',
  tumor_size: null,
  tumor_stage: '',
  source: 'manual',
}

export function DataEntry() {
  const { t } = useLanguage()
  const [form, setForm] = useState<OncologyCaseInsert>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [detailedOptions, setDetailedOptions] = useState<string[]>([])

  useEffect(() => {
    fetchCancerTypeDetailedOptions().then(setDetailedOptions)
  }, [])

  function update<K extends keyof OncologyCaseInsert>(key: K, value: OncologyCaseInsert[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function labelStatus(value: string) {
    if (value === 'Positive') return t('optionPositive')
    if (value === 'Negative') return t('optionNegative')
    return t('optionEmpty')
  }

  function labelSample(value: string) {
    if (value === 'Primary') return t('optionPrimary')
    if (value === 'Metastatic') return t('optionMetastatic')
    if (value === 'Recurrent') return t('optionRecurrent')
    return t('optionEmpty')
  }

  function labelCancer(value: string) {
    if (value === 'Breast Cancer') return t('optionBreastCancer')
    if (value === 'Other') return t('optionOther')
    return value
  }

  function labelGender(value: string) {
    if (value === 'Female') return t('optionFemale')
    if (value === 'Male') return t('optionMale')
    return value
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)

    if (!form.patient_name?.trim()) {
      setMessage({ type: 'err', text: t('patientNameRequired') })
      setSubmitting(false)
      return
    }
    if (form.age == null || form.age < 18 || form.age > 100) {
      setMessage({ type: 'err', text: t('ageRequired') })
      setSubmitting(false)
      return
    }
    if (!form.gender?.trim()) {
      setMessage({ type: 'err', text: t('genderRequired') })
      setSubmitting(false)
      return
    }
    if (!form.sample_id?.trim()) {
      setMessage({ type: 'err', text: t('sampleIdRequired') })
      setSubmitting(false)
      return
    }

    const payload = {
      patient_id: form.sample_id.trim(),
      patient_name: form.patient_name.trim(),
      age: Number(form.age),
      gender: form.gender.trim(),
      sample_id: form.sample_id.trim(),
      cancer_type: form.cancer_type?.trim() || null,
      cancer_type_detailed: form.cancer_type_detailed?.trim() || null,
      er_status: form.er_status?.trim() || null,
      her2_status: form.her2_status?.trim() || null,
      grade: form.grade != null ? Number(form.grade) : null,
      pr_status: form.pr_status?.trim() || null,
      sample_type: form.sample_type?.trim() || null,
      tumor_size: form.tumor_size != null ? Number(form.tumor_size) : null,
      tumor_stage: form.tumor_stage?.trim() || null,
      source: 'manual',
    }

    const { error } = await supabase.from('oncology_cases').insert(payload)

    setSubmitting(false)

    if (error) {
      setMessage({
        type: 'err',
        text: error.message.includes('unique')
          ? t('sampleIdDuplicate')
          : error.message.includes('patient_name')
            ? t('migrationBannerBody')
            : error.message,
      })
      return
    }

    setMessage({ type: 'ok', text: t('saveSuccess') })
    setForm(emptyForm)
  }

  return (
    <div className="mx-auto max-w-3xl pb-2">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-xl font-bold text-white sm:text-3xl">{t('dataEntryTitle')}</h1>
        <p className="mt-1 text-xs text-pink-300/70 sm:text-sm">{t('dataEntrySubtitle')}</p>
      </motion.header>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass space-y-5 rounded-2xl p-4 sm:space-y-6 sm:p-8"
      >
        <section>
          <h2 className="mb-4 text-sm font-semibold text-pink-300">{t('sectionPatient')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fieldPatientName')} required className="sm:col-span-2">
              <input
                required
                value={form.patient_name ?? ''}
                onChange={(e) => update('patient_name', e.target.value)}
                className={inputClass}
                placeholder={t('fieldPatientName')}
              />
            </Field>
            <Field label={t('fieldAge')} required>
              <input
                type="number"
                required
                min={18}
                max={100}
                value={form.age ?? ''}
                onChange={(e) =>
                  update('age', e.target.value === '' ? null : Number(e.target.value))
                }
                className={inputClass}
                placeholder="52"
              />
            </Field>
            <Field label={t('fieldGender')} required>
              <select
                required
                value={form.gender ?? 'Female'}
                onChange={(e) => update('gender', e.target.value)}
                className={inputClass}
              >
                {GENDER_VALUES.map((g) => (
                  <option key={g} value={g}>
                    {labelGender(g)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-pink-300">{t('sectionIds')}</h2>
          <Field label={t('fieldSampleId')} required>
            <input
              required
              value={form.sample_id ?? ''}
              onChange={(e) => update('sample_id', e.target.value)}
              className={inputClass}
              placeholder="MB-5000"
            />
          </Field>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-pink-300">{t('sectionDiagnosis')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fieldCancerType')}>
              <select
                value={form.cancer_type ?? ''}
                onChange={(e) => update('cancer_type', e.target.value)}
                className={inputClass}
              >
                {CANCER_VALUES.map((o) => (
                  <option key={o} value={o}>
                    {labelCancer(o)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('fieldCancerDetailed')}>
              <select
                value={form.cancer_type_detailed ?? ''}
                onChange={(e) => update('cancer_type_detailed', e.target.value)}
                className={inputClass}
              >
                <option value="">{t('optionEmpty')}</option>
                {detailedOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-pink-300">{t('sectionBiomarkers')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fieldEr')}>
              <select
                value={form.er_status ?? ''}
                onChange={(e) => update('er_status', e.target.value)}
                className={inputClass}
              >
                {STATUS_VALUES.map((o) => (
                  <option key={o || 'empty'} value={o}>
                    {labelStatus(o)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('fieldHer2')}>
              <select
                value={form.her2_status ?? ''}
                onChange={(e) => update('her2_status', e.target.value)}
                className={inputClass}
              >
                {STATUS_VALUES.map((o) => (
                  <option key={o || 'empty'} value={o}>
                    {labelStatus(o)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('fieldPr')}>
              <select
                value={form.pr_status ?? ''}
                onChange={(e) => update('pr_status', e.target.value)}
                className={inputClass}
              >
                {STATUS_VALUES.map((o) => (
                  <option key={o || 'empty'} value={o}>
                    {labelStatus(o)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('fieldGrade')}>
              <select
                value={form.grade ?? ''}
                onChange={(e) =>
                  update('grade', e.target.value === '' ? null : Number(e.target.value))
                }
                className={inputClass}
              >
                <option value="">{t('optionEmpty')}</option>
                {[1, 2, 3].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-pink-300">{t('sectionTumor')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('fieldSampleType')}>
              <select
                value={form.sample_type ?? ''}
                onChange={(e) => update('sample_type', e.target.value)}
                className={inputClass}
              >
                {SAMPLE_VALUES.map((o) => (
                  <option key={o || 'empty'} value={o}>
                    {labelSample(o)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('fieldTumorSize')}>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.tumor_size ?? ''}
                onChange={(e) =>
                  update('tumor_size', e.target.value === '' ? null : Number(e.target.value))
                }
                className={inputClass}
                placeholder="49"
              />
            </Field>
            <Field label={t('fieldTumorStage')} className="sm:col-span-2">
              <input
                value={form.tumor_stage ?? ''}
                onChange={(e) => update('tumor_stage', e.target.value)}
                className={inputClass}
                placeholder="1, 2, 3"
              />
            </Field>
          </div>
        </section>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'ok'
                ? 'bg-emerald-950/50 text-emerald-300'
                : 'bg-red-950/50 text-red-300'
            }`}
          >
            {message.text}
          </motion.p>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[48px] rounded-xl bg-gradient-to-l from-pink-600 to-rose-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? t('saving') : t('saveRecord')}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm)
              setMessage(null)
            }}
            className="min-h-[48px] rounded-xl border border-[#3d2430] px-6 py-3 text-sm text-pink-200 transition hover:bg-pink-950/30"
          >
            {t('clearForm')}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-[#3d2430] bg-black/40 px-4 py-2.5 text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500'

function Field({
  label,
  children,
  required,
  className = '',
}: {
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs text-pink-300/80">
        {label}
        {required && <span className="text-pink-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
