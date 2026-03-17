'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, FILIERES, type Offre } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const MAX_CAND = 10

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('etudiant')
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFil, setFilterFil] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [activeFil, setActiveFil] = useState('all')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      setUser(data.session.user)
      setRole(data.session.user.user_metadata?.role || 'etudiant')
    })

    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      setRole(session.user.user_metadata?.role || 'etudiant')
    })

    loadOffres()
  }, [])

  async function loadOffres() {
    setLoading(true)
    const { data } = await supabase
      .from('offres')
      .select('*')
      .order('created_at', { ascending: false })
    setOffres((data || []).filter((o: Offre) => o.candidatures < MAX_CAND))
    setLoading(false)
  }

  const filtered = offres.filter(o => {
    const mf = activeFil === 'all' || o.filiere === activeFil
    const mfs = !filterFil || o.filiere === filterFil
    const mt = !filterType || o.type === filterType
    const mc = !filterCity || o.city.toLowerCase().includes(filterCity.toLowerCase())
    const ms = !search || [o.title, o.co, o.city, o.description || ''].join(' ').toLowerCase().includes(search.toLowerCase())
    return mf && mfs && mt && mc && ms
  })

  const isRecruteur = role === 'recruteur' || role === 'admin'

  const filColors: Record<string, string> = {
    mqse: '#c47c1a', eer: '#b83232', tea: '#1a5276', tes: '#2d6a4f'
  }

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className={`min-h-[90vh] grid lg:grid-cols-2 overflow-hidden`}>

        {/* Left */}
        <div className={`flex flex-col justify-center px-6 lg:px-16 pt-28 pb-12 ${isRecruteur ? 'bg-[#1b4332]' : 'bg-white'}`}>

          {/* Kicker */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRecruteur ? 'bg-[#c47c1a]' : 'bg-[#2d6a4f]'}`} />
            <span className={`text-xs font-bold tracking-widest uppercase ${isRecruteur ? 'text-[#c47c1a]' : 'text-[#2d6a4f]'}`}>
              IGEDD Burkina Faso
            </span>
            <span className="text-xs text-gray-400">Pays des Hommes Intègres</span>
          </div>

          {/* Title */}
          {isRecruteur ? (
            <h1 className="font-serif text-5xl lg:text-7xl font-black leading-none mb-6">
              <span className="block text-white/70 text-3xl lg:text-4xl font-normal">Trouvez vos</span>
              <span className="block text-white">talents verts</span>
              <span className="block text-[#c47c1a] italic font-light text-2xl lg:text-3xl mt-2">
                au cœur du Sahel
              </span>
            </h1>
          ) : (
            <h1 className="font-serif text-5xl lg:text-7xl font-black leading-none mb-6">
              <span className="block text-gray-500 text-3xl lg:text-4xl font-normal">Trouve tes</span>
              <span className="block text-[#2d6a4f]">stages et emplois</span>
              <span className="block text-[#c47c1a] italic font-light text-2xl lg:text-3xl mt-2">
                au cœur du Sahel
              </span>
            </h1>
          )}

          {/* Description */}
          <p className={`text-sm leading-relaxed max-w-md mb-8 font-light border-l-2 pl-4 ${
            isRecruteur
              ? 'text-white/50 border-white/10'
              : 'text-gray-500 border-[#e8f0eb]'
          }`}>
            {isRecruteur
              ? "Publiez vos offres et accédez directement aux profils des étudiants qualifiés de l'IGEDD. Banques, ONG, mines, bureaux d'étude."
              : "La plateforme dédiée aux étudiants de l'IGEDD. Stages, emplois et alternances dans les 4 filières spécialisées au Burkina Faso."
            }
          </p>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            {isRecruteur ? (
              <>
                <button
                  onClick={() => router.push('/recruteur')}
                  className="bg-[#c47c1a] hover:bg-[#a66918] text-white px-8 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Publier une offre
                </button>
                <button
                  onClick={() => router.push('/recruteur#profils')}
                  className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-6 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all"
                >
                  Voir les profils étudiants
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => document.getElementById('offres')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-8 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Voir les offres
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="border border-[#d5dad6] text-gray-600 hover:border-[#2d6a4f] hover:text-[#2d6a4f] px-6 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all"
                >
                  Mon tableau de bord
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right — Stats */}
        <div className="bg-[#1b4332] relative overflow-hidden flex flex-col justify-end p-8 lg:p-12 min-h-[300px] lg:min-h-0">
          {/* Circles */}
          <div className="absolute w-96 h-96 rounded-full border border-white/5 -top-20 -right-20" />
          <div className="absolute w-64 h-64 rounded-full border border-white/5 top-1/3 right-1/4" />
          <div className="absolute w-48 h-48 rounded-full border border-white/5 -bottom-10 left-1/4" />

          {/* Stats grid */}
          <div className="relative z-10 grid grid-cols-2 gap-px bg-white/6 border border-white/6 rounded-lg overflow-hidden mb-6">
            {[
              { n: filtered.length, l: 'Offres actives' },
              { n: new Set(offres.map(o => o.co)).size, l: 'Entreprises' },
              { n: 4, l: 'Filières' },
              { n: offres.reduce((s, o) => s + o.candidatures, 0), l: 'Candidatures' },
            ].map((s, i) => (
              <div key={i} className="bg-black/20 p-5">
                <div className="font-serif text-4xl font-black text-white leading-none mb-1">{s.n}</div>
                <div className="text-xs tracking-widest uppercase text-white/30">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Filières */}
          <div className="relative z-10 grid grid-cols-2 gap-2">
            {Object.entries(FILIERES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setActiveFil(key); document.getElementById('offres')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="bg-white/5 border border-white/8 rounded p-3 text-left hover:bg-white/10 hover:-translate-y-0.5 transition-all group"
              >
                <div className="font-serif font-black text-lg mb-0.5" style={{ color: key === 'mqse' ? '#f0c030' : key === 'eer' ? '#e88080' : key === 'tea' ? '#80c0e0' : '#80c8a0' }}>
                  {val.label}
                </div>
                <div className="text-xs text-white/30">
                  {offres.filter(o => o.filiere === key).length} offre{offres.filter(o => o.filiere === key).length > 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECHERCHE AVANCEE ── */}
      <div className="bg-white border-b border-[#d5dad6] px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-0.5 bg-[#2d6a4f]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f]">
              Recherche avancée
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Mot clé</label>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Stage, environnement, eau, mine..."
                className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Ville</label>
              <input
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                placeholder="Ouagadougou..."
                className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Domaine</label>
              <select
                value={filterFil}
                onChange={e => setFilterFil(e.target.value)}
                className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
              >
                <option value="">Tous domaines</option>
                {Object.entries(FILIERES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} — {v.full}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Type</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
              >
                <option value="">Tous types</option>
                <option>Stage</option>
                <option>Emploi</option>
                <option>Alternance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILIERE STRIP ── */}
      <div className="bg-white border-b border-[#d5dad6] grid grid-cols-2 lg:grid-cols-4">
        {Object.entries(FILIERES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setActiveFil(activeFil === key ? 'all' : key)}
            className={`p-5 border-r border-[#d5dad6] last:border-r-0 text-left transition-all relative overflow-hidden group ${activeFil === key ? 'bg-[#f5f4f0]' : 'hover:bg-[#f5f4f0]'}`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5 transition-transform origin-left"
              style={{
                background: val.color,
                transform: activeFil === key ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
            <div className="font-serif font-black text-2xl mb-1" style={{ color: val.color }}>
              {val.label}
            </div>
            <div className="text-xs text-gray-400 leading-snug mb-2">{val.full}</div>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: val.color }}>
              {offres.filter(o => o.filiere === key).length} offre{offres.filter(o => o.filiere === key).length > 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>

      {/* ── OFFRES ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16" id="offres">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-0.5 bg-[#2d6a4f]" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f]">
                Opportunités disponibles
              </span>
            </div>
            <h2 className="font-serif text-4xl font-black text-[#1a2a1f]">
              Offres <em className="text-[#c47c1a] not-italic">{filtered.length}</em>
            </h2>
          </div>
          {/* Pill filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'mqse', 'eer', 'tea', 'tes'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFil(f)}
                className={`text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border transition-all ${
                  activeFil === f
                    ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                    : 'border-[#d5dad6] text-gray-400 hover:border-[#2d6a4f] hover:text-[#2d6a4f]'
                }`}
              >
                {f === 'all' ? 'Toutes' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-[#d5dad6] rounded-lg p-6 space-y-3 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-5 bg-gray-100 rounded w-5/6" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-serif text-4xl text-gray-200 mb-2">Aucune offre</div>
            <p className="text-gray-400 text-sm">Modifiez vos filtres ou revenez bientôt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((o, i) => (
              <OffreCard
                key={o.id}
                offre={o}
                index={i}
                onPostuler={() => router.push(`/offres/${o.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function OffreCard({ offre: o, index, onPostuler }: { offre: Offre, index: number, onPostuler: () => void }) {
  const fi = FILIERES[o.filiere]
  const pct = Math.min((o.candidatures / MAX_CAND) * 100, 100)
  const tagColor: Record<string, string> = {
    Stage: 'text-[#2d6a4f] bg-[#e8f0eb] border-[#2d6a4f]/20',
    Emploi: 'text-[#1a5276] bg-[#e8f2fb] border-[#1a5276]/20',
    Alternance: 'text-[#c47c1a] bg-[#fdf3e3] border-[#c47c1a]/20',
  }

  return (
    <div
      className="bg-white border border-[#d5dad6] rounded-lg p-5 cursor-pointer hover:border-[#2d6a4f] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onPostuler}
    >
      {/* Color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: fi.color }}
      />

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <div className="font-bold text-sm text-gray-700">{o.co}</div>
          <div className="text-xs text-gray-400">{o.city}, Burkina Faso</div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${tagColor[o.type] || tagColor.Stage}`}>
            {o.type}
          </span>
          {o.is_new && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border text-[#b83232] bg-[#fdeaea] border-[#b83232]/20 animate-pulse">
              Nouveau
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif font-bold text-lg text-[#1a2a1f] leading-snug mb-1 group-hover:text-[#2d6a4f] transition-colors">
        {o.title}
      </h3>

      {/* Filiere */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: fi.color }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: fi.color }}>
          {fi.label} — {fi.full}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
        {o.description}
      </p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span className="uppercase tracking-wider font-semibold">Candidatures</span>
          <span className="font-bold">{o.candidatures} / {MAX_CAND}</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, #2d6a4f, #c47c1a)`
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{o.dur}</span>
        <span className="text-xs font-bold text-[#2d6a4f] flex items-center gap-1 group-hover:gap-2 transition-all">
          Voir l'offre <span>→</span>
        </span>
      </div>
    </div>
  )
}