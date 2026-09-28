export const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return String(value)
  }
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

export const formatMoney = (value, currency = 'BIF') => {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  if (currency === 'XOF' || currency === 'XAF') return `${n.toLocaleString('fr-FR')} FCFA`
  return `${n.toLocaleString('fr-FR')} ${currency}`
}

export const formatNumber = (value) => {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString('fr-FR')
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export const getAvatar = (user) => user?.avatar || user?.profile_picture || user?.photo || ''

export const getMediaUrl = (value) => {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value || ''
  const apiUrl = import.meta.env.VITE_API_URL || '/api/'
  const origin = new URL(apiUrl, window.location.origin).origin
  return new URL(value, origin).toString()
}

export const getFullName = (user) => user?.full_name || user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || user?.email || 'Utilisateur'

export const getSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const parseEnrollmentStatus = (enrollment) => {
  const e = enrollment || {}
  const status = String(e.status || '').toUpperCase()
  return status || (e.is_active ? 'ACTIVE' : 'PENDING')
}

export const isPast = (date) => {
  if (!date) return false
  return new Date(date).getTime() < Date.now()
}

export const relativeTime = (value) => {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days} j`
  return formatDate(value)
}
