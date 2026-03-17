'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, FILIERES, type Offre, MAX_CANDIDATURES } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function OffreDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [offre, setOffre] = useState<Offre | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  // Candidature form
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [filiere, setFiliere] = useState('')
  const [motiv, setMotiv] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const u = data.session.user
      setUser(u)
      setPrenom(u.user_metadata?.prenom || '')
      setNom(u.user_metadata?.nom || '')
      setEmail(u.email || '')
    })
    loadOffre()
  }, [id])

  async function loadOffre() {
    const { data } = await supabase
      .from('offres')
      .select('*')
      .eq('id', id)
      .single()
    setOffre(data)
    setLoading(false)

    // Check favori
    const { data: sess } = await supabase.auth.getSession()
    if (sess.session) {
      const { data: fav } = await supabase
        .from('favoris')
        .select('id')
        .eq('user_id', sess.session.user.id)
        .eq('offre_id', id)
        .single()
      setIsFav(!!fav)
    }
  }

  async function toggleFav() {
    if (!user) return
    if (isFav) {
      await supabase.from('favoris').delete().eq('user_id', user.id).eq('offre_id', id)
      setIsFav(false)
    } else {
      await supabase.from('favoris').insert({ user_id: user.id, offre_id: id })
      setIsFav(true)
    }
  }

  async function submitCandidature() {
    if (!prenom || !nom || !email) { setError('Remplissez prénom, nom et email.'); return }
    if (!cvFile) { setError('Veuillez joindre votre CV.'); return }
    setSending(true)
    setError('')
    try {
      // Save candidature
      await supabase.from('candidatures').insert({
        offre_id: Number(id),
        user_id: user?.id,
        nom, prenom, email, tel, filiere,
        motivation: motiv,
        cv_url: 'via_email',
        statut: 'en_attente'
      })

      // Increment candidatures count
      await supabase
        .from('offres')
        .update({ candidatures: (offre?.candidatures || 0) + 1 })
        .eq('id', id)

      // Open mail client
      const body = encodeURIComponent(
        `Bonjour,\n\nCandidature pour : ${offre?.title}\n\nNom : ${prenom} ${nom}\nEmail : ${email}\n${tel ? 'Tél : ' + tel + '\n' : ''}${filiere ? 'Filière : ' + filiere + '\n' : ''}${motiv ? '\nMotivation :\n' + motiv + '\n' : ''}\n[CV joint en pièce jointe]\n\nCordialement,\n${prenom} ${nom}`
      )
      window.location.href = `mailto:${offre?.mail}?subject=${encodeURIComponent('Candidature IGEDD — ' + offre?.title)}&body=${body}`

      setSuccess(true)
      setShowForm(false)
    } catch (e) {
      setError('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!offre) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="font-serif text-3xl text-gray-300">Offre introuvable</div>
        <button onClick={() => router.push('/')} className="text-[#2d6a4f] text-sm font-bold">
          ← Retour aux offres
        </button>
      </div>
    )
  }

  const fi = FILIERES[offre.filiere]
  const pct = Math.min((offre.candidatures / MAX_CANDIDATURES) * 100, 100)
  const missions = offre.missions?.split('\n').filter(m => m.trim()) || []

  return (
    <div className="min-h-screen bg-[#f5f4f0] pt-20">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">

        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#2d6a4f] mb-8 transition-colors"
        >
          ← Retour aux offres
        </button>

        <div className="bg-white border border-[#d5dad6] rounded-xl overflow-hidden shadow-sm">

          {/* Color bar */}
          <div className="h-1" style={{ background: fi.color }} />

          {/* Header */}
          <div className="p-6 lg:p-8 border-b border-[#d5dad6]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded border ${
                    offre.type === 'Stage' ? 'text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20' :
                    offre.type === 'Emploi' ? 'text-[#1a5276] bg-[#e8f2fb] border-[#1a5276]/20' :
                    'text-[#c47c1a] bg-[#fdf3e3] border-[#c47c1a]/20'
                  }`}>{offre.type}</span>
                  <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded border" style={{ color: fi.color, background: fi.color + '18', borderColor: fi.color + '44' }}>
                    {fi.label}
                  </span>
                  {offre.is_new && (
                    <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded border text-[#b83232] bg-[#fdeaea] border-[#b83232]/20">
                      Nouveau
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl lg:text-4xl font-black text-[#1a2a1f] mb-2">
                  {offre.title}
                </h1>
                <p className="text-gray-500 text-sm">
                  {offre.co} &nbsp;·&nbsp; {offre.city}, Burkina Faso &nbsp;·&nbsp; {offre.dur}
                </p>
              </div>

              {/* Fav button */}
              <button
                onClick={toggleFav}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  isFav
                    ? 'bg-[#fdeaea] border-[#b83232] text-[#b83232]'
                    : 'bg-white border-[#d5dad6] text-gray-300 hover:border-[#b83232] hover:text-[#b83232]'
                }`}
                title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                ♥
              </button>
            </div>

            {/* Candidatures progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="font-bold uppercase tracking-wider">Candidatures</span>
                <span className="font-bold">{offre.candidatures} / {MAX_CANDIDATURES}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2d6a4f, #c47c1a)' }}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 lg:p-8 grid lg:grid-cols-3 gap-8">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {offre.description && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Description</span>
                    <div className="flex-1 h-px bg-[#d5dad6]" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{offre.description}</p>
                </div>
              )}

              {missions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Missions principales</span>
                    <div className="flex-1 h-px bg-[#d5dad6]" />
                  </div>
                  <ul className="space-y-2">
                    {missions.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-4 h-px bg-[#2d6a4f] mt-2.5 flex-shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {offre.profil && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400">Profil recherché</span>
                    <div className="flex-1 h-px bg-[#d5dad6]" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{offre.profil}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Info card */}
              <div className="bg-[#f5f4f0] rounded-lg p-4 space-y-3">
                {[
                  { l: 'Type', v: offre.type },
                  { l: 'Durée', v: offre.dur },
                  { l: 'Ville', v: offre.city + ', BF' },
                  { l: 'Rémunération', v: offre.remun || 'À définir' },
                ].map(item => (
                  <div key={item.l}>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5">{item.l}</div>
                    <div className="text-sm font-semibold text-[#1a2a1f]">{item.v}</div>
                  </div>
                ))}
              </div>

              {/* Contact */}
              {offre.mail && (
                <div className="bg-[#f5f4f0] rounded-lg p-4">
                  <div className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Contact RH</div>
                  <a href={`mailto:${offre.mail}`} className="text-sm font-semibold text-[#2d6a4f] break-all">
                    {offre.mail}
                  </a>
                </div>
              )}

              {/* CTA */}
              {success ? (
                <div className="bg-[#e8f0eb] border border-[#2d6a4f]/20 rounded-lg p-4 text-center">
                  <div className="text-[#2d6a4f] font-bold text-sm mb-1">Candidature envoyée !</div>
                  <div className="text-xs text-gray-400">Bonne chance !</div>
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-3 rounded text-xs font-bold tracking-widest uppercase transition-all hover:shadow-lg"
                >
                  Postuler maintenant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL CANDIDATURE ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-1 rounded-t-xl" style={{ background: fi.color }} />
            <div className="p-6 border-b border-[#d5dad6] flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1a2a1f]">Postuler</h3>
                <p className="text-sm text-gray-400">{offre.title}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded bg-[#f5f4f0] text-gray-400 hover:text-gray-600 transition flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Prénom</label>
                  <input value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2 text-sm outline-none focus:border-[#2d6a4f]" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Nom</label>
                  <input value={nom} onChange={e => setNom(e.target.value)} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2 text-sm outline-none focus:border-[#2d6a4f]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2 text-sm outline-none focus:border-[#2d6a4f]" />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Téléphone</label>
                  <input value={tel} onChange={e => setTel(e.target.value)} placeholder="+226..." className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2 text-sm outline-none focus:border-[#2d6a4f]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Filière et année</label>
                <input value={filiere} onChange={e => setFiliere(e.target.value)} placeholder="Ex: Master 2 MQSE" className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2 text-sm outline-none focus:border-[#2d6a4f]" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Motivation (optionnel)</label>
                <textarea value={motiv} onChange={e => setMotiv(e.target.value)} rows={3} className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2 text-sm outline-none focus:border-[#2d6a4f] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">CV (PDF, Word — max 5 Mo)</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${cvFile ? 'border-[#2d6a4f] bg-[#e8f0eb]' : 'border-[#d5dad6] hover:border-[#2d6a4f]'}`}
                  onClick={() => document.getElementById('cvInput')?.click()}
                >
                  <input id="cvInput" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && f.size <= 5 * 1024 * 1024) setCvFile(f)
                  }} />
                  <div className="text-sm font-semibold text-gray-500">{cvFile ? cvFile.name : 'Cliquez pour ajouter votre CV'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">PDF, Word — 5 Mo maximum</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#d5dad6] flex gap-3">
              <button
                onClick={submitCandidature}
                disabled={sending}
                className="flex-1 text-white py-3 rounded text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-60"
                style={{ background: fi.color }}
              >
                {sending ? 'Envoi...' : 'Envoyer ma candidature'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 border border-[#d5dad6] text-gray-400 rounded text-xs font-bold tracking-widest uppercase hover:border-gray-400 transition">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
