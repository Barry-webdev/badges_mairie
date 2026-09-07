import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, CreditCard, Download, ShieldOff, ShieldX, RotateCcw,
  User, Phone, MapPin, Calendar, Briefcase, QrCode,
} from 'lucide-react';
import type { Agent } from '../types';
import { agentService } from '../services/agent.service';
import { badgeService } from '../services/badge.service';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { BadgePreview } from '../components/badge/BadgePreview';
import { formatDate, formatDateLong, toInputDate } from '../utils/format';
import toast from 'react-hot-toast';

const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    {icon && <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">{icon}</div>}
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-gray-900 mt-0.5">{value || '—'}</div>
    </div>
  </div>
);

const REVOKE_MOTIFS = [
  { value: 'Perte du badge', label: 'Perte du badge' },
  { value: 'Vol', label: 'Vol' },
  { value: 'Fin de fonction', label: 'Fin de fonction' },
  { value: 'Décision administrative', label: 'Décision administrative' },
  { value: 'Autre', label: 'Autre' },
];

export const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [motif, setMotif] = useState('');
  const [renewDates, setRenewDates] = useState({ dateEmission: toInputDate(new Date()), dateExpiration: '' });
  const [genDates, setGenDates] = useState({ dateEmission: toInputDate(new Date()), dateExpiration: '' });

  const load = () => {
    setLoading(true);
    agentService.getById(id!).then(setAgent).catch(() => toast.error('Agent non trouvé'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleGenerate = async () => {
    if (!agent || !genDates.dateExpiration) return;
    setActionLoading(true);
    try {
      await badgeService.generate(agent._id, genDates);
      toast.success('Badge généré avec succès');
      setShowGenerate(false);
      load();
    } catch { toast.error('Erreur lors de la génération'); }
    finally { setActionLoading(false); }
  };

  const handleDownload = async () => {
    if (!agent?.badge?._id) return;
    try {
      await badgeService.downloadPdf(agent.badge._id, agent.matricule);
      toast.success('PDF téléchargé');
    } catch { toast.error('Erreur lors du téléchargement'); }
  };

  const handleRevoke = async () => {
    if (!agent?.badge?._id || !motif) return;
    setActionLoading(true);
    try {
      await badgeService.revoke(agent.badge._id, motif);
      toast.success('Badge révoqué');
      setShowRevoke(false);
      setMotif('');
      load();
    } catch { toast.error('Erreur lors de la révocation'); }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async () => {
    if (!agent?.badge?._id || !motif) return;
    setActionLoading(true);
    try {
      await badgeService.suspend(agent.badge._id, motif);
      toast.success('Badge suspendu');
      setShowSuspend(false);
      setMotif('');
      load();
    } catch { toast.error('Erreur lors de la suspension'); }
    finally { setActionLoading(false); }
  };

  const handleRenew = async () => {
    if (!agent?.badge?._id || !renewDates.dateExpiration) return;
    setActionLoading(true);
    try {
      await badgeService.renew(agent.badge._id, renewDates);
      toast.success('Badge renouvelé avec succès');
      setShowRenew(false);
      load();
    } catch { toast.error('Erreur lors du renouvellement'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full" />
    </div>
  );

  if (!agent) return (
    <div className="p-6 text-center text-gray-500">Agent non trouvé</div>
  );

  const photoUrl = agent.photo ? agentService.getPhotoUrl(agent.photo) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{agent.prenom} {agent.nom}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">
              {agent.matricule}
            </span>
            {agent.badge && <StatusBadge statut={agent.badge.statut as string} size="sm" />}
          </div>
        </div>
        <Link to={`/agents/${agent._id}/edit`}>
          <Button variant="outline" size="sm" icon={<Pencil className="w-4 h-4" />}>Modifier</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche — Photo + Actions */}
        <div className="space-y-4">
          {/* Photo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-blue-50 border-2 border-blue-100">
              {photoUrl ? (
                <img src={photoUrl} alt={`${agent.prenom} ${agent.nom}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-blue-200" />
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{agent.prenom} {agent.nom}</div>
              <div className="text-sm text-gray-500">{agent.fonction}</div>
            </div>
          </div>

          {/* Actions Badge */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Actions badge</p>
            {!agent.badge ? (
              <Button
                className="w-full"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => setShowGenerate(true)}
              >
                Générer le badge
              </Button>
            ) : (
              <>
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  icon={<QrCode className="w-4 h-4" />}
                  onClick={() => setShowPreview(true)}
                >
                  Aperçu du badge
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleDownload}
                >
                  Télécharger PDF
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => { setShowRenew(true); setRenewDates({ dateEmission: toInputDate(new Date()), dateExpiration: '' }); }}
                >
                  Renouveler
                </Button>
                {agent.badge.statut !== 'SUSPENDU' && agent.badge.statut !== 'RÉVOQUÉ' && (
                  <Button
                    className="w-full"
                    variant="warning"
                    size="sm"
                    icon={<ShieldOff className="w-4 h-4" />}
                    onClick={() => { setShowSuspend(true); setMotif(''); }}
                  >
                    Suspendre
                  </Button>
                )}
                {agent.badge.statut !== 'RÉVOQUÉ' && (
                  <Button
                    className="w-full"
                    variant="danger"
                    size="sm"
                    icon={<ShieldX className="w-4 h-4" />}
                    onClick={() => { setShowRevoke(true); setMotif(''); }}
                  >
                    Révoquer
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Colonne droite — Informations */}
        <div className="lg:col-span-2 space-y-4">
          {/* Identité */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-50">Identité</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Nom" value={agent.nom} icon={<User className="w-4 h-4" />} />
              <InfoRow label="Prénom" value={agent.prenom} />
              <InfoRow label="Sexe" value={agent.sexe === 'M' ? 'Masculin' : 'Féminin'} />
              <InfoRow label="Date de naissance" value={formatDateLong(agent.dateNaissance)} icon={<Calendar className="w-4 h-4" />} />
              <InfoRow label="Lieu de naissance" value={agent.lieuNaissance} icon={<MapPin className="w-4 h-4" />} />
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-50">Informations professionnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Fonction" value={agent.fonction} icon={<Briefcase className="w-4 h-4" />} />
              <InfoRow label="Affectation" value={agent.affectation} icon={<MapPin className="w-4 h-4" />} />
              <InfoRow label="Téléphone" value={agent.telephone} icon={<Phone className="w-4 h-4" />} />
              <InfoRow label="Date de recrutement" value={formatDateLong(agent.dateRecrutement)} icon={<Calendar className="w-4 h-4" />} />
            </div>
          </div>

          {/* Informations badge */}
          {agent.badge && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-50">Badge actuel</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Statut" value={agent.badge.statut as string} />
                <InfoRow label="N° Badge" value={agent.badge.badgeNumber} />
                <InfoRow label="Date d'émission" value={formatDate(agent.badge.dateEmission)} icon={<Calendar className="w-4 h-4" />} />
                <InfoRow label="Date d'expiration" value={formatDate(agent.badge.dateExpiration)} />
                {agent.badge.motifRevocation && (
                  <div className="sm:col-span-2">
                    <InfoRow label="Motif révocation" value={agent.badge.motifRevocation} />
                  </div>
                )}
                {agent.badge.motifSuspension && (
                  <div className="sm:col-span-2">
                    <InfoRow label="Motif suspension" value={agent.badge.motifSuspension} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aperçu badge */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Aperçu du badge" size="xl">
        {agent.badge && <BadgePreview agent={agent} badge={agent.badge} onDownload={handleDownload} />}
      </Modal>

      {/* Modale Générer */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Générer un badge" size="sm">
        <div className="space-y-4">
          <Input type="date" label="Date d'émission *" value={genDates.dateEmission}
            onChange={(e) => setGenDates({ ...genDates, dateEmission: e.target.value })} required />
          <Input type="date" label="Date d'expiration *" value={genDates.dateExpiration}
            onChange={(e) => setGenDates({ ...genDates, dateExpiration: e.target.value })} required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Annuler</Button>
            <Button onClick={handleGenerate} loading={actionLoading} disabled={!genDates.dateExpiration}>Générer</Button>
          </div>
        </div>
      </Modal>

      {/* Modale Révoquer */}
      <ConfirmModal isOpen={showRevoke} onClose={() => setShowRevoke(false)} onConfirm={handleRevoke}
        title="Révoquer le badge" message={`Révoquer le badge de ${agent.prenom} ${agent.nom} ?`}
        confirmLabel="Révoquer" variant="danger" loading={actionLoading}>
        <Select label="Motif *" value={motif} onChange={(e) => setMotif(e.target.value)}
          options={REVOKE_MOTIFS} placeholder="Sélectionner un motif" required />
      </ConfirmModal>

      {/* Modale Suspendre */}
      <Modal isOpen={showSuspend} onClose={() => setShowSuspend(false)} title="Suspendre le badge" size="sm">
        <div className="space-y-4">
          <Input label="Motif de suspension *" value={motif} onChange={(e) => setMotif(e.target.value)}
            placeholder="Raison de la suspension..." required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSuspend(false)}>Annuler</Button>
            <Button variant="warning" onClick={handleSuspend} loading={actionLoading} disabled={!motif}>Suspendre</Button>
          </div>
        </div>
      </Modal>

      {/* Modale Renouveler */}
      <Modal isOpen={showRenew} onClose={() => setShowRenew(false)} title="Renouveler le badge" size="sm">
        <div className="space-y-4">
          <Input type="date" label="Nouvelle date d'émission *" value={renewDates.dateEmission}
            onChange={(e) => setRenewDates({ ...renewDates, dateEmission: e.target.value })} required />
          <Input type="date" label="Nouvelle date d'expiration *" value={renewDates.dateExpiration}
            onChange={(e) => setRenewDates({ ...renewDates, dateExpiration: e.target.value })} required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRenew(false)}>Annuler</Button>
            <Button onClick={handleRenew} loading={actionLoading} disabled={!renewDates.dateExpiration}>Renouveler</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
