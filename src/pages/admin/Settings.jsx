import { useState } from 'react'
import { Save, Smartphone, Bell, Lock, Globe } from 'lucide-react'
import { Button, Card, FieldShell, Checkbox, SuccessHint, Alert } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'

const SETTINGS = [
  { key: 'allow_registration', label: 'Autoriser l’inscription ouverte', tone: 'default' },
  { key: 'require_mentor_verification', label: 'Exiger la vérification des mentors', tone: 'default' },
  { key: 'allow_community_posts', label: 'Autoriser les publications communautaires', tone: 'default' },
  { key: 'test_mode', label: 'Mode test des paiements (simulation)', tone: 'default' },
]

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [flags, setFlags] = useState(() => Object.fromEntries(SETTINGS.map((s) => [s.key, true])))
  const [maintenance, setMaintenance] = useState(false)

  const toggle = (key) => setFlags((f) => ({ ...f, [key]: !f[key] }))

  const save = () => {
    toast.success('Paramètres enregistrés (mode démonstration)')
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Paramètres de la plateforme</h1>
        <p className="mt-1 text-sm text-ink-3">Configuration générale de SCHOOL ON.</p>
      </div>

      <Alert.Info title="Mode démonstration">
        La persistance serveur de ces réglages sera branchée sur l'endpoint admin dédié.
      </Alert.Info>

      <Card className="p-5">
        <h2 className="font-semibold text-ink flex items-center gap-2"><Smartphone className="w-5 h-5 text-brand-blue" /> Fonctionnalités</h2>
        <ul className="mt-3 divide-y divide-line">
          {SETTINGS.map((s) => (
            <li key={s.key} className="py-3 flex items-center justify-between gap-4">
              <span className="text-sm text-ink">{s.label}</span>
              <Checkbox
                checked={Boolean(flags[s.key])}
                onChange={() => toggle(s.key)}
                label="Activé"

              />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-ink flex items-center gap-2"><Bell className="w-5 h-5 text-brand-terracotta" /> Notifications</h2>
        <ul className="mt-3 divide-y divide-line">
          <li className="py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-ink">Notifications push pour les apprenants</span>
            <Checkbox checked label="Activé" />
          </li>
          <li className="py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-ink">Rappels de session par e-mail</span>
            <Checkbox checked label="Activé" />
          </li>
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-ink flex items-center gap-2"><Globe className="w-5 h-5 text-info" /> Maintenance</h2>
        <label className="mt-3 flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm text-ink">Mode maintenance</p>
            <p className="text-xs text-ink-3">Affiche un écran temporaire à tous les visiteurs.</p>
          </div>
          <Checkbox
            checked={maintenance}
            onChange={() => setMaintenance((v) => !v)}
            label="Activé"

          />
        </label>
        {maintenance && (
          <div className="mt-3">
            <SuccessHint>Le site affichera une page de maintenance jusqu'à la réactivation.</SuccessHint>
          </div>
        )}
      </Card>

      <Card className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-warning-light text-warning flex items-center justify-center"><Lock className="w-5 h-5" /></span>
          <div>
            <p className="text-sm font-medium text-ink">Sauvegarder la configuration</p>
            <p className="text-xs text-ink-3">Les changements seront appliqués globalement.</p>
          </div>
        </div>
        <Button onClick={save} icon={Save}>Enregistrer</Button>
      </Card>
    </div>
  )
}
