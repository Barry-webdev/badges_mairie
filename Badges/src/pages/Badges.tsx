import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, Download, ShieldOff, ShieldX, RotateCcw, CreditCard } from 'lucide-react';
import type { Badge } from '../types';
import { badgeService } from '../services/badge.service';
import { agentService } from '../services/agent.service';
import { StatusBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate, toInputDate } from '../utils/format';
import toast from 'react-hot-toast';

const REVOKE_MOTIFS = [
  { value: 'Perte du badge', label: 'Perte du badge' },
  { value: 'Vol', label: 'Vol' },
  { value: 'Fin de fonction', label: 'Fin de fonction' },
  { value: 'Décision administrative', label: 'Décision administrative' },
  { value: 'Autre', label: 'Autre' },
];

export const Badges = () => {
  const [searchParams] = useSearchParams();
  const statutParam = searchParams.get('statut') || '';

  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statut, setStatut] = useState(statutParam);
  const [actionLoading, setActionLoading] = useState(false);

  const [revokeTarget, setRevokeTarget] = useState<Badge | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Badge | null>(null);
  const [renewTarget, setRenewTarget] = useState<Badge | null>(null);
  const [motif, setMotif] = useState('');
  const [renewDates, setRenewDates] = useState({ dateEmission: toInputDate(new Date()), dateExpiration: '' });

  useEffect(() => { setStatut(statutParam); setPage(1); }, [statutParam]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await badgeService.getAll({ page, limit: 15, statut: statut || undefined });
      setBadges(res.data || []);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [page, statut]);

  useEffect(() => { load(); }, [load]);

  const getAgent = (badge: Badge) => typeof badge.agentId === 'object' ? badge.agentId : null;
  const getAgentPhotoUrl = (badge: Badge) => {
    const agent = getAgent(badge);
    return agent?.photo ? agentService.getPhotoUrl(agent.photo) : null;
  };

  const handleDownload = async (badge: Badge) => {
    const agent = getAgent(badge);
    try {
      await badgeService.downloadPdf(badge._id, agent?.matricule || badge.badgeNumber);
      toast.success('PDF téléchargé');
    } catch { toast.error('Erreur de téléchargement'); }
  };

  const handleRevoke = async () => {
    if (!revokeTarget || !motif) return;
    setActionLoading(true);
    try {
      await badgeService.revoke(revokeTarget._id, motif);
      toast.success('Badge révoqué');
      setRevokeTarget(null); setMotif(''); load();
    } catch { toast.error('Erreur révocation'); }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async () => {
    if (!suspendTarget || !motif) return;
    setActionLoading(true);
    try {
      await badgeService.suspend(suspendTarget._id, motif);
      toast.success('Badge suspendu');
      setSuspendTarget(null); setMotif(''); load();
    } catch { toast.error('Erreur suspension'); }
    finally { setActionLoading(false); }
  };

  const handleRenew = async () => {
    if (!renewTarget || !renewDates.dateExpiration) return;
    setActionLoading(true);
    try {
      await badgeService.renew(renewTarget._id, renewDates);
      toast.success('Badge renouvelé');
      setRenewTarget(null); load();
    } catch { toast.error('Erreur renouvellement'); }
    finally { setActionLoading(false); }
  };

  const STATUT_TITLES: Record<string, string> = {
    ACTIF: 'Badges actifs', SUSPENDU: 'Badges suspendus',
    'EXPIRÉ': 'Badges expirés', 'RÉVOQUÉ': 'Badges révoqués', '': 'Tous les badges',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{STATUT_TITLES[statut] || 'Badges'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} badge{total !== 1 ? 's' : ''}</p>
        </div>
        <select
          value={statut}
          onChange={(e) => { setStatut(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="SUSPENDU">Suspendu</option>
          <option value="EXPIRÉ">Expiré</option>
          <option value="RÉVOQUÉ">Révoqué</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun badge trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase">Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden md:table-cell">Matricule</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden lg:table-cell">Émission</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden lg:table-cell">Expiration</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {badges.map((badge) => {
                  const agent = getAgent(badge);
                  const photoUrl = getAgentPhotoUrl(badge);
                  return (
                    <tr key={badge._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                            {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : (
                              agent ? `${agent.prenom.charAt(0)}${agent.nom.charAt(0)}` : '?'
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {agent ? `${agent.prenom} ${agent.nom}` : 'Agent inconnu'}
                            </div>
                            <div className="text-xs text-gray-400">{agent?.fonction}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {agent && (
                          <Link to={`/agents/${typeof badge.agentId === 'string' ? badge.agentId : (badge.agentId as { _id: string })._id}`}
                            className="font-mono text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-2 py-1 rounded-lg transition-colors">
                            {agent.matricule}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge statut={badge.statut} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                        {formatDate(badge.dateEmission)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                        {formatDate(badge.dateExpiration)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDownload(badge)} title="PDF" className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          {badge.statut !== 'RÉVOQUÉ' && badge.statut !== 'SUSPENDU' && (
                            <button onClick={() => { setSuspendTarget(badge); setMotif(''); }} title="Suspendre" className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors">
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          )}
                          {badge.statut !== 'RÉVOQUÉ' && (
                            <button onClick={() => { setRevokeTarget(badge); setMotif(''); }} title="Révoquer" className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                              <ShieldX className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => { setRenewTarget(badge); setRenewDates({ dateEmission: toInputDate(new Date()), dateExpiration: '' }); }} title="Renouveler" className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} total={total} limit={15} onChange={setPage} />
      </div>

      <ConfirmModal isOpen={!!revokeTarget} onClose={() => setRevokeTarget(null)} onConfirm={handleRevoke}
        title="Révoquer le badge" message="Confirmer la révocation de ce badge ?" confirmLabel="Révoquer" variant="danger" loading={actionLoading}>
        <Select label="Motif *" value={motif} onChange={(e) => setMotif(e.target.value)}
          options={REVOKE_MOTIFS} placeholder="Sélectionner" required />
      </ConfirmModal>

      <Modal isOpen={!!suspendTarget} onClose={() => setSuspendTarget(null)} title="Suspendre le badge" size="sm">
        <div className="space-y-4">
          <Input label="Motif *" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif..." required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Annuler</Button>
            <Button variant="warning" onClick={handleSuspend} loading={actionLoading} disabled={!motif}>Suspendre</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!renewTarget} onClose={() => setRenewTarget(null)} title="Renouveler le badge" size="sm">
        <div className="space-y-4">
          <Input type="date" label="Date d'émission *" value={renewDates.dateEmission}
            onChange={(e) => setRenewDates({ ...renewDates, dateEmission: e.target.value })} required />
          <Input type="date" label="Date d'expiration *" value={renewDates.dateExpiration}
            onChange={(e) => setRenewDates({ ...renewDates, dateExpiration: e.target.value })} required />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRenewTarget(null)}>Annuler</Button>
            <Button onClick={handleRenew} loading={actionLoading} disabled={!renewDates.dateExpiration}>Renouveler</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
