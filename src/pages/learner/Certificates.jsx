import { Award, Download, QrCode } from 'lucide-react'
import { certificatesService } from '../../services/extras.service'
import { useFetch } from '../../hooks/useFetch'
import { isNotFound } from '../../services/api'
import { CertificateCard, CertificateActions } from '../../components/business/CertificateCard'
import { Button, Card, EmptyState, ErrorState, GridSkeleton, Modal, Alert } from '../../components/ui'
import { useState } from 'react'

export default function CertificatesPage() {
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
          Preuve vérifiable de tes compétences — jamais fabriqué côté client.
        </p>
      </div>

      {results.length === 0 && (
        <>
          <Alert.Info title="Comment obtenir un certificat ?">
            Termine 100% des leçons d'un cours, réussis le quiz final avec le score requis (généralement 70%) et valide
            l'évaluation finale. La certification est ensuite délivrée par le serveur.
          </Alert.Info>
          <Card>
            <EmptyState
              icon={Award}
              title="Aucun certificat pour l'instant"
              description="Continue ton parcours : chaque cours terminé avec succès rapproche de son certificat unique en QR code."
            />
          </Card>
        </>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((c) => (
            <div key={c.id} className="space-y-2">
              <CertificateCard certificate={c} />
              <CertificateActions certificate={c} />
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