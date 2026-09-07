import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Upload, ArrowLeft, Save } from 'lucide-react';
import type { AgentFormData } from '../types';
import { agentService } from '../services/agent.service';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toInputDate } from '../utils/format';
import toast from 'react-hot-toast';

const FONCTIONS = [
  'Agent de Sécurité', 'Chef de Patrouille', 'Agent de Contrôle',
  'Responsable de Secteur', 'Agent de Surveillance', 'Commandant de Garde',
].map((v) => ({ value: v, label: v }));

const AFFECTATIONS = [
  'Centre', 'Nord', 'Sud', 'Est', 'Ouest', 'Marché Central',
  'Hôpital Préfectoral', 'Mairie', 'École Centrale', 'Gare Routière',
].map((v) => ({ value: v, label: v }));

export const AgentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<AgentFormData & { photo: string }>>({});

  const [form, setForm] = useState<AgentFormData>({
    nom: '', prenom: '', sexe: '', dateNaissance: '', lieuNaissance: '',
    photo: null, fonction: '', affectation: '', telephone: '', dateRecrutement: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    agentService.getById(id!).then((agent) => {
      setForm({
        nom: agent.nom,
        prenom: agent.prenom,
        sexe: agent.sexe,
        dateNaissance: toInputDate(agent.dateNaissance),
        lieuNaissance: agent.lieuNaissance,
        photo: null,
        fonction: agent.fonction,
        affectation: agent.affectation,
        telephone: agent.telephone,
        dateRecrutement: toInputDate(agent.dateRecrutement),
      });
      if (agent.photo) setPhotoPreview(agentService.getPhotoUrl(agent.photo));
    }).catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setInitialLoading(false));
  }, [id, isEdit]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format non autorisé. Utilisez JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 Mo');
      return;
    }

    setForm((f) => ({ ...f, photo: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: Partial<AgentFormData & { photo: string }> = {};
    if (!form.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!form.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!form.sexe) errs.sexe = 'Le sexe est obligatoire' as never;
    if (!form.dateNaissance) errs.dateNaissance = 'La date de naissance est obligatoire';
    if (!form.lieuNaissance.trim()) errs.lieuNaissance = 'Le lieu de naissance est obligatoire';
    if (!form.fonction) errs.fonction = 'La fonction est obligatoire';
    if (!form.affectation) errs.affectation = 'L\'affectation est obligatoire';
    if (!form.telephone.trim()) errs.telephone = 'Le téléphone est obligatoire';
    if (!form.dateRecrutement) errs.dateRecrutement = 'La date de recrutement est obligatoire';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await agentService.update(id!, form);
        toast.success('Agent mis à jour avec succès');
      } else {
        const agent = await agentService.create(form);
        toast.success('Agent créé avec succès — Matricule : ' + agent.matricule);
      }
      navigate('/agents');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'agent' : 'Nouvel agent'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEdit ? 'Modifier les informations de l\'agent' : 'Enregistrer un nouvel agent de la Garde Communale'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-700" />
            Photo de l'agent
          </h2>
          <div className="flex items-center gap-6">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400
                flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 transition-colors"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => photoInputRef.current?.click()}
              >
                {photoPreview ? 'Changer la photo' : 'Choisir une photo'}
              </Button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP — Max 5 Mo</p>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Identité</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value.toUpperCase() })}
              placeholder="NOM DE FAMILLE"
              error={errors.nom as string}
              required
            />
            <Input
              label="Prénom"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              placeholder="Prénom(s)"
              error={errors.prenom as string}
              required
            />
            <Select
              label="Sexe"
              value={form.sexe}
              onChange={(e) => setForm({ ...form, sexe: e.target.value as 'M' | 'F' })}
              options={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]}
              placeholder="Sélectionner"
              error={errors.sexe as string}
              required
            />
            <Input
              type="date"
              label="Date de naissance"
              value={form.dateNaissance}
              onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
              error={errors.dateNaissance as string}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Lieu de naissance"
                value={form.lieuNaissance}
                onChange={(e) => setForm({ ...form, lieuNaissance: e.target.value })}
                placeholder="Ville / Village"
                error={errors.lieuNaissance as string}
                required
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informations professionnelles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Fonction"
              value={form.fonction}
              onChange={(e) => setForm({ ...form, fonction: e.target.value })}
              options={FONCTIONS}
              placeholder="Sélectionner"
              error={errors.fonction as string}
              required
            />
            <Select
              label="Affectation"
              value={form.affectation}
              onChange={(e) => setForm({ ...form, affectation: e.target.value })}
              options={AFFECTATIONS}
              placeholder="Sélectionner"
              error={errors.affectation as string}
              required
            />
            <Input
              label="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="+224 6XX XX XX XX"
              error={errors.telephone as string}
              required
            />
            <Input
              type="date"
              label="Date de recrutement"
              value={form.dateRecrutement}
              onChange={(e) => setForm({ ...form, dateRecrutement: e.target.value })}
              error={errors.dateRecrutement as string}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/agents')}>
            Annuler
          </Button>
          <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
            {isEdit ? 'Enregistrer les modifications' : 'Créer l\'agent'}
          </Button>
        </div>
      </form>
    </div>
  );
};
