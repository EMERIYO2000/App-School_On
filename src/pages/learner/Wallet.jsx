import { useMemo, useState } from 'react'
import { CreditCard, Wallet as WalletIcon, Bitcoin, RefreshCw } from 'lucide-react'
import { paymentsService, paginate } from '../../services/payments.service'
import { useFetch } from '../../hooks/useFetch'
import { getError } from '../../services/api'
import PaymentStatus from '../../components/business/PaymentStatus'
import { Alert, Button, Card, EmptyState, ErrorState, Input, PageLoader, Select, StatCard } from '../../components/ui'
import { formatMoney } from '../../lib/format'

export default function WalletPage() {
  const txs = useFetch(() => paymentsService.getTransactions().then(paginate), [])
  const wallet = useFetch(() => paymentsService.getWalletSummary(), [])
  const provider = useFetch(() => paymentsService.getWalletProviderStatus(), [])
  const deposits = useFetch(() => paymentsService.getDeposits().then(paginate), [])
  const [deposit, setDeposit] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [depositMethod, setDepositMethod] = useState('blink')
  const [bitliberaPhone, setBitliberaPhone] = useState('')
  const [bitliberaOtp, setBitliberaOtp] = useState('')
  const [bitliberaOtpSent, setBitliberaOtpSent] = useState(false)
  const results = txs.data?.results || []
  const depositResults = deposits.data?.results || []

  const stats = useMemo(() => {
    const paid = results.filter((t) => ['SUCCESS', 'COMPLETED', 'PAID', 'RELEASED'].includes(String(t.status || '').toUpperCase()))
    const pending = results.filter((t) => ['PENDING', 'PROCESSING', 'HELD', 'READY_TO_RELEASE'].includes(String(t.status || '').toUpperCase()))
    return {
      spent: paid.reduce((s, t) => s + Number(t.amount || 0), 0),
      pending: pending.reduce((s, t) => s + Number(t.amount || 0), 0),
    }
  }, [results])

  async function createDeposit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    try {
      const amount = form.get('amount')
      if (depositMethod === 'bitlibera' && !bitliberaOtpSent) {
        await paymentsService.requestBitliberaOtp({ phone: bitliberaPhone, amount })
        setBitliberaOtpSent(true)
        setNotice('Code OTP envoyé. Saisis-le pour confirmer le dépôt Bitlibera.')
        return
      }
      const created = await paymentsService.createDeposit({
        amount,
        currency: 'BIF',
        method: depositMethod,
        ...(depositMethod === 'bitlibera' ? { bitlibera_phone: bitliberaPhone, bitlibera_otp: bitliberaOtp } : {}),
      })
      setDeposit(created)
      setNotice(depositMethod === 'blink' ? 'Invoice créé. Le solde sera crédité après confirmation du paiement.' : 'Dépôt Bitlibera créé. Le solde sera crédité après confirmation.')
      deposits.refresh()
    } catch (err) {
      setError(getError(err))
    } finally {
      setBusy(false)
    }
  }

  async function verifyDeposit(reference) {
    setBusy(true)
    setError('')
    try {
      const updated = await paymentsService.getDepositStatus(reference)
      setDeposit(updated)
      if (updated.status === 'COMPLETED') setNotice('Dépôt confirmé. Ton solde a été actualisé.')
      else if (updated.status === 'EXPIRED' || updated.status === 'FAILED') setNotice('Cet invoice a expiré ou échoué. Crée un nouveau dépôt.')
      await Promise.all([wallet.refresh(), deposits.refresh()])
    } catch (err) {
      setError(getError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Portefeuille</h1>
        <p className="mt-1 text-sm text-ink-3">Solde, dépôts et paiements de tes cours et sessions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Solde disponible" value={formatMoney(wallet.data?.balance ?? 0)} icon={WalletIcon} tone="success" />
        <StatCard label="Total payé" value={formatMoney(wallet.data?.spent ?? stats.spent)} icon={CreditCard} tone="terracotta" />
        <StatCard label="Paiements en attente" value={formatMoney(wallet.data?.pending_spent ?? stats.pending)} icon={WalletIcon} tone="warning" />
        <StatCard label="Dépôts en attente" value={formatMoney(wallet.data?.deposits_pending ?? 0)} icon={Bitcoin} tone="blue" />
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-ink">Ajouter de l'argent</h2>
        </div>
        {depositMethod === 'blink' && !provider.data?.connected && (
          <Alert.Error>Le wallet Blink plateforme n’est pas configuré. Les dépôts Blink sont indisponibles.</Alert.Error>
        )}
        {depositMethod === 'bitlibera' && (
          <Alert.Info title="Dépôt Bitlibera">Le téléphone et l’OTP Bitlibera sont utilisés pour confirmer ce dépôt. Bitlibera doit être accessible depuis le serveur.</Alert.Info>
        )}
        {error && <Alert.Error>{error}</Alert.Error>}
        {notice && <Alert.Info>{notice}</Alert.Info>}
        <form onSubmit={createDeposit} className="flex flex-col sm:flex-row gap-3 items-end">
          <Input label="Montant (BIF)" name="amount" type="number" min="1" step="1" required className="flex-1" />
          <Select label="Méthode" name="method" value={depositMethod} onChange={(e) => {
            setDepositMethod(e.target.value)
            setBitliberaOtpSent(false)
            setBitliberaOtp('')
          }} className="flex-1">
            <option value="blink">Blink Lightning (SAT)</option>
            <option value="bitlibera">Bitlibera (BIF)</option>
          </Select>
          {depositMethod === 'bitlibera' && (
            <>
              <Input label="Téléphone Bitlibera" value={bitliberaPhone} onChange={(e) => setBitliberaPhone(e.target.value)} placeholder="+257..." required className="flex-1" />
              {bitliberaOtpSent && <Input label="Code OTP" value={bitliberaOtp} onChange={(e) => setBitliberaOtp(e.target.value)} inputMode="numeric" required className="flex-1" />}
            </>
          )}
          <Button type="submit" loading={busy} icon={CreditCard}>{depositMethod === 'bitlibera' && !bitliberaOtpSent ? 'Recevoir le code OTP' : 'Créer le dépôt'}</Button>
        </form>
        {deposit?.payment_request && deposit.status === 'PENDING' && (
          <div className="rounded-md border border-line bg-body p-4 space-y-3">
            <p className="text-sm font-medium">Invoice Lightning · {deposit.amount} {deposit.currency}</p>
            <textarea aria-label="Invoice Lightning" readOnly value={deposit.payment_request} className="w-full min-h-24 rounded-md border border-line bg-surface p-3 text-xs break-all" />
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => navigator.clipboard.writeText(deposit.payment_request)}>Copier l'invoice</Button>
              <Button variant="outline" loading={busy} icon={RefreshCw} onClick={() => verifyDeposit(deposit.reference)}>Vérifier le paiement</Button>
            </div>
          </div>
        )}
        {deposit?.method === 'bitlibera' && deposit.status === 'PENDING' && (
          <div className="rounded-md border border-line bg-body p-4 space-y-2 text-sm text-ink-2">
            Dépôt Bitlibera en attente de confirmation.
            <Button variant="outline" loading={busy} icon={RefreshCw} onClick={() => verifyDeposit(deposit.reference)}>Vérifier le dépôt</Button>
          </div>
        )}
      </Card>

      {(txs.loading || deposits.loading) && <PageLoader label="Chargement des paiements…" />}
      {!txs.loading && txs.error && <ErrorState message={getError(txs.error)} onRetry={txs.refresh} />}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Historique des dépôts</h2>
        {depositResults.length === 0 ? <Card><EmptyState icon={WalletIcon} title="Aucun dépôt" description="Tes dépôts apparaîtront ici après leur création." /></Card> : (
          <div className="space-y-2">{depositResults.map((item) => <div key={item.reference} className="flex flex-wrap justify-between gap-3 rounded-md border border-line bg-surface p-4 text-sm"><span>{item.method} · {item.reference}</span><span>{formatMoney(item.amount, item.currency)} · {item.status}</span>{item.status === 'PENDING' && <Button size="sm" variant="outline" loading={busy} onClick={() => verifyDeposit(item.reference)}>Vérifier</Button>}</div>)}</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Paiements des cours et sessions</h2>
        {!txs.loading && !txs.error && results.length === 0 ? <Card><EmptyState icon={CreditCard} title="Aucun paiement" description="Tes règlements de cours et de sessions apparaîtront ici." /></Card> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{results.map((t) => <PaymentStatus key={t.transaction_id} transaction={t} />)}</div>
        )}
      </section>
    </div>
  )
}
