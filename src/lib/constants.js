export const ROLES = {
  LEARNER: 'LEARNER',
  MENTOR: 'MENTOR',
  ADMIN: 'ADMIN',
}

export const USER_TYPES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
}

export const BOOKING_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'DISPUTED',
  'REFUNDED',
  'CANCELLED',
]

export const PAYMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
]

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  SUCCESS: 'Réussi',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé',
}

export const BOOKING_STATUS_LABELS = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  DISPUTED: 'Litige',
  REFUNDED: 'Remboursée',
  CANCELLED: 'Annulée',
}

export const COURSE_STATES = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumis',
  REVIEW: 'En révision',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
}

export const MENTOR_STATUSES = {
  DRAFT: 'Brouillon',
  PENDING_VERIFICATION: 'Vérification en attente',
  UNDER_REVIEW: 'En cours de révision',
  NEEDS_INFORMATION: 'Informations requises',
  VERIFIED: 'Vérifié',
  REJECTED: 'Rejeté',
  SUSPENDED: 'Suspendu',
}

export const LEARNER_MAIN_ACTIONS = [
  {
    key: 'learn',
    title: 'Apprendre',
    description: 'Explore les cours et reprends ta progression.',
    icon: 'BookOpen',
    to: '/courses',
    accent: 'blue',
  },
  {
    key: 'train',
    title: "S'entraîner",
    description: 'Des quiz et exercices pour identifier tes forces.',
    icon: 'PenLine',
    to: '/quiz',
    accent: 'terracotta',
  },
  {
    key: 'mentor',
    title: 'Trouver un mentor',
    description: 'Réserve une session avec un mentor vérifié.',
    icon: 'Users',
    to: '/mentors',
    accent: 'blue',
  },
  {
    key: 'community',
    title: 'Communauté',
    description: 'Pose des questions et aide les autres.',
    icon: 'MessagesSquare',
    to: '/community',
    accent: 'terracotta',
  },
]

export const COMMUNITY_CATEGORIES = [
  'programmation',
  'design',
  'mathématiques',
  'sciences',
  'langues',
  'business',
  'IA',
  'culture',
  'carrière',
  'études',
  'entraide',
]

export const COURSE_LEVELS = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'AVANCE', label: 'Avancé' },
]

export const DEFAULT_LOCATION = { lat: -3.4231, lng: 29.9236 }
