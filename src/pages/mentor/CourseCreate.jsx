import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { coursesService } from '../../services/courses.service'
import { useFetch } from '../../hooks/useFetch'
import { COURSE_LEVELS } from '../../lib/constants'
import { getError } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { Alert, Button, Card, Input, Select, Textarea, Checkbox } from '../../components/ui'

export default function CourseCreatePage() {
  const navigate = useNavigate()
  const toast = useToast?.()
  const [form, setForm] = useState({
    title: '',
    summary: '',
    description: '',
    category: '',
    level: 'DEBUTANT',
    price: 0,
    is_premium: false,
    state_exam: false,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cats = useFetch(() => coursesService.getCategories().then((d) => (Array.isArray(d) ? d : d.results || [])), [])
  const categories = Array.isArray(cats.data) ? cats.data : []
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        description: form.description,
        category: form.category || undefined,
        level: form.level,
        price: form.is_premium ? Number(form.price) || 0 : 0,
        is_premium: form.is_premium,
        is_state_exam_prep: form.state_exam,
      }
      const created = await coursesService.createCourse(payload)
      toast?.success?.('Cours créé', 'Ajoute les leçons et publie-le pour le rendre visible.')
      navigate(`/mentor/courses/${created.id || created.course?.id || created.course_id}`)
    } catch (err) {
      setError(getError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Créer un cours</h1>
        <p className="mt-1 text-sm text-ink-3">
          Un cours structuré se compose de chapitres, de leçons et d'un quiz final.
        </p>
      </div>

      {error && <Alert.Error title="Création impossible">{error}</Alert.Error>}

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <Input
            label="Titre du cours"
            value={form.title}
            onChange={set('title')}
            placeholder="ex. Bases de l'algèbre"
            required
          />
          <Textarea
            label="Résumé du cours"
            value={form.summary}
            onChange={set('summary')}
            placeholder="Présente brièvement ce que l'apprenant va apprendre."
            required
            minLength={20}
            rows={3}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={set('description')}
            placeholder="Explique le contenu, les prérequis et ce que l'apprenant saura faire à la fin."
            required
            minLength={80}
            rows={5}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Catégorie" value={form.category} onChange={set('category')} required>
              <option value="" disabled>Sélectionner</option>
              {categories.map((c) => {
                const name = typeof c === 'object' ? c.name || c.title || c.id : c
                const id = typeof c === 'object' ? c.id : c
                return (
                  <option key={String(id)} value={id}>
                    {name}
                  </option>
                )
              })}
            </Select>
            <Select label="Niveau" value={form.level} onChange={set('level')}>
              {COURSE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="rounded-lg border border-line p-4 space-y-3">
            <Checkbox
              label="Cours premium (payant)"
              checked={form.is_premium}
              onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))}
            />
            {form.is_premium && (
              <Input
                label="Prix (BIF)"
                type="number"
                min="0"
                value={form.price}
                onChange={set('price')}
                hint="Montant du cours en francs burundais (BIF)."
              />
            )}
            <Checkbox
              label="Cours de préparation à l'examen d'État"
              checked={form.state_exam}
              onChange={(e) => setForm((f) => ({ ...f, state_exam: e.target.checked }))}
            />
          </div>
          <div className="flex gap-3 justify-end flex-col-reverse sm:flex-row">
            <Button variant="outline" type="button" onClick={() => navigate('/mentor/courses')}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting} icon={PenLine}>
              Créer le cours
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
