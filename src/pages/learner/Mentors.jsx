import { useState } from 'react'
import { Locate, MapPin, Users } from 'lucide-react'
import { usersService } from '../../services/profile.service'
import { useFetch, useGeolocation } from '../../hooks/useFetch'
import { DEFAULT_LOCATION } from '../../lib/constants'
import { MentorCard } from '../../components/business/MentorCard'
import { Button, Card, EmptyState, ErrorState, GridSkeleton, Alert } from '../../components/ui'

const DISTANCES = [5, 10, 20, 50]

function tryDistance(distance) {
  if (typeof distance === 'number') return distance
  const n = Number(distance)
  if (Number.isNaN(n)) return null
  return n
}

export default function MentorsPage() {
  const geo = useGeolocation(DEFAULT_LOCATION)
  const [radius, setRadius] = useState(10)
  const coords = geo.coords || DEFAULT_LOCATION
  const [locKey, setLocKey] = useState(0)

  const mentors = useFetch(
    () => usersService.nearbyTutors({ radius, lat: coords.lat, lng: coords.lng }).then(normalizeTutors),
    [radius, coords.lat, coords.lng, locKey]
  )

  const results = mentors.data || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Trouver un mentor</h1>
          <p className="mt-1 text-sm text-ink-3">
            Des mentors vérifiés, proches de toi — en ligne ou en présentiel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-3">
            <MapPin className="w-4 h-4" />
            {geo.status === 'success' ? 'Position utilisée' : geo.status === 'loading' ? 'Localisation…' : 'Par défaut'}
          </span>
          <Button variant="outline" size="sm" icon={Locate} onClick={() => { geo.locate(); setLocKey((k) => k + 1) }}>
            Me localiser
          </Button>
          {DISTANCES.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={radius === d ? 'primary' : 'outline'}
              onClick={() => setRadius(d)}
            >
              {d} km
            </Button>
          ))}
        </div>
      </div>

      {geo.status === 'denied' && (
        <Alert.Info title="Localisation désactivée">
          La recherche utilise tes coordonnées de profil par défaut. Tu peux autoriser la localisation pour des
          résultats plus précis.
        </Alert.Info>
      )}

      {mentors.loading && <GridSkeleton count={6} Card={MentorSkeleton} />}
      {!mentors.loading && mentors.error && <ErrorState message={mentors.error} onRetry={mentors.refresh} />}
      {!mentors.loading && !mentors.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={Users}
            title="Aucun mentor à proximité"
            description="D'ici quelques jours, des mentors vérifiés apparaîtront ici pour cette zone."
            action={
              <Button variant="outline" onClick={() => setRadius(50)}>
                Élargir à 50 km
              </Button>
            }
          />
        </Card>
      )}

      {!mentors.loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((m) => (
            <MentorCard key={m.id} mentor={m} distance={tryDistance(m.distance_km ?? m.distance)} />
          ))}
        </div>
      )}
    </div>
  )
}

function normalizeTutors(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  if (Array.isArray(data.tutors)) return data.tutors
  return []
}

function MentorSkeleton() {
  return <div className="bg-surface rounded-lg border border-line shadow-1 p-5">
    <div className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-surface-2 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-2 rounded-lg w-2/3 animate-pulse" />
        <div className="h-3 bg-surface-2 rounded-lg w-1/2 animate-pulse" />
      </div>
    </div>
    <div className="mt-4 h-3 bg-surface-2 rounded-lg w-1/3 animate-pulse" />
  </div>
}