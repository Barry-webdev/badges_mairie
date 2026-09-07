import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShieldCheck, ShieldOff, ShieldX, Clock, TrendingUp,
  AlertCircle, ArrowRight, UserPlus,
} from 'lucide-react';
import type { DashboardStats } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { StatusBadge } from '../components/ui/Badge';
import { formatDate } from '../utils/format';

const StatCard = ({
  label, value, icon, color, trend,
}: { label: string; value: number; icon: React.ReactNode; color: string; trend?: string }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      {trend && (
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />{trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  const s = stats?.stats;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Garde Communale de Pita — Vue d'ensemble</p>
        </div>
        <Link
          to="/agents/new"
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white
            px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Nouvel agent
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total agents"
          value={s?.totalAgents || 0}
          icon={<Users className="w-5 h-5 text-blue-700" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Badges actifs"
          value={s?.badgesActifs || 0}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-700" />}
          color="bg-emerald-50"
        />
        <StatCard
          label="Badges suspendus"
          value={s?.badgesSuspendus || 0}
          icon={<ShieldOff className="w-5 h-5 text-amber-700" />}
          color="bg-amber-50"
        />
        <StatCard
          label="Badges expirés"
          value={s?.badgesExpires || 0}
          icon={<Clock className="w-5 h-5 text-orange-700" />}
          color="bg-orange-50"
        />
        <StatCard
          label="Badges révoqués"
          value={s?.badgesRevoques || 0}
          icon={<ShieldX className="w-5 h-5 text-red-700" />}
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers agents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Derniers agents enregistrés</h2>
            <Link to="/agents" className="text-sm text-blue-700 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.derniersAgents.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Aucun agent enregistré</p>
            )}
            {stats?.derniersAgents.map((agent) => (
              <Link
                key={agent._id}
                to={`/agents/${agent._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {agent.prenom} {agent.nom}
                  </div>
                  <div className="text-xs text-gray-400">{agent.matricule} · {agent.fonction}</div>
                </div>
                <div className="text-xs text-gray-400">{formatDate(agent.createdAt)}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Badges expirant bientôt */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Badges expirant bientôt</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">30 jours</span>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.badgesExpirantBientot.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Aucun badge à renouveler prochainement</p>
            )}
            {stats?.badgesExpirantBientot.map((badge) => {
              const agent = typeof badge.agentId === 'object' ? badge.agentId : null;
              return (
                <div key={badge._id} className="flex items-center gap-3 px-5 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {agent ? `${agent.prenom} ${agent.nom}` : 'Agent inconnu'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Expire le {formatDate(badge.dateExpiration)}
                    </div>
                  </div>
                  <StatusBadge statut={badge.statut} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Activité récente</h2>
          <Link to="/history" className="text-sm text-blue-700 hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {stats?.activiteRecente.length === 0 && (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">Aucune activité récente</p>
          )}
          {stats?.activiteRecente.map((item) => (
            <div key={item._id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-900">
                  <span className="font-medium">{item.action.replace('_', ' ')}</span>
                  {item.agentId && ` — ${item.agentId.prenom} ${item.agentId.nom}`}
                </span>
                {item.userId && (
                  <span className="text-xs text-gray-400"> par {(item.userId as unknown as { nom: string }).nom}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">{formatDate(item.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
