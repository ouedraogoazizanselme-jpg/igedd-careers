'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>('etudiant')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user)
        setRole(data.session.user.user_metadata?.role || 'etudiant')
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setRole(session?.user?.user_metadata?.role || 'etudiant')
    })
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Declare isRecruteur BEFORE using it
  const isRecruteur = role === 'recruteur' || role === 'admin'
  const canPublish = isRecruteur
  const prenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || ''
  const initial = prenom[0]?.toUpperCase() || '?'

  // Conseils completely hidden from recruiters
  const navLinks = [
    { label: 'Offres', href: '/' },
    ...(!isRecruteur ? [{ label: 'Conseils carrière', href: '/conseils' }] : []),
    { label: 'Espace recruteur', href: '/recruteur' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || pathname !== '/'
          ? 'bg-white/95 backdrop-blur-xl border-b border-[#d5dad6] shadow-sm py-3'
          : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
            <img
              src="https://igedd.net/wp-content/uploads/2023/06/logo-IGEDD-526x526-1.png"
              alt="IGEDD"
              className="w-10 h-10 object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[#1b4332] text-sm">
                IGEDD <span className="text-[#c47c1a]">Careers</span>
              </span>
              <span className="text-[0.55rem] tracking-widest uppercase text-gray-400">
                Burkina Faso • 2026
              </span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`text-xs font-bold tracking-widest uppercase transition-colors relative pb-1 ${
                  pathname === link.href
                    ? 'text-[#2d6a4f]'
                    : 'text-gray-500 hover:text-[#2d6a4f]'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d6a4f] rounded" />
                )}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {canPublish && (
              <button
                onClick={() => router.push('/recruteur')}
                className="hidden lg:block text-xs font-bold tracking-widest uppercase bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-4 py-2 rounded transition-colors"
              >
                Publier une offre
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-[#2d6a4f] text-white font-bold text-sm flex items-center justify-center hover:ring-2 hover:ring-[#2d6a4f]/30 transition"
                >
                  {initial}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#d5dad6] rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 bg-[#f5f4f0] border-b border-[#d5dad6]">
                      <div className="font-bold text-sm text-[#1a2a1f]">
                        {user.user_metadata?.prenom} {user.user_metadata?.nom}
                      </div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                      <div className={`text-xs font-bold tracking-widest uppercase mt-1 ${
                        role === 'admin' ? 'text-[#c47c1a]' : 'text-[#2d6a4f]'
                      }`}>
                        {role === 'admin' ? 'Administrateur IGEDD' : role === 'recruteur' ? 'Recruteur' : 'Étudiant'}
                      </div>
                    </div>
                    <button
                      onClick={() => { router.push('/dashboard'); setDropdownOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-[#f5f4f0] hover:text-[#2d6a4f] transition"
                    >
                      Mon tableau de bord
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition border-t border-[#d5dad6]"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="text-xs font-bold tracking-widest uppercase bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-4 py-2 rounded transition-colors"
              >
                Se connecter
              </button>
            )}

            {/* Hamburger */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#d5dad6] px-4 py-4 flex flex-col gap-3">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => { router.push(link.href); setMenuOpen(false) }}
                className="text-sm font-bold tracking-widest uppercase text-gray-600 hover:text-[#2d6a4f] text-left py-2 border-b border-[#f5f4f0]"
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
                  className="text-sm font-bold tracking-widest uppercase text-gray-600 hover:text-[#2d6a4f] text-left py-2 border-b border-[#f5f4f0]"
                >
                  Mon tableau de bord
                </button>
                {canPublish && (
                  <button
                    onClick={() => { router.push('/recruteur'); setMenuOpen(false) }}
                    className="text-sm font-bold tracking-widest uppercase bg-[#2d6a4f] text-white py-2.5 rounded text-center"
                  >
                    Publier une offre
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold tracking-widest uppercase text-red-500 text-left py-2"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <button
                onClick={() => { router.push('/login'); setMenuOpen(false) }}
                className="text-sm font-bold tracking-widest uppercase bg-[#2d6a4f] text-white py-2.5 rounded text-center"
              >
                Se connecter
              </button>
            )}
          </div>
        )}
      </nav>

      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </>
  )
}