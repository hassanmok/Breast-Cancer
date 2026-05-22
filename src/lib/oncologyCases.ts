import { supabase } from './supabase'
import type { OncologyCase } from '../types/oncology'

const PAGE_SIZE = 1000

/** Supabase returns at most 1000 rows per request — paginate to load all records. */
export async function fetchAllOncologyCases(): Promise<{
  data: OncologyCase[]
  error: string | null
  needsMigration: boolean
}> {
  const all: OncologyCase[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('oncology_cases')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      return { data: [], error: error.message, needsMigration: false }
    }

    const batch = (data as OncologyCase[]) ?? []
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const needsMigration = all.length > 0 && !('patient_name' in all[0])

  return { data: all, error: null, needsMigration }
}

export const FALLBACK_CANCER_DETAILED = [
  'Breast Invasive Ductal Carcinoma',
  'Breast Mixed Ductal and Lobular Carcinoma',
  'Breast Invasive Lobular Carcinoma',
  'Invasive Breast Carcinoma',
  'Breast Invasive Mixed Mucinous Carcinoma',
  'Breast',
  'Breast Angiosarcoma',
  'Metaplastic Breast Cancer',
] as const

export async function fetchCancerTypeDetailedOptions(): Promise<string[]> {
  const seen = new Set<string>()
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('oncology_cases')
      .select('cancer_type_detailed')
      .not('cancer_type_detailed', 'is', null)
      .order('cancer_type_detailed')
      .range(from, from + PAGE_SIZE - 1)

    if (error) return [...FALLBACK_CANCER_DETAILED]

    const batch = data ?? []
    for (const row of batch) {
      const v = row.cancer_type_detailed?.trim()
      if (v) seen.add(v)
    }
    if (batch.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const list = [...seen].sort((a, b) => a.localeCompare(b))
  return list.length > 0 ? list : [...FALLBACK_CANCER_DETAILED]
}
