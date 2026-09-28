import { Award, Download } from 'lucide-react'
import { certificatesService } from '../../services/extras.service'
import { useFetch } from '../../hooks/useFetch'
import { isNotFound } from '../../services/api'
import { Card, EmptyState, ErrorState, GridSkeleton, Alert, Button } from '../../components/ui'
import { CertificateCard } from '../../components/business/CertificateCard'

export default function MentorCertificatesPage() {
  const certs = useFetch(() => certificatesService.getMyCertificates().then(normalize), [])
  const results = certs.data || []

  if (certs.loading) return <GridSkeleton count={3} />
  if (certs.error && !isNotFound(certs.error))
    return <ErrorState message={certs.error} onRetry={certs.refresh} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mes certificats</h1>
        <p className="mt-1 text-sm text-ink-3">
          Certificats délivrés pour tes cours et tes formations personnelles.
        </p>
      </div>

      {results.length === 0 && (
        <>
          <Alert.Info title="Les certificats sont délivrés par le serveur">
            Ils ne sont jamais fabriqués côté client : ils sont générés uniquement une fois les conditions
            (cours terminés et évaluations validées) remplies.
          </Alert.Info>
          <Card>
            <EmptyState
              icon={Award}
              title="Aucun certificat pour l'instant"
              description="Termine tes cours et réussis les évaluations : chaque certificat est horodaté et vérifiable par QR code."
            />
          </Card>
        </>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((c) => (
            <div key={c.id} className="space-y-2">
              <CertificateCard certificate={c} />
              <Button variant="outline" icon={Download} className="w-full">
                Télécharger le PDF
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function normalize(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}