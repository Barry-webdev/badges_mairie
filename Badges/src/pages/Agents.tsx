import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Search, Filter, Eye, Pencil, CreditCard,
  Download, ShieldOff, ShieldX, RotateCcw, Loader2,
} from 'lucide-react';
import type { Agent } from '../types';
import { agentService } from '../services/agent.service';
import { badgeService } from '../services/badge.service';
import { StatusBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { formatDate, toInputDate } from '../utils/format';
import toast from 'react-hot-toast';

export const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modales
  const [revokeTarget, setRevokeTarget] = useState<Agent | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Agent | null>(null);
  const [renewTarget, setRenewTarget] = useState<Agent | null>(null);
  const [generateTarget, setGenerateTarget] = useState<Agent | null>(null);
  const [motif, setMotif] = useState('');
  const [renewDates, setRenewDates] = useState({ dateEmission: toInputDate(new Date()), dateExpiration: '' });
  const [genDates, setGenDates] = useState({ dateEmission: toInputDate(new Date()), dateExpiration: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentService.getAll({ page, limit: 15, search, statut });
      setAgents(res.data || []);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch {
      toast.error('Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  }, [page, search, statut]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statut]);

  const handleRevoke = async () => {
    if (!revokeTarget?.badge?._id || !motif) return;
    setActionLoading(true);
    try {
      await badgeService.revoke(revokeTarget.badge._id, motif);
      toast.success('Badge révoqué avec succès');
      setRevokeTarget(null);
      setMotif('');
      load();
    } catch { toast.error('Erreur lors de la révocation'); }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async () => {
    if (!suspendTarget?.badge?._id || !motif) return;
    setActionLoading(true);
    try {
      await badgeService.suspend(suspendTarget.badge._id, motif);
      toast.success('Badge suspendu avec succès');
      setSuspendTarget(null);
      setMotif('');
      load();
    } catch { toast.error('Erreur lors de la suspension'); }
    finally { setActionLoading(false); }
  };

  const handleGenerate = async () => {
    if (!generateTarget || !genDates.dateEmission || !genDates.dateExpiration) return;
    setActionLoading(true);
    try {
      await badgeService.generate(generateTarget._id, genDates);
      toast.success('Badge généré avec succès');
      setGenerateTarget(null);
      load();
    } catch { toast.error('Erreur lors de la génération'); }
    finally { setActionLoading(false); }
  };

  const handleRenew = async () => {
    if (!renewTarget?.badge?._id || !renewDates.dateExpiration) return;
    setActionLoading(true);
    try {
      await badgeService.renew(renewTarget.badge._id, renewDates);
      toast.success('Badge renouvelé avec succès');
      setRenewTarget(null);
      load();
    } catch { toast.error('Erreur lors du renouvellement'); }
    finally { setActionLoading(false); }
  };

  const handleDownload = async (agent: Agent) => {
    if (!agent.badge?._id) { toast.error('Aucun badge à télécharger'); return; }
    const toastId = toast.loading('Génération du PDF...');
    try {
      await badgeService.downloadPdf(String(agent.badge._id), agent.matricule);
      toast.success('Badge PDF téléchargé !', { id: toastId });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erreur téléchargement', { id: toastId });
    }
  };

  const REVOKE_MOTIFS = [
    { value: 'Perte du badge', label: 'Perte du badge' },
    { value: 'Vol', label: 'Vol' },
    { value: 'Fin de fonction', label: 'Fin de fonction' },
    { value: 'Décision administrative', label: 'Décision administrative' },
    { value: 'Autre', label: 'Autre' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} agent{total !== 1 ? 's' : ''} enregistré{total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/agents/new">
          <Button icon={<UserPlus className="w-4 h-4" />}>Ajouter un agent</Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="EXPIRÉ">Expiré</option>
              <option value="RÉVOQUÉ">Révoqué</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users_icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun agent trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Matricule</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Fonction</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Affectation</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Expiration</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{agent.prenom} {agent.nom}</div>
                          <div className="text-xs text-gray-400 md:hidden">{agent.fonction}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                        {agent.matricule}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">{agent.fonction}</td>
                    <td className="px-4 py-3.5 text-gray-600 hidden lg:table-cell">{agent.affectation}</td>
                    <td className="px-4 py-3.5">
                      {agent.badge ? (
                        <StatusBadge statut={agent.badge.statut as string} size="sm" />
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sans badge</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                      {agent.badge?.dateExpiration ? formatDate(agent.badge.dateExpiration) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/agents/${agent._id}`)}
                          title="Voir"
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/agents/${agent._id}/edit`)}
                          title="Modifier"
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {!agent.badge ? (
                          <button
                            onClick={() => setGenerateTarget(agent)}
                            title="Générer badge"
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownload(agent)}
                              title="Télécharger PDF"
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {agent.badge.statut !== 'RÉVOQUÉ' && agent.badge.statut !== 'SUSPENDU' && (
                              <button
                                onClick={() => { setSuspendTarget(agent); setMotif(''); }}
                                title="Suspendre"
                                className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                              >
                                <ShieldOff className="w-4 h-4" />
                              </button>
                            )}
                            {agent.badge.statut !== 'RÉVOQUÉ' && (
                              <button
                                onClick={() => { setRevokeTarget(agent); setMotif(''); }}
                                title="Révoquer"
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              >
                                <ShieldX className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => { setRenewTarget(agent); setRenewDates({ dateEmission: toInputDate(new Date()), dateExpiration: '' }); }}
                              title="Renouveler"
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} total={total} limit={15} onChange={setPage} />
      </div>

      {/* Modale Révoquer */}
      <ConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Révoquer le badge"
        message={`Êtes-vous sûr de vouloir révoquer le badge ${revokeTarget?.matricule} ? Cette action est irréversible.`}
        confirmLabel="Révoquer le badge"
        variant="danger"
        loading={actionLoading}
      >
        <Select
          label="Motif de révocation *"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          options={REVOKE_MOTIFS}
          placeholder="Sélectionner un motif"
          required
        />
      </ConfirmModal>

      {/* Modale Suspendre */}
      <Modal isOpen={!!suspendTarget} onClose={() => setSuspendTarget(null)} title="Suspendre le badge" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Suspendre le badge de <strong>{suspendTarget?.prenom} {suspendTarget?.nom}</strong> ?
          </p>
          <Input
            label="Motif de suspension *"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Raison de la suspension..."
            required
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Annuler</Button>
            <Button variant="warning" onClick={handleSuspend} loading={actionLoading} disabled={!motif}>
              Suspendre
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modale Générer badge */}
      <Modal isOpen={!!generateTarget} onClose={() => setGenerateTarget(null)} title="Générer un badge" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Générer un badge pour <strong>{generateTarget?.prenom} {generateTarget?.nom}</strong>
          </p>
          <Input
            type="date"
            label="Date d'émission *"
            value={genDates.dateEmission}
            onChange={(e) => setGenDates({ ...genDates, dateEmission: e.target.value })}
            required
          />
          <Input
            type="date"
            label="Date d'expiration *"
            value={genDates.dateExpiration}
            onChange={(e) => setGenDates({ ...genDates, dateExpiration: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setGenerateTarget(null)}>Annuler</Button>
            <Button onClick={handleGenerate} loading={actionLoading} disabled={!genDates.dateExpiration}>
              Générer le badge
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modale Renouveler */}
      <Modal isOpen={!!renewTarget} onClose={() => setRenewTarget(null)} title="Renouveler le badge" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Renouveler le badge de <strong>{renewTarget?.prenom} {renewTarget?.nom}</strong>
          </p>
          <Input
            type="date"
            label="Nouvelle date d'émission *"
            value={renewDates.dateEmission}
            onChange={(e) => setRenewDates({ ...renewDates, dateEmission: e.target.value })}
            required
          />
          <Input
            type="date"
            label="Nouvelle date d'expiration *"
            value={renewDates.dateExpiration}
            onChange={(e) => setRenewDates({ ...renewDates, dateExpiration: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRenewTarget(null)}>Annuler</Button>
            <Button onClick={handleRenew} loading={actionLoading} disabled={!renewDates.dateExpiration}>
              Renouveler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Composant icône utilisé localement
const Users_icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
