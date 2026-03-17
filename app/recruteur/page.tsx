 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, FILIERES, type Offre, type Profile } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function RecruteurPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('etudiant')
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Offre form
  const [form, setForm] = useState({
    title: '', co: '', city: '', filiere: 'mqse',
    type: 'Stage', dur: '', remun: '', mail: '',
    description: '', missions: '', profil: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const u = data.session.user
      setUser(u)
      const r = u.user_metadata?.role || 'etudiant'
      setRole(r)
      if (r === 'recruteur' || r === 'admin') {
        loadProfiles()
      }
      setLoading(false)
    })
  }, [])

  async function loadProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'etudiant')
      .order('created_at', { ascending: false })
    setProfiles(data || [])
  }

  async function submitOffre() {
    if (!form.title || !form.co) {
      setErrorMsg("Remplissez au moins le titre et l'entreprise.")
      return
    }
    setSaving(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.from('offres').insert({
        ...form,
        is_new: true,
        candidatures: 0
      })
      if (error) throw error
      setSuccessMsg(`Offre "${form.title}" publiée avec succès !`)
      setShowForm(false)
      setForm({ title: '', co: '', city: '', filiere: 'mqse', type: 'Stage', dur: '', remun: '', mail: '', description: '', missions: '', profil: '' })
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (e: any) {
      setErrorMsg(e.message || 'Erreur lors de la publication.')
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

  return (
    <div className="min-h-screen bg-[#f5f4f0]">

      {/* ── HERO ── */}
      <section className="bg-[#1b4332] pt-28 pb-16 px-4 lg:px-8 relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full border border-white/5 -top-20 -right-20" />
        <div className="absolute w-64 h-64 rounded-full border border-white/5 bottom-0 left-1/4" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#c47c1a] animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#c47c1a]">
              Espace Recruteur
            </span>
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl font-black text-white leading-none mb-4">
            Trouvez vos <span className="text-[#c47c1a]">talents verts</span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-lg mb-8 font-light">
            Publiez vos offres et accédez directement aux profils des étudiants qualifiés de l'IGEDD.
            Banques, ONG, mines, bureaux d'étude.
          </p>
          {isRecruteur ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#c47c1a] hover:bg-[#a66918] text-white px-8 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Publier une offre
            </button>
          ) : (
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 max-w-md">
              <p className="text-white/70 text-sm">
                Vous devez avoir un compte <strong className="text-white">recruteur</strong> pour publier des offres.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="mt-3 text-xs font-bold tracking-widest uppercase text-[#c47c1a] hover:text-white transition"
              >
                Créer un compte recruteur →
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">

        {/* Success message */}
        {successMsg && (
          <div className="bg-[#e8f0eb] border border-[#2d6a4f]/20 text-[#2d6a4f] text-sm p-4 rounded-lg mb-6 font-semibold">
            {successMsg}
          </div>
        )}

        {/* Stats recruteur */}
        {isRecruteur && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { n: 4, l: 'Filières disponibles' },
              { n: '100%', l: 'Gratuit' },
              { n: '24h', l: 'Délai publication' },
              { n: '10', l: 'Candidatures max / offre' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[#d5dad6] rounded-xl p-4 text-center">
                <div className="font-serif text-3xl font-black text-[#2d6a4f]">{s.n}</div>
                <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Profils étudiants — recruteurs only */}
        {isRecruteur && (
          <div id="profils">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-0.5 bg-[#2d6a4f]" />
              <h2 className="font-serif text-2xl font-black text-[#1a2a1f]">
                Profils étudiants disponibles
              </h2>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#d5dad6] rounded-xl">
                <div className="font-serif text-2xl text-gray-300 mb-2">Aucun profil disponible</div>
                <p className="text-sm text-gray-400">Les étudiants inscrits apparaîtront ici.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {profiles.map(p => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info pour les non-recruteurs */}
        {!isRecruteur && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { title: 'Publiez vos offres', desc: 'Créez et gérez vos offres de stage, emploi et alternance en quelques clics.' },
              { title: 'Accédez aux profils', desc: 'Consultez les profils complets des étudiants IGEDD avec CV et compétences.' },
              { title: 'Contactez directement', desc: 'Échangez directement avec les candidats sans intermédiaire.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#d5dad6] rounded-xl p-6">
                <div className="w-8 h-0.5 bg-[#2d6a4f] mb-3" />
                <h3 className="font-serif font-bold text-lg text-[#1a2a1f] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL PUBLICATION ── */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-1 rounded-t-xl bg-[#c47c1a]" />
            <div className="p-6 border-b border-[#d5dad6] flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1a2a1f]">Publier une offre</h3>
                <p className="text-sm text-gray-400">Connectez votre entreprise aux talents de l'IGEDD</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded bg-[#f5f4f0] text-gray-400 hover:text-gray-600 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">{errorMsg}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Type d'offre">
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectCls}>
                    <option>Stage</option>
                    <option>Emploi</option>
                    <option>Alternance</option>
                  </select>
                </FormField>
                <FormField label="Filière ciblée">
                  <select value={form.filiere} onChange={e => setForm({ ...form, filiere: e.target.value })} className={selectCls}>
                    {Object.entries(FILIERES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label} — {v.full}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Intitulé du poste *">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Ingénieur QHSE, Technicien Eau..." className={inputCls} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Entreprise *">
                  <input value={form.co} onChange={e => setForm({ ...form, co: e.target.value })} placeholder="Nom de l'entreprise" className={inputCls} />
                </FormField>
                <FormField label="Ville">
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Ex: Ouagadougou, Bobo-Dioulasso..." className={inputCls} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Durée / Contrat">
                  <input value={form.dur} onChange={e => setForm({ ...form, dur: e.target.value })} placeholder="6 mois / CDI" className={inputCls} />
                </FormField>
                <FormField label="Contact RH">
                  <input type="email" value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} placeholder="rh@entreprise.bf" className={inputCls} />
                </FormField>
              </div>

              <FormField label="Rémunération">
                <input value={form.remun} onChange={e => setForm({ ...form, remun: e.target.value })} placeholder="Ex: Gratification + transport" className={inputCls} />
              </FormField>

              <FormField label="Description du poste">
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Décrivez le poste et les missions..." className={textareaCls} />
              </FormField>

              <FormField label="Missions (une par ligne)">
                <textarea value={form.missions} onChange={e => setForm({ ...form, missions: e.target.value })} rows={3} placeholder={"Audits internes ISO 14001\nSuivi des indicateurs QSE\n..."} className={textareaCls} />
              </FormField>

              <FormField label="Profil recherché">
                <input value={form.profil} onChange={e => setForm({ ...form, profil: e.target.value })} placeholder="Ex: Master MQSE, 2 ans expérience..." className={inputCls} />
              </FormField>
            </div>

            <div className="p-6 border-t border-[#d5dad6] flex gap-3">
              <button
                onClick={submitOffre}
                disabled={saving}
                className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-3 rounded text-xs font-bold tracking-widest uppercase transition disabled:opacity-60"
              >
                {saving ? 'Publication...' : "Publier l'offre"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 border border-[#d5dad6] text-gray-400 rounded text-xs font-bold tracking-widest uppercase hover:border-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── STYLES ──
const inputCls = "w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
const selectCls = "w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
const textareaCls = "w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition resize-none"

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ProfileCard({ profile: p }: { profile: Profile }) {
  const fi = p.filiere ? FILIERES[p.filiere as keyof typeof FILIERES] : null
  const initial = (p.prenom?.[0] || '?').toUpperCase()
  const skills = p.competences?.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) || []

  return (
    <div className="bg-white border border-[#d5dad6] rounded-xl p-5 hover:border-[#2d6a4f] hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#e8f0eb] flex items-center justify-center font-serif font-black text-xl text-[#2d6a4f] flex-shrink-0 overflow-hidden">
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.prenom} className="w-full h-full object-cover" />
          ) : initial}
        </div>
        <div>
          <div className="font-bold text-sm text-[#1a2a1f]">{p.prenom} {p.nom}</div>
          <div className="text-xs text-gray-400">{p.universite || 'IGEDD'}</div>
        </div>
      </div>

      {/* Filière */}
      {fi && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: fi.color }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: fi.color }}>
            {fi.label} {p.annee && `· ${p.annee}`}
          </span>
        </div>
      )}

      {/* Bio */}
      {p.bio && (
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{p.bio}</p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.map((s, i) => (
            <span key={i} className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Contact */}
      {p.email && (
        <a
          href={`mailto:${p.email}`}
          className="block w-full text-center text-xs font-bold tracking-widest uppercase text-[#2d6a4f] border border-[#2d6a4f]/30 py-2 rounded hover:bg-[#2d6a4f] hover:text-white transition"
          onClick={e => e.stopPropagation()}
        >
          Contacter →
        </a>
      )}
    </div>
  )
}
