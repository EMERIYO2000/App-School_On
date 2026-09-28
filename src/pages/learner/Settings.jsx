import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, LogOut, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/auth.service'
import { usersService } from '../../services/profile.service'
import { getError } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { Button, Card, Input, Alert, ConfirmDialog } from '../../components/ui'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast?.()
  const [form, setForm] = useState({ older_password: '', new_password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function changePassword(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.new_password !== form.confirm_password) {
      setError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    try {
      await authService.changePassword(form)
      setSuccess('Mot de passe mis à jour avec succès.')
      setForm({ older_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(getError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function logoutAll() {
    setConfirm({ type: 'sessions', title: 'Fermer toutes les sessions', message: 'Toutes tes autres sessions seront fermées. Continuer ?' })
  }

  async function deactivate() {
    setConfirm({ type: 'deactivate', title: 'Désactiver mon compte', message: 'Ton compte sera désactivé. Cette action est irréversible via cette interface.' })
  }

  async function runAction() {
    setActionLoading(true)
    try {
      if (confirm?.type === 'sessions') {
        await usersService.logoutAll()
        toast?.success?.('Sessions fermées', 'Toutes les autres sessions ont été fermées.')
      } else {
        await usersService.deactivateAccount()
        logout()
        navigate('/')
        return
      }
    } catch (err) {
      toast?.error?.('Action impossible', getError(err))
    } finally {
      setActionLoading(false)
      setConfirm(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink">Paramètres</h1>

      <Card className="p-6">
        <h2 className="font-semibold text-ink flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-ink-3" /> Changer le mot de passe
        </h2>
        {error && <Alert.Error className="mt-4">{error}</Alert.Error>}
        {success && <Alert.Success className="mt-4">{success}</Alert.Success>}
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          <Input label="Ancien mot de passe" type="password" value={form.older_password} onChange={set('older_password')} required autoComplete="current-password" />
          <Input label="Nouveau mot de passe" type="password" value={form.new_password} onChange={set('new_password')} required autoComplete="new-password" />
          <Input label="Confirmer le nouveau mot de passe" type="password" value={form.confirm_password} onChange={set('confirm_password')} required autoComplete="new-password" />
          <Button type="submit" loading={submitting}>Mettre à jour</Button>
        </form>
      </Card>

      <Card className="p-6 border-warning/40">
        <h2 className="font-semibold text-ink flex items-center gap-2">
          <LogOut className="w-4 h-4 text-warning" /> Sécurité de session
        </h2>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={logoutAll} icon={LogOut}>
            Fermer toutes les sessions
          </Button>
          <Button variant="outline" onClick={() => { logout(); navigate('/') }} icon={LogOut}>
            Me déconnecter ({user?.email})
          </Button>
        </div>
      </Card>

      <Card className="p-6 border-error/40">
        <h2 className="font-semibold text-ink flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-error" /> Zone sensible
        </h2>
        <p className="mt-2 text-sm text-ink-3">
          Désactiver ton compte supprime l'accès à ton profil. Tes données sont alors traitées selon notre politique de
          confidentialité.
        </p>
        <div className="mt-4">
          <Button variant="destructive" onClick={deactivate}>Désactiver mon compte</Button>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={runAction}
        loading={actionLoading}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.type === 'sessions' ? 'Fermer' : 'Désactiver'}
      />
    </div>
  )
}