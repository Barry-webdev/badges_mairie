import { useEffect, useState, useCallback } from 'react';
import { Loader2, History as HistoryIcon } from 'lucide-react';
import type { HistoryItem } from '../types';
import { historyService } from '../services/history.service';
import { Pagination } from '../components/ui/Pagination';
import { formatDateTime } from '../utils/format';

const ACTION_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  'AGENT_CRÉÉ': { label: 'Agent créé', color: 'text-blue-700 bg-blue-50', dot: 'bg-blue-500' },
  'AGENT_MODIFIÉ': { label: 'Agent modifié', color: 'text-indigo-700 bg-indigo-50', dot: 'bg-indigo-500' },
  'BADGE_GÉNÉRÉ': { label: 'Badge généré', color: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500' },
  'BADGE_RENOUVELÉ': { label: 'Badge renouvelé', color: 'text-teal-700 bg-teal-50', dot: 'bg-teal-500' },
  'BADGE_SUSPENDU': { label: 'Badge suspendu', color: 'text-amber-700 bg-amber-50', dot: 'bg-amber-500' },
  'BADGE_RÉACTIVÉ': { label: 'Badge réactivé', color: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500' },
  'BADGE_RÉVOQUÉ': { label: 'Badge révoqué', color: 'text-red-700 bg-red-50', dot: 'bg-red-500' },
};

export const History = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await historyService.getAll({ page, limit: 20, action: actionFilter || undefined });
      setItems(res.data || []);
      setPages(res.pages || 1);
      setTotal(res.total || 0);
    } catch {
      console.error('Erreur chargement historique');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [actionFilter]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} événement{total !== 1 ? 's' : ''} enregistré{total !== 1 ? 's' : ''}</p>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun événement trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Agent</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Matricule</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Statut</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Motif</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Effectué par</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => {
                    const cfg = ACTION_CONFIG[item.action] || { label: item.action, color: 'text-gray-700 bg-gray-50', dot: 'bg-gray-400' };
                    const agent = item.agentId;
                    const user = item.userId as unknown as { nom: string } | null;
                    return (
                      <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-900 font-medium">
                          {agent ? `${agent.prenom} ${agent.nom}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {agent?.matricule && (
                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {agent.matricule}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {item.ancienStatut && item.nouveauStatut ? (
                            <span className="text-xs text-gray-500">
                              {item.ancienStatut} → <span className="font-medium text-gray-700">{item.nouveauStatut}</span>
                            </span>
                          ) : item.nouveauStatut ? (
                            <span className="text-xs font-medium text-gray-700">{item.nouveauStatut}</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs hidden lg:table-cell">
                          {item.motif || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs hidden md:table-cell">
                          {user?.nom || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={total} limit={20} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};
