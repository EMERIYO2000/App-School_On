import { useEffect, useRef, useState } from "react";
import { Camera, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/profile.service";
import { useGeolocation, useAsyncAction } from "../../hooks/useFetch";
import { getError } from "../../services/api";
import { getFullName, formatDate, getMediaUrl } from "../../lib/format";
import { useToast } from "../../components/ui/Toast";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Alert,
  FieldShell,
  Input,
  Select,
  Textarea,
} from "../../components/ui";

export default function ProfilePage() {
  const { user, profile, loadProfile, setUser } = useAuth();
  const toast = useToast?.();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const geo = useGeolocation();
  const saveLoc = useAsyncAction((coords) =>
    profileService.updateLocation(coords),
  );
  const saveLearner = useAsyncAction((payload) =>
    profileService.updateLearnerProfile(payload),
  );
  const saveIdentity = useAsyncAction((payload) => profileService.updateMyProfile(payload));
  const [identityForm, setIdentityForm] = useState({ first_name: '', last_name: '', phone_number: '' });
  const [learnerForm, setLearnerForm] = useState({
    date_of_birth: "",
    country: "",
    city: "",
    education_level: "",
    interests: "",
    learning_goal: "",
  });
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    setIdentityForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone_number: user?.phone_number || '' });
  }, [user?.first_name, user?.last_name, user?.phone_number]);

  useEffect(() => {
    profileService
      .getLearnerProfile()
      .then((data) => {
        setProfileCompletion(data.profile_completion || 0);
        setLearnerForm({
          date_of_birth: data.date_of_birth || "",
          country: data.country || "",
          city: data.city || "",
          education_level: data.education_level || "",
          interests: Array.isArray(data.interests)
            ? data.interests.join(", ")
            : data.interests || "",
          learning_goal: data.learning_goal || "",
        });
      })
      .catch(() => {});
  }, []);

  const fullName = getFullName(user);
  const roleLabel =
    user?.is_teacher ||
    String(user?.user_type || "").toUpperCase() === "TEACHER"
      ? "Enseignant / Mentor"
      : "Apprenant";
  const avatar = getMediaUrl(user?.avatar || profile?.user?.avatar || profile?.avatar || profile?.profile_picture);

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await profileService.uploadAvatar(file);
      if (updated?.avatar && user) setUser({ ...user, avatar: updated.avatar });
      await loadProfile();
      toast?.success?.("Avatar mis à jour");
    } catch (err) {
      toast?.error?.("Échec de la mise à jour", getError(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function saveIdentityDetails(event) {
    event.preventDefault();
    try {
      const result = await saveIdentity.run(identityForm);
      if (result?.user) setUser((current) => ({ ...current, ...result.user }));
      await loadProfile();
      toast?.success?.('Identité mise à jour');
    } catch (error) {
      toast?.error?.('Échec de la mise à jour', getError(error));
    }
  }

  async function updateLocation() {
    try {
      const coords = await geo.locate();
      if (!coords) return;
      await saveLoc.run({ latitude: coords.lat, longitude: coords.lng });
      toast?.success?.("Position mise à jour");
    } catch (err) {
      toast?.error?.("Échec", getError(err));
    }
  }

  async function saveLearnerDetails(event) {
    event.preventDefault();
    try {
      const updated = await saveLearner.run({
        ...learnerForm,
        interests: learnerForm.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setProfileCompletion(updated?.profile_completion || 0);
      toast?.success?.("Profil apprenant mis à jour");
    } catch (error) {
      toast?.error?.("Échec de la mise à jour", getError(error));
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink">Mon profil</h1>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <Avatar src={avatar} alt={fullName} size="xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-2 hover:bg-brand-blue-dark"
              aria-label="Changer l'avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-ink">{fullName}</h2>
            <p className="text-sm text-ink-3">{user?.email}</p>
            {user?.phone_number && (
              <p className="mt-0.5 text-sm text-ink-3">{user.phone_number}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="blue">{roleLabel}</Badge>
              {user?.is_verified && (
                <Badge tone="success">Compte vérifié</Badge>
              )}
            </div>
            <p className="mt-4 text-xs text-ink-3">
              Membre depuis {formatDate(user?.date_joined || user?.created_at)}
            </p>
          </div>
        </div>
        <div className="mt-6">
          {uploading && (
            <p className="text-sm text-ink-3">Mise à jour de l'avatar…</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-ink">Identité et coordonnées</h3>
        <p className="mt-1 mb-4 text-sm text-ink-3">Complète ton nom et ton numéro de téléphone. L’adresse e-mail sert d’identifiant et ne peut pas être modifiée ici.</p>
        <form onSubmit={saveIdentityDetails} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldShell label="Prénom" htmlFor="identity-first-name"><Input id="identity-first-name" autoComplete="given-name" required value={identityForm.first_name} onChange={(e) => setIdentityForm((current) => ({ ...current, first_name: e.target.value }))} /></FieldShell>
          <FieldShell label="Nom" htmlFor="identity-last-name"><Input id="identity-last-name" autoComplete="family-name" required value={identityForm.last_name} onChange={(e) => setIdentityForm((current) => ({ ...current, last_name: e.target.value }))} /></FieldShell>
          <FieldShell label="Adresse e-mail" htmlFor="identity-email"><Input id="identity-email" type="email" value={user?.email || ''} readOnly disabled /></FieldShell>
          <FieldShell label="Téléphone" htmlFor="identity-phone"><Input id="identity-phone" type="tel" autoComplete="tel" value={identityForm.phone_number} onChange={(e) => setIdentityForm((current) => ({ ...current, phone_number: e.target.value }))} /></FieldShell>
          <div className="sm:col-span-2"><Button type="submit" loading={saveIdentity.loading}>Enregistrer mon identité</Button></div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-ink">
            Mon parcours d’apprentissage
          </h3>
          <p className="mt-1 text-sm text-ink-3">
            Ces informations sont optionnelles et servent à personnaliser tes
            recommandations.
          </p>
          <p className="mt-2 text-xs font-medium text-ink-2">Profil complété : {profileCompletion}%</p>
        </div>
        <form
          onSubmit={saveLearnerDetails}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <FieldShell label="Date de naissance" htmlFor="learner-birth">
            <Input
              id="learner-birth"
              type="date"
              value={learnerForm.date_of_birth}
              onChange={(e) =>
                setLearnerForm((current) => ({
                  ...current,
                  date_of_birth: e.target.value,
                }))
              }
            />
          </FieldShell>
          <FieldShell label="Ville" htmlFor="learner-city">
            <Input
              id="learner-city"
              value={learnerForm.city}
              onChange={(e) =>
                setLearnerForm((current) => ({
                  ...current,
                  city: e.target.value,
                }))
              }
            />
          </FieldShell>
          <FieldShell label="Pays" htmlFor="learner-country">
            <Input
              id="learner-country"
              value={learnerForm.country}
              onChange={(e) =>
                setLearnerForm((current) => ({
                  ...current,
                  country: e.target.value,
                }))
              }
            />
          </FieldShell>
          <FieldShell label="Niveau scolaire" htmlFor="learner-level">
            <Select
              id="learner-level"
              value={learnerForm.education_level}
              onChange={(e) =>
                setLearnerForm((current) => ({
                  ...current,
                  education_level: e.target.value,
                }))
              }
            >
              <option value="">Sélectionner</option>
              <option value="PRIMARY">Primaire</option>
              <option value="SECONDARY">Secondaire</option>
              <option value="UNIVERSITY">Université</option>
              <option value="PROFESSIONAL">Professionnel</option>
            </Select>
          </FieldShell>
          <FieldShell
            label="Centres d’intérêt"
            htmlFor="learner-interests"
            className="sm:col-span-2"
          >
            <Input
              id="learner-interests"
              value={learnerForm.interests}
              onChange={(e) =>
                setLearnerForm((current) => ({
                  ...current,
                  interests: e.target.value,
                }))
              }
              placeholder="Mathématiques, programmation, langues"
            />
          </FieldShell>
          <FieldShell
            label="Objectif d’apprentissage"
            htmlFor="learner-goal"
            className="sm:col-span-2"
          >
            <Textarea
              id="learner-goal"
              rows={3}
              value={learnerForm.learning_goal}
              onChange={(e) =>
                setLearnerForm((current) => ({
                  ...current,
                  learning_goal: e.target.value,
                }))
              }
              placeholder="Ce que tu souhaites apprendre ou accomplir"
            />
          </FieldShell>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saveLearner.loading}>
              Enregistrer mon profil
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-ink-3" /> Localisation GPS
            </h3>
            <p className="mt-1 text-sm text-ink-3">
              Utilisée pour trouver des mentors à proximité. Elle reste privée.
            </p>
            {geo.coords && (
              <p className="mt-2 font-mono text-xs text-ink-3">
                {geo.coords.lat.toFixed(4)}, {geo.coords.lng.toFixed(4)}
              </p>
            )}
            {geo.status === "denied" && (
              <Alert.Info className="mt-3" title="Localisation non autorisée">
                Autorise l'accès à la position dans ton navigateur pour des
                résultats précis, ou renseigne tes coordonnées via l'API.
              </Alert.Info>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={MapPin}
            onClick={updateLocation}
            loading={saveLoc.loading}
          >
            Mettre à jour
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-ink">Notifications push</h3>
        <p className="mt-1 text-sm text-ink-3">
          Le token FCM de ton appareil est enregistré côté serveur
          (firebase_credentials.json requis en local).
        </p>
      </Card>
    </div>
  );
}
