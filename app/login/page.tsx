'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type AuthMode = 'login' | 'signup'
type Role = 'etudiant' | 'recruteur'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [role, setRole] = useState<Role>('etudiant')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd, setLoginPwd] = useState('')

  // Signup fields
  const [signPrenom, setSignPrenom] = useState('')
  const [signNom, setSignNom] = useState('')
  const [signEmail, setSignEmail] = useState('')
  const [signPwd, setSignPwd] = useState('')
  const [signEntreprise, setSignEntreprise] = useState('')

  async function handleLogin() {
    if (!loginEmail || !loginPwd) {
      setError('Remplissez email et mot de passe.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPwd
      })
      if (error) throw error
      const userRole = data.user?.user_metadata?.role || 'etudiant'
      if (userRole === 'recruteur' || userRole === 'admin') {
        router.push('/recruteur')
      } else {
        router.push('/')
      }
    } catch (e: any) {
      setError("Email ou mot de passe incorrect. Vérifiez aussi que votre email est confirmé.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup() {
    if (!signPrenom || !signNom || !signEmail || !signPwd) {
      setError('Remplissez tous les champs.')
      return
    }
    if (signPwd.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email: signEmail,
        password: signPwd,
        options: {
          data: {
            prenom: signPrenom,
            nom: signNom,
            role,
            entreprise: signEntreprise
          }
        }
      })
      if (error) throw error
      setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      setMode('login')
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT — Visuel */}
      <div className="hidden lg:flex flex-col justify-center bg-[#1b4332] p-16 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute w-96 h-96 rounded-full border border-white/5 -top-20 -right-20" />
        <div className="absolute w-64 h-64 rounded-full border border-white/5 -bottom-10 -left-10" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img
            src="https://igedd.net/wp-content/uploads/2023/06/logo-IGEDD-526x526-1.png"
            alt="IGEDD"
            className="w-14 h-14 object-contain brightness-0 invert opacity-90"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <div>
            <div className="font-bold text-white text-lg leading-tight">
              IGEDD <span className="text-[#c47c1a]">Careers</span>
            </div>
            <div className="text-white/40 text-xs tracking-widest uppercase">
              Burkina Faso • 2026
            </div>
          </div>
        </div>

        {/* Titre */}
        <h1 className="font-serif text-5xl font-black leading-tight mb-6">
          <span className="block text-white/70 text-3xl font-normal">Trouve tes</span>
          <span className="block text-white">stages et emplois</span>
          <span className="block text-[#c47c1a] italic font-light text-2xl mt-1">
            au cœur du Sahel
          </span>
        </h1>

        <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-10">
          La plateforme dédiée aux étudiants et recruteurs de l'IGEDD.
          Connectez-vous pour accéder à toutes les opportunités.
        </p>

        {/* Stats */}
        <div className="flex gap-8">
          <div>
            <div className="text-[#c47c1a] font-black text-3xl font-serif">4</div>
            <div className="text-white/30 text-xs tracking-widest uppercase mt-1">Filières</div>
          </div>
          <div>
            <div className="text-[#c47c1a] font-black text-3xl font-serif" id="stat-offres">0</div>
            <div className="text-white/30 text-xs tracking-widest uppercase mt-1">Offres actives</div>
          </div>
          <div>
            <div className="text-[#c47c1a] font-black text-3xl font-serif" id="stat-cands">0</div>
            <div className="text-white/30 text-xs tracking-widest uppercase mt-1">Candidatures</div>
          </div>
        </div>
      </div>

      {/* RIGHT — Formulaire */}
      <div className="flex items-center justify-center bg-[#f5f4f0] p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img
              src="https://igedd.net/wp-content/uploads/2023/06/logo-IGEDD-526x526-1.png"
              alt="IGEDD"
              className="w-10 h-10 object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="font-bold text-[#1b4332] text-base">
              IGEDD <span className="text-[#c47c1a]">Careers</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#d5dad6] rounded-xl p-8 shadow-lg">

            {/* Tabs */}
            <div className="flex border-b border-[#d5dad6] mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors ${
                  mode === 'login'
                    ? 'text-[#2d6a4f] border-[#2d6a4f]'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                Se connecter
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors ${
                  mode === 'signup'
                    ? 'text-[#2d6a4f] border-[#2d6a4f]'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                Créer un compte
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-md mb-4">
                {success}
              </div>
            )}

            {/* LOGIN */}
            {mode === 'login' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={loginPwd}
                    onChange={e => setLoginPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/10 transition"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-3 rounded text-sm font-bold tracking-widest uppercase transition-colors disabled:opacity-60 mt-2"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            )}

            {/* SIGNUP */}
            {mode === 'signup' && (
              <div className="space-y-4">
                {/* Choix rôle */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                    Je suis
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRole('etudiant')}
                      className={`border rounded-lg p-3 text-left transition-all ${
                        role === 'etudiant'
                          ? 'border-[#2d6a4f] bg-[#e8f0eb]'
                          : 'border-[#d5dad6] bg-[#f5f4f0]'
                      }`}
                    >
                      <div className="font-bold text-sm text-[#1a2a1f]">Étudiant</div>
                      <div className="text-xs text-gray-400 mt-0.5">Je cherche un stage</div>
                    </button>
                    <button
                      onClick={() => setRole('recruteur')}
                      className={`border rounded-lg p-3 text-left transition-all ${
                        role === 'recruteur'
                          ? 'border-[#2d6a4f] bg-[#e8f0eb]'
                          : 'border-[#d5dad6] bg-[#f5f4f0]'
                      }`}
                    >
                      <div className="font-bold text-sm text-[#1a2a1f]">Recruteur</div>
                      <div className="text-xs text-gray-400 mt-0.5">Je publie des offres</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={signPrenom}
                      onChange={e => setSignPrenom(e.target.value)}
                      placeholder="Prénom"
                      className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={signNom}
                      onChange={e => setSignNom(e.target.value)}
                      placeholder="Nom"
                      className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                    />
                  </div>
                </div>

                {role === 'recruteur' && (
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Entreprise</label>
                    <input
                      type="text"
                      value={signEntreprise}
                      onChange={e => setSignEntreprise(e.target.value)}
                      placeholder="Ex: ONEA, Bureau Veritas..."
                      className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={signEmail}
                    onChange={e => setSignEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                    Mot de passe (min. 6 caractères)
                  </label>
                  <input
                    type="password"
                    value={signPwd}
                    onChange={e => setSignPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f5f4f0] border border-[#d5dad6] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2d6a4f] transition"
                  />
                </div>

                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-3 rounded text-sm font-bold tracking-widest uppercase transition-colors disabled:opacity-60"
                >
                  {loading ? 'Création...' : "S'inscrire"}
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              En continuant, vous acceptez les conditions d'utilisation de la plateforme IGEDD Careers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}