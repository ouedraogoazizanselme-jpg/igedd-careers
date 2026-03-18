 'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ARTICLES = [
  {
    id: 1,
    color: '#2d6a4f',
    cat: 'CV et Candidature',
    title: 'Comment rédiger un CV qui retient l\'attention',
    excerpt: 'Les recruteurs consacrent moins de 10 secondes à un CV. Voici comment vous démarquer dans le secteur de l\'environnement au Burkina Faso.',
    content: `
      <h3>La structure idéale</h3>
      <p>Un bon CV dans les métiers de l'environnement doit être clair, tenir en une page maximum pour les jeunes diplômés, et mettre en avant vos compétences techniques spécifiques à votre filière.</p>
      <h3>Les éléments essentiels</h3>
      <ul>
        <li>Nom et contacts en haut, lisibles</li>
        <li>Objectif professionnel en 2 lignes</li>
        <li>Formation avec mention de votre filière IGEDD</li>
        <li>Compétences techniques : logiciels, normes maîtrisées</li>
        <li>Expériences et stages avec résultats concrets</li>
        <li>Langues et certifications</li>
      </ul>
      <h3>Les erreurs à éviter</h3>
      <p>Évitez les photos de mauvaise qualité, les fautes d'orthographe et les informations inutiles. Privilégiez un format PDF propre et lisible.</p>
      <h3>Pour les étudiants IGEDD</h3>
      <p>Mentionnez explicitement votre filière (MQSE, EER, TEA ou TES), les normes que vous maîtrisez (ISO 14001, ISO 9001), et les logiciels (QGIS, AutoCAD, Excel avancé).</p>
    `
  },
  {
    id: 2,
    color: '#c47c1a',
    cat: 'Entretien',
    title: 'Réussir son entretien d\'embauche',
    excerpt: 'Préparez-vous à convaincre en quelques minutes. Les techniques qui font la différence pour les métiers de l\'environnement.',
    content: `
      <h3>Avant l'entretien</h3>
      <p>Renseignez-vous sur l'entreprise, ses projets environnementaux et sa culture. Relisez votre CV et préparez des exemples concrets pour illustrer vos compétences.</p>
      <h3>Les questions fréquentes</h3>
      <ul>
        <li>Parlez-moi de vous (2 minutes maximum)</li>
        <li>Pourquoi notre entreprise ?</li>
        <li>Quelles sont vos forces en gestion environnementale ?</li>
        <li>Comment géreriez-vous une non-conformité ISO ?</li>
        <li>Où vous voyez-vous dans 5 ans ?</li>
      </ul>
      <h3>Pendant l'entretien</h3>
      <p>Soyez ponctuel, habillez-vous professionnellement et posez des questions intelligentes. Montrez votre motivation pour les enjeux environnementaux au Burkina Faso.</p>
      <h3>Après l'entretien</h3>
      <p>Envoyez un email de remerciement dans les 24h. Relancez poliment si vous n'avez pas de nouvelles après 2 semaines.</p>
    `
  },
  {
    id: 3,
    color: '#1a5276',
    cat: 'Stage',
    title: 'Trouver un stage sans réseau professionnel',
    excerpt: 'Stratégie pratique pour décrocher votre premier stage dans l\'environnement, même sans connexions au départ.',
    content: `
      <h3>Les canaux à privilégier</h3>
      <ul>
        <li>Cette plateforme IGEDD Careers en premier lieu</li>
        <li>Les réseaux sociaux professionnels : LinkedIn</li>
        <li>Les associations étudiantes et le bureau des stages de votre université</li>
        <li>Les salons et forums entreprises organisés par l'IGEDD</li>
        <li>La candidature spontanée par email</li>
      </ul>
      <h3>La candidature spontanée</h3>
      <p>Identifiez les entreprises de votre secteur : ONEA, ANAM, bureaux d'étude, mines, ONG environnement. Écrivez un email personnalisé avec votre CV et une lettre adaptée à chaque structure.</p>
      <h3>Construire son réseau</h3>
      <p>Participez aux activités du Club de Génie de l'IGEDD, assistez aux conférences et webinaires sur l'environnement, rejoignez des associations professionnelles.</p>
    `
  },
  {
    id: 4,
    color: '#b83232',
    cat: 'Lettre de motivation',
    title: 'Écrire une lettre de motivation percutante',
    excerpt: 'La lettre qui donne envie de vous rencontrer. Méthode et exemples pour les métiers de l\'environnement.',
    content: `
      <h3>La structure en 3 paragraphes</h3>
      <ul>
        <li><strong>Accroche :</strong> pourquoi ce poste vous intéresse spécifiquement</li>
        <li><strong>Corps :</strong> ce que vous apportez (formation IGEDD + compétences)</li>
        <li><strong>Conclusion :</strong> votre motivation et demande d'entretien</li>
      </ul>
      <h3>Ce qu'on veut lire</h3>
      <p>Les recruteurs veulent savoir : pourquoi eux, pourquoi vous, et ce que vous allez apporter. Soyez concret. Mentionnez un projet de l'entreprise, une problématique environnementale du secteur.</p>
      <h3>Exemple d'accroche</h3>
      <p>« Étudiant en Master 2 MQSE à l'IGEDD, j'ai été attiré par votre recrutement après avoir suivi les travaux de votre bureau sur l'évaluation d'impact environnemental dans la région du Sahel... »</p>
    `
  },
  {
    id: 5,
    color: '#2d6a4f',
    cat: 'Rémunération',
    title: 'Négocier sa rémunération de stage',
    excerpt: 'Vous méritez d\'être correctement rémunéré. Comment aborder la question de la gratification sereinement.',
    content: `
      <h3>Connaître les standards</h3>
      <p>Au Burkina Faso, les gratifications de stage varient selon les secteurs. Les mines et grandes entreprises offrent généralement entre 50 000 et 200 000 FCFA par mois. Les ONG et administrations sont souvent autour de 30 000 à 80 000 FCFA.</p>
      <h3>Quand aborder le sujet</h3>
      <p>Attendez que l'entreprise vous propose le stage avant de parler de rémunération. Ne l'abordez pas en entretien de sélection.</p>
      <h3>Comment négocier</h3>
      <p>Remerciez pour l'offre, mentionnez votre profil spécifique, et posez la question : « Quelle est la gratification prévue pour ce stage ? » Restez professionnel et appréciatif quelle que soit la réponse.</p>
    `
  },
  {
    id: 6,
    color: '#c47c1a',
    cat: 'Métiers',
    title: 'Les métiers d\'avenir dans l\'environnement au BF',
    excerpt: 'Quels secteurs recrutent le plus au Burkina Faso en 2026 ? Le guide complet pour orienter votre recherche.',
    content: `
      <h3>Les secteurs qui recrutent</h3>
      <ul>
        <li><strong>Secteur minier :</strong> IAMGOLD Essakane, Endeavour Mining — forte demande en MQSE</li>
        <li><strong>Eau et assainissement :</strong> ONEA, ONG WASH — TEA très recherchés</li>
        <li><strong>Énergies renouvelables :</strong> Boom solaire en Afrique de l'Ouest — EER en plein essor</li>
        <li><strong>Bureaux d'étude :</strong> EIES, audits, conseil environnemental</li>
        <li><strong>ONG internationales :</strong> MSF, UNICEF, OMS, UICN</li>
      </ul>
      <h3>Les compétences les plus demandées en 2026</h3>
      <p>SIG/QGIS, normes ISO 14001/ISO 9001, traitement des données environnementales, anglais courant, capacité à travailler en zone rurale et en équipes multidisciplinaires.</p>
    `
  }
]

export default function ConseilsPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<typeof ARTICLES[0] | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const r = data.session.user.user_metadata?.role || 'etudiant'
      setRole(r)
      // Recruteurs redirected to home
      if (r === 'recruteur' || r === 'admin') {
        router.push('/')
        return
      }
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f4f0]">

      {/* Hero */}
      <section className="bg-white border-b border-[#d5dad6] pt-28 pb-12 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-0.5 bg-[#2d6a4f]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#2d6a4f]">Ressources</span>
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-black text-[#1a2a1f] mb-3">
            Conseils <em className="text-[#c47c1a] not-italic">carrière</em>
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg font-light">
            Tous les conseils pour réussir votre insertion professionnelle dans les métiers de l'environnement au Burkina Faso.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ARTICLES.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className="bg-white border border-[#d5dad6] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-[#2d6a4f] transition-all duration-300 group"
            >
              {/* Color bar */}
              <div className="h-1" style={{ background: a.color }} />
              <div className="p-6">
                {/* Category */}
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-3"
                  style={{ color: a.color }}
                >
                  {a.cat}
                </div>
                {/* Title */}
                <h2 className="font-serif font-bold text-lg text-[#1a2a1f] leading-snug mb-3 group-hover:text-[#2d6a4f] transition-colors">
                  {a.title}
                </h2>
                {/* Excerpt */}
                <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
                  {a.excerpt}
                </p>
                {/* Read more */}
                <div
                  className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-all group-hover:gap-3"
                  style={{ color: a.color }}
                >
                  Lire l'article <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Color bar */}
            <div className="h-1 rounded-t-xl" style={{ background: selected.color }} />

            {/* Header */}
            <div className="p-6 border-b border-[#d5dad6] flex justify-between items-start gap-4">
              <div>
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: selected.color }}
                >
                  {selected.cat}
                </div>
                <h2 className="font-serif font-black text-2xl text-[#1a2a1f] leading-snug">
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded bg-[#f5f4f0] text-gray-400 hover:text-gray-600 flex items-center justify-center flex-shrink-0 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              className="p-6 prose prose-sm max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#1a2a1f]
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-sm
                prose-ul:text-gray-600 prose-ul:text-sm prose-li:my-1
                prose-strong:text-[#1a2a1f]"
              dangerouslySetInnerHTML={{ __html: selected.content }}
            />

            {/* Footer */}
            <div className="p-6 border-t border-[#d5dad6] flex justify-between items-center">
              <button
                onClick={() => setSelected(null)}
                className="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-gray-600 transition"
              >
                ← Retour aux articles
              </button>
              <button
                onClick={() => { setSelected(null); router.push('/') }}
                className="text-xs font-bold tracking-widest uppercase text-white px-5 py-2.5 rounded transition"
                style={{ background: selected.color }}
              >
                Voir les offres →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
