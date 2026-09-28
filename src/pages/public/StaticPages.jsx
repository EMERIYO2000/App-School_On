import { Link } from 'react-router-dom'
import { GraduationCap, Heart, MapPin, ShieldCheck, Sparkles, Globe2 } from 'lucide-react'
import { Card } from '../../components/ui'

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
      <p className="text-sm font-semibold text-brand-terracotta-dark uppercase tracking-wide">À propos</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink">Pourquoi SCHOOL ON existe</h1>
      <p className="mt-4 text-lg text-ink-2 leading-relaxed">
        SCHOOL ON est une plateforme intelligente pour apprendre, enseigner et s'entraider. Elle réunit dans une même
        expérience : du <strong>contenu</strong> de qualité, de la <strong>pratique</strong> (quiz, exercices), des{' '}
        <strong>personnes</strong> de confiance (mentors vérifiés), une <strong>communauté</strong> éducative et une{' '}
        <strong>progression</strong> concrète — jusqu'à des certificats vérifiables.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {[
          { icon: GraduationCap, title: 'Apprendre', desc: 'Cours structurés en chapitres, leçons et contenus variés (texte, vidéo, code, documents).' },
          { icon: Heart, title: "S'entraîner", desc: 'Quiz et exercices pour identifier rapidement ses difficultés.' },
          { icon: Users, title: 'Obtenir de l’aide', desc: 'Des mentors vérifiés pour des sessions en ligne ou en présentiel.' },
          { icon: Sparkles, title: 'Progresser', desc: 'XP, suivi de progression, examens blancs et certifications reconnues.' },
        ].map((f) => {
          const Icon = f.icon
          return (
            <Card key={f.title} className="p-6">
              <Icon className="w-6 h-6 text-brand-blue" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-3">{f.desc}</p>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <ShieldCheck className="w-6 h-6 text-success" />
          <h3 className="mt-3 font-semibold">Confiance avant tout</h3>
          <p className="mt-1.5 text-sm text-ink-3">
            Mentors vérifiés étape par étape (identité, compétences, documents), paiements sécurisés et modération
            active. On ne fabrique jamais de décisions importantes côté client.
          </p>
        </Card>
        <Card className="p-6">
          <MapPin className="w-6 h-6 text-brand-terracotta" />
          <h3 className="mt-3 font-semibold">Enraciné, ouvert</h3>
          <p className="mt-1.5 text-sm text-ink-3">
            Pensé d'abord pour le Burundi et la région des Grands Lacs, mais ouvert à tous les apprenants francophones.
          </p>
        </Card>
      </div>

      <div className="mt-12 bg-gradient-to-br from-brand-blue-dark to-brand-blue text-white rounded-lg p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold">Rejoins plus de 30 secondes pour comprendre</h2>
          <p className="mt-2 text-white/85 text-sm">
            Une personne non technique doit comprendre l'utilité de SCHOOL ON en environ 30 secondes. C'est notre
            standard de simplicité.
          </p>
        </div>
        <Link to="/register" className="shrink-0 inline-flex items-center justify-center h-11 px-5 rounded-md bg-surface text-brand-blue-dark font-medium hover:bg-surface-2">
          Créer un compte
        </Link>
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-6">
      <h1 className="text-3xl font-bold text-ink">Confidentialité</h1>
      <p className="text-sm text-ink-3">Dernière mise à jour : {new Date().getFullYear()}</p>
      {[
        ['Compte et profil', 'Nous collectons les informations que tu saisis (nom, e-mail, téléphone) et les données nécessaires au bon fonctionnement de la plateforme.'],
        ['Données d’apprentissage', 'Ta progression, tes résultats de quiz et tes certificats sont conservés pour assurer le suivi de tes parcours.'],
        ['Position GPS', 'Elle est utilisée uniquement pour la recherche de mentors à proximité et peut être désactivée à tout moment.'],
        ['Partage', 'Les pages publiques de vérification de certificat n’exposent jamais ton e-mail, ton téléphone ni tes données privées.'],
        ['Sécurité', 'Les mots de passe sont hachés côté serveur et ton adresse privée n’est jamais rendue publique sur les profils mentors.'],
        ['Vos droits', 'Tu peux demander l’accès, la correction ou la suppression de tes données via ton espace paramètres.'],
      ].map(([t, d]) => (
        <Card key={t} className="p-5">
          <h2 className="font-semibold text-ink">{t}</h2>
          <p className="mt-1.5 text-sm text-ink-2">{d}</p>
        </Card>
      ))}
    </div>
  )
}

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-6">
      <h1 className="text-3xl font-bold text-ink">Conditions d'utilisation</h1>
      {[
        ['Utilisation du service', 'SCHOOL ON est une plateforme d’apprentissage, de mentorat et de communauté. En t’inscrivant, tu acceptes de l’utiliser dans un but éducatif et respectueux.'],
        ['Comptes & rôles', 'Les rôles (apprenant, mentor, admin) sont attribués selon la vérification effectuée. Les statuts de mentor (verifié, suspendu, rejeté) peuvent évoluer.'],
        ['Paiements & sessions', 'Les paiements sont gérés par des canaux sécurisés ; SCHOOL ON ne garde pas tes coordonnées bancaires. Les sessions de mentorat suivent un flux de réservation confirmé des deux côtés.'],
        ['Certificats', 'Un certificat est délivré uniquement après validation des conditions du parcours (100% des leçons, score minimum, évaluation finale). Sa validité peut être révoquée en cas de fraude.'],
        ['Conduite', 'Propos injurieux, triche, usurpation ou violation des droits d’autrui entraînent des sanctions pouvant aller jusqu’à la suspension du compte.'],
        ['Limitation de responsabilité', 'SCHOOL ON fait son maximum pour la fiabilité du service mais ne peut garantir une disponibilité ininterrompue.'],
      ].map(([t, d]) => (
        <Card key={t} className="p-5">
          <h2 className="font-semibold text-ink">{t}</h2>
          <p className="mt-1.5 text-sm text-ink-2">{d}</p>
        </Card>
      ))}
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-body flex items-center justify-center px-4">
      <div className="text-center">
        <Globe2 className="w-16 h-16 text-brand-blue mx-auto" />
        <h1 className="mt-6 text-6xl font-bold text-ink">404</h1>
        <p className="mt-2 text-ink-2">Cette page n'existe pas ou a été déplacée.</p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center px-5 rounded-md bg-brand-blue text-white font-medium hover:bg-brand-blue-dark">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-body flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Sparkles className="w-16 h-16 text-warning mx-auto" />
        <h1 className="mt-6 text-4xl font-bold text-ink">Accès refusé</h1>
        <p className="mt-2 text-ink-2">
          Tu n'as pas la permission de voir cette section. Si tu penses qu'il s'agit d'une erreur, contacte le support.
        </p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center px-5 rounded-md bg-brand-blue text-white font-medium hover:bg-brand-blue-dark">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}