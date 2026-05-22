export interface OncologyCase {
  id: string
  patient_id: string | null
  patient_name: string | null
  age: number | null
  gender: string | null
  sample_id: string | null
  cancer_type: string | null
  cancer_type_detailed: string | null
  er_status: string | null
  her2_status: string | null
  grade: number | null
  pr_status: string | null
  sample_type: string | null
  tumor_size: number | null
  tumor_stage: string | null
  source: string | null
  created_at: string | null
}

export type OncologyCaseInsert = Omit<OncologyCase, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export interface ChartDatum {
  name: string
  value: number
  percent?: number
  fill?: string
}
