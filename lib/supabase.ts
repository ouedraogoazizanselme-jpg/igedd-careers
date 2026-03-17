import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Role = 'etudiant' | 'recruteur' | 'admin'

export interface Profile {
  id: string
  nom: string
  prenom: string
  email: string
  universite?: string
  filiere?: string
  annee?: string
  competences?: string
  bio?: string
  photo_url?: string
  cv_url?: string
  role: Role
  created_at: string
}

export interface Offre {
  id: number
  title: string
  co: string
  city: string
  filiere: 'mqse' | 'eer' | 'tea' | 'tes'
  type: 'Stage' | 'Emploi' | 'Alternance'
  dur: string
  remun?: string
  mail?: string
  description?: string
  missions?: string
  profil?: string
  is_new: boolean
  candidatures: number
  created_at: string
}

export interface Candidature {
  id: number
  offre_id: number
  user_id?: string
  nom: string
  prenom: string
  email: string
  tel?: string
  filiere?: string
  motivation?: string
  cv_url?: string
  statut: 'en_attente' | 'accepte' | 'refuse'
  created_at: string
}

export interface Alerte {
  id: number
  user_id: string
  email: string
  filiere?: string
  type_offre?: string
  created_at: string
}

export const FILIERES = {
  mqse: {
    label: 'MQSE',
    full: "Management Qualité et Sécurité de l'Environnement",
    color: '#c47c1a'
  },
  eer: {
    label: 'EER',
    full: 'Énergie et Énergies Renouvelables',
    color: '#b83232'
  },
  tea: {
    label: 'TEA',
    full: "Technologie de l'Eau et de l'Assainissement",
    color: '#1a5276'
  },
  tes: {
    label: 'TES',
    full: 'Territoire Environnement Santé',
    color: '#2d6a4f'
  }
}

export const MAX_CANDIDATURES = 10