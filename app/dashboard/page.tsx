 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, FILIERES, type Profile, type Offre } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Tab = 'overview' | 'profile' | 'candidatures' | 'favoris' | 'alertes'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('etudiant')
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [candidatures, setCandidatures] = useState<any[]>([])
  const [favoris, setFavoris] = useState<any[]>([])
  const [alertes, setAlertes] = useState<any[]>([])
  const [offres, setOffres] = useState<Offre[]>([])
  const [alertFil, setAlertFil] = useState('')
  const [alertType, setAlertType] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const u = data.session.user
      setUser(u)
      setRole(u.user_metadata?.role || 'etudiant')
      loadAll(u)
    })
  }, [])

  async function loadAll(u: User) {
    setLoading(true)
    try {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (prof) setProfile(prof)
      else setProfile({ prenom: u.user_metadata?.prenom || '', nom: u.user_metadata?.nom || '', email: u.email || '', role: u.user_metadata?.role || 'etudiant' })
      const { data: cands } = await supabase.from('candidatures').select('*').eq('user_id', u.id).order('created_at', { ascending: false })
      setCandidatures(cands || [])
      const { data: favs } = await supabase.from('favoris').select('*, offres(*)').eq('user_id', u.id)
      setFavoris(favs || [])
      const { data: alts } = await supabase.from('alertes').select('*').eq('user_id', u.id)
      setAlertes(alts || [])
      const { data: offs } = await supabase.from('offres').select('*').order('created_at', { ascending: false }).limit(4)
      setOffres(offs || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: user.user_metadata?.role || 'etudiant', ...profile }, { onConflict: 'id' })
      setSaveMsg('Profil enregistré avec succès !')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch { setSaveMsg('Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }

  async function createAlerte() {
    if (!user) return
    const { data } = await supabase.from('alertes').insert({ user_id: user.id, email: user.email, filiere: alertFil || null, type_offre: alertType || null }).select().single()
    if (data) { setAlertes([...alertes, data]); setAlertFil(''); setAlertType('') }
  }

  async function deleteAlerte(id: number) {
    await supabase.from('alertes').delete().eq('id', id)
    setAlertes(alertes.filter(a => a.id !== id))
  }

  async function removeFavori(favId: number) {
    await supabase.from('favoris').delete().eq('id', favId)
    setFavoris(favoris.filter(f => f.id !== favId))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" /></div>

  const prenom = profile.prenom || user?.user_metadata?.prenom || 'Utilisateur'
  const isRecruteur = role === 'recruteur' || role === 'admin'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Aperçu' },
    { id: 'profile', label: 'Mon profil' },
    ...(!isRecruteur ? [{ id: 'candidatures' as Tab, label: 'Candidatures' }] : []),
    { id: 'favoris', label: 'Favoris' },
    ...(!isRecruteur ? [{ id: 'alertes' as Tab, label: 'Alertes' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#f5f4f0] pt-20">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-black text-[#1a2a1f]">Bonjour, <span className="text-[#2d6a4f]">{prenom}</span></h1>
          <p className="text-sm text-gray-400 mt-1">{isRecruteur ? 'Espace recruteur — publiez vos offres et gérez vos candidatures' : 'Espace étudiant — gérez vos candidatures et trouvez votre stage'}</p>
        </div>

        <div className="flex border-b border-[#d5dad6] mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-xs font-bold tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'text-[#2d6a4f] border-[#2d6a4f]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>{t.label}</button>
          ))}
        </div>

        {/* APERCU */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {isRecruteur ? (
                <>
                  <StatCard n={offres.length} label="Offres publiées" />
                  <StatCard n={candidatures.length} label="Candidatures reçues" />
                  <StatCard n={favoris.length} label="Offres en favoris" />
                </>
              ) : (
                <>
                  <StatCard n={candidatures.length} label="Candidatures envoyées" />
                  <StatCard n={favoris.length} label="Offres en favoris" />
                  <StatCard n={alertes.length} label="Alertes actives" />
                </>
              )}
            </div>
            <div className="bg-white border border-[#d5dad6] rounded-xl p-6">
              <h2 className="font-serif font-bold text-lg text-[#1a2a1f] mb-4">{isRecruteur ? 'Dernières offres publiées' : 'Dernières offres pour vous'}</h2>
              {offres.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <div className="font-serif text-2xl mb-1">Aucune offre</div>
                  {isRecruteur && <button onClick={() => router.push('/recruteur')} className="mt-3 bg-[#2d6a4f] text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded hover:bg-[#1b4332] transition">Publier une offre</button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {offres.map(o => <MiniOffreCard key={o.id} offre={o} onClick={() => router.push(`/offres/${o.id}`)} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFIL */}
        {tab === 'profile' && (
          <div className="bg-white border border-[#d5dad6] rounded-xl p-6 lg:p-8">
            <h2 className="font-serif font-bold text-xl text-[#1a2a1f] mb-6">Mon profil professionnel</h2>
            {saveMsg && <div className={`text-sm p-3 rounded mb-4 ${saveMsg.includes('Erreur') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#e8f0eb] text-[#2d6a4f] border border-[#2d6a4f]/20'}`}>{saveMsg}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Field label="Prénom" value={profile.prenom || ''} onChange={v => setProfile({ ...profile, prenom: v })} />
              <Field label="Nom" value={profile.nom || ''} onChange={v => setProfile({ ...profile, nom: v })} />
              {!isRecruteur && (
                <>
                  <Field label="Université" value={profile.universite || ''} onChange={v => setProfile({ ...profile, universite: v })} placeholder="Ex: Université Joseph KI-ZERBO..." />
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Filière</label>
                    <select value={profile.filiere || ''} onChange={e => setProfile({ ...profile, filiere: e.target.value })} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f]">
                      <option value="">Choisir...</option>
                      {Object.entries(FILIERES).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.full}</option>)}
                    </select>
                  </div>
                  <Field label="Année d'étude" value={profile.annee || ''} onChange={v => setProfile({ ...profile, annee: v })} placeholder="Ex: Master 2, Licence 3..." />
                </>
              )}
            </div>
            {!isRecruteur && (
              <div className="mt-4">
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Compétences</label>
                <input value={profile.competences || ''} onChange={e => setProfile({ ...profile, competences: e.target.value })} placeholder="Ex: ISO 14001, QGIS, AutoCAD..." className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f]" />
              </div>
            )}
            <div className="mt-4">
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Bio / Présentation</label>
              <textarea value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Présentez-vous en quelques lignes..." className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] resize-none" />
            </div>
            <button onClick={saveProfile} disabled={saving} className="mt-6 bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-8 py-3 rounded text-xs font-bold tracking-widest uppercase transition disabled:opacity-60">{saving ? 'Enregistrement...' : 'Enregistrer mon profil'}</button>
          </div>
        )}

        {/* CANDIDATURES */}
        {tab === 'candidatures' && !isRecruteur && (
          <div className="space-y-3">
            {candidatures.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#d5dad6] rounded-xl">
                <div className="font-serif text-2xl text-gray-300 mb-2">Aucune candidature</div>
                <p className="text-sm text-gray-400">Postulez à des offres pour les voir apparaître ici.</p>
                <button onClick={() => router.push('/')} className="mt-4 text-[#2d6a4f] text-sm font-bold">Voir les offres →</button>
              </div>
            ) : candidatures.map(c => (
              <div key={c.id} className="bg-white border border-[#d5dad6] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-[#1a2a1f]">{c.title || 'Offre'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
                <span className={`text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${c.statut === 'accepte' ? 'text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20' : c.statut === 'refuse' ? 'text-[#b83232] bg-[#fdeaea] border-[#b83232]/20' : 'text-[#c47c1a] bg-[#fdf3e3] border-[#c47c1a]/20'}`}>
                  {c.statut?.replace('_', ' ') || 'en attente'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* FAVORIS */}
        {tab === 'favoris' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {favoris.length === 0 ? (
              <div className="col-span-2 text-center py-16 bg-white border border-[#d5dad6] rounded-xl">
                <div className="font-serif text-2xl text-gray-300 mb-2">Aucun favori</div>
                <p className="text-sm text-gray-400">Cliquez sur ♥ d'une offre pour la sauvegarder.</p>
              </div>
            ) : favoris.map(f => f.offres && (
              <div key={f.id} className="bg-white border border-[#d5dad6] rounded-lg p-4 cursor-pointer hover:border-[#2d6a4f] transition group" onClick={() => router.push(`/offres/${f.offres.id}`)}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-[#1a2a1f] group-hover:text-[#2d6a4f] transition">{f.offres.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{f.offres.co} · {f.offres.city} · {f.offres.type}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeFavori(f.id) }} className="text-[#b83232] hover:text-red-700 text-lg">♥</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALERTES */}
        {tab === 'alertes' && !isRecruteur && (
          <div className="space-y-4">
            <div className="bg-white border border-[#d5dad6] rounded-xl p-6">
              <h3 className="font-serif font-bold text-lg text-[#1a2a1f] mb-4">Créer une alerte</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Domaine</label>
                  <select value={alertFil} onChange={e => setAlertFil(e.target.value)} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f]">
                    <option value="">Tous domaines</option>
                    {Object.entries(FILIERES).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.full}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Type d'offre</label>
                  <select value={alertType} onChange={e => setAlertType(e.target.value)} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f]">
                    <option value="">Tous types</option>
                    <option>Stage</option>
                    <option>Emploi</option>
                    <option>Alternance</option>
                  </select>
                </div>
              </div>
              <button onClick={createAlerte} className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-6 py-2.5 rounded text-xs font-bold tracking-widest uppercase transition">Créer cette alerte</button>
            </div>
            <div className="space-y-2">
              {alertes.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Aucune alerte configurée.</div> : alertes.map(a => (
                <div key={a.id} className="bg-white border border-[#d5dad6] rounded-lg px-5 py-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#1a2a1f]">{a.filiere ? FILIERES[a.filiere as keyof typeof FILIERES]?.label || a.filiere : 'Tous domaines'} · {a.type_offre || 'Tous types'}</div>
                  <button onClick={() => deleteAlerte(a.id)} className="text-xs font-bold tracking-wider uppercase text-gray-400 hover:text-[#b83232] border border-[#d5dad6] hover:border-[#b83232] px-3 py-1 rounded transition">Supprimer</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ n, label }: { n: number; label: string }) {
  return (
    <div className="bg-white border border-[#d5dad6] rounded-xl p-5 hover:shadow-sm transition">
      <div className="font-serif text-4xl font-black text-[#2d6a4f] leading-none mb-2">{n}</div>
      <div className="text-xs font-bold tracking-widest uppercase text-gray-400">{label}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition" />
    </div>
  )
}

function MiniOffreCard({ offre: o, onClick }: { offre: Offre; onClick: () => void }) {
  const fi = FILIERES[o.filiere]
  return (
    <div onClick={onClick} className="border border-[#d5dad6] rounded-lg p-4 cursor-pointer hover:border-[#2d6a4f] hover:shadow-sm transition group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-sm text-[#1a2a1f] group-hover:text-[#2d6a4f] transition">{o.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{o.co} · {o.city} · {o.type}</div>
        </div>
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: fi.color }} />
      </div>
    </div>
  )
}
