'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, FILIERES, type Profile } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('etudiant')
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const u = data.session.user
      setUser(u)
      setRole(u.user_metadata?.role || 'etudiant')
      loadProfile(u)
    })
  }, [])

  async function loadProfile(u: User) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single()

    if (data) {
      setProfile(data)
      if (data.photo_url) setPhotoPreview(data.photo_url)
    } else {
      setProfile({
        prenom: u.user_metadata?.prenom || '',
        nom: u.user_metadata?.nom || '',
        email: u.email || '',
        role: u.user_metadata?.role || 'etudiant'
      })
    }
    setLoading(false)
  }

  function handlePhoto(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setMsg('Image trop lourde. Maximum 2 Mo.')
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    setMsg('')
    try {
      let photoUrl = profile.photo_url || ''

      // Upload photo if changed
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `avatars/${user.id}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('profiles')
          .upload(path, photoFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(path)
          photoUrl = urlData.publicUrl
        }
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'etudiant',
        ...profile,
        photo_url: photoUrl
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })

      if (error) throw error
      setProfile({ ...profile, photo_url: photoUrl })
      setMsg('Profil enregistré avec succès !')
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) {
      setMsg('Erreur : ' + (e.message || 'Réessayez.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const isRecruteur = role === 'recruteur' || role === 'admin'
  const initial = (profile.prenom?.[0] || '?').toUpperCase()
  const fi = profile.filiere ? FILIERES[profile.filiere as keyof typeof FILIERES] : null
  const skills = profile.competences?.split(',').map(s => s.trim()).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-[#f5f4f0] pt-20">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-[#2d6a4f] transition flex items-center gap-1"
          >
            ← Tableau de bord
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — Preview carte profil */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#d5dad6] rounded-xl p-6 sticky top-24">
              <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                Aperçu de votre profil
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-20 h-20 rounded-full bg-[#e8f0eb] flex items-center justify-center font-serif font-black text-3xl text-[#2d6a4f] overflow-hidden mb-3 cursor-pointer ring-2 ring-[#d5dad6] hover:ring-[#2d6a4f] transition"
                  onClick={() => document.getElementById('photoInput')?.click()}
                  title="Changer la photo"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="photo" className="w-full h-full object-cover" />
                  ) : initial}
                </div>
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])}
                />
                <button
                  onClick={() => document.getElementById('photoInput')?.click()}
                  className="text-xs font-bold tracking-wider uppercase text-[#2d6a4f] hover:text-[#1b4332] transition"
                >
                  Changer la photo
                </button>
              </div>

              {/* Info */}
              <div className="text-center mb-4">
                <div className="font-bold text-[#1a2a1f]">
                  {profile.prenom || '—'} {profile.nom || ''}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {profile.universite || 'IGEDD'}
                </div>
              </div>

              {/* Filière */}
              {fi && (
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: fi.color }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: fi.color }}>
                    {fi.label} {profile.annee && `· ${profile.annee}`}
                  </span>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-xs text-gray-500 leading-relaxed text-center mb-4 line-clamp-3">
                  {profile.bio}
                </p>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {skills.slice(0, 4).map((s, i) => (
                    <span key={i} className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Role badge */}
              <div className={`mt-4 text-center text-xs font-bold tracking-widest uppercase py-1.5 rounded-full border ${
                role === 'admin'
                  ? 'text-[#c47c1a] bg-[#fdf3e3] border-[#c47c1a]/20'
                  : isRecruteur
                  ? 'text-[#1a5276] bg-[#e8f2fb] border-[#1a5276]/20'
                  : 'text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20'
              }`}>
                {role === 'admin' ? 'Administrateur IGEDD' : isRecruteur ? 'Recruteur' : 'Étudiant'}
              </div>
            </div>
          </div>

          {/* RIGHT — Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#d5dad6] rounded-xl p-6 lg:p-8">
              <h1 className="font-serif font-black text-2xl text-[#1a2a1f] mb-6">
                Mon profil
              </h1>

              {msg && (
                <div className={`text-sm p-3 rounded mb-5 ${
                  msg.includes('Erreur')
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-[#e8f0eb] text-[#2d6a4f] border border-[#2d6a4f]/20'
                }`}>
                  {msg}
                </div>
              )}

              {/* Informations personnelles */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-0.5 bg-[#2d6a4f]" />
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    Informations personnelles
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Prénom"
                    value={profile.prenom || ''}
                    onChange={v => setProfile({ ...profile, prenom: v })}
                  />
                  <Field
                    label="Nom"
                    value={profile.nom || ''}
                    onChange={v => setProfile({ ...profile, nom: v })}
                  />
                </div>
              </div>

              {/* Formation — étudiants uniquement */}
              {!isRecruteur && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-0.5 bg-[#2d6a4f]" />
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                      Formation
                    </span>
                  </div>
                  <div className="space-y-4">
                    <Field
                      label="Université"
                      value={profile.universite || ''}
                      onChange={v => setProfile({ ...profile, universite: v })}
                      placeholder="Ex: Université Joseph KI-ZERBO, IGEDD..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                          Filière
                        </label>
                        <select
                          value={profile.filiere || ''}
                          onChange={e => setProfile({ ...profile, filiere: e.target.value })}
                          className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                        >
                          <option value="">Choisir...</option>
                          {Object.entries(FILIERES).map(([k, v]) => (
                            <option key={k} value={k}>{v.label} — {v.full}</option>
                          ))}
                        </select>
                      </div>
                      <Field
                        label="Année d'étude"
                        value={profile.annee || ''}
                        onChange={v => setProfile({ ...profile, annee: v })}
                        placeholder="Ex: Master 2, Licence 3..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Compétences — étudiants uniquement */}
              {!isRecruteur && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-0.5 bg-[#2d6a4f]" />
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                      Compétences
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                      Compétences (séparées par virgule)
                    </label>
                    <input
                      value={profile.competences || ''}
                      onChange={e => setProfile({ ...profile, competences: e.target.value })}
                      placeholder="Ex: ISO 14001, QGIS, AutoCAD, Traitement eau..."
                      className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                    />
                    {/* Skills preview */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {skills.map((s, i) => (
                          <span key={i} className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-0.5 bg-[#2d6a4f]" />
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    Présentation
                  </span>
                </div>
                <textarea
                  value={profile.bio || ''}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Présentez-vous en quelques lignes. Vos objectifs, vos atouts, ce qui vous motive..."
                  className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition resize-none"
                />
              </div>

              {/* Save button */}
              <button
                onClick={saveProfile}
                disabled={saving}
                className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-3 rounded text-xs font-bold tracking-widest uppercase transition disabled:opacity-60 hover:shadow-lg"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer mon profil'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
      />
    </div>
  )
} 
