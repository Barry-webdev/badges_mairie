import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, ShieldCheck, ShieldOff, ShieldX, Clock } from 'lucide-react';
import type { DashboardStats } from '../types';
import { dashboardService } from '../services/dashboard.service';

const StatBlock = ({ label, value, icon, colorClass }: {
  label: string; value: number; icon: React.ReactNode; colorClass: string;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClass}`}>{icon}</div>
    <div className="text-4xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

export const Stats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full" />
    </div>
  );

  const s = stats?.stats;
  const totalBadges = (s?.badgesActifs || 0) + (s?.badgesSuspendus || 0) + (s?.badgesExpires || 0) + (s?.badgesRevoques || 0);
  const tauxValidite = totalBadges > 0 ? Math.round(((s?.badgesActifs || 0) / totalBadges) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-500 text-sm">Vue d'ensemble du système</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatBlock label="Total agents" value={s?.totalAgents || 0}
          icon={<Users className="w-6 h-6 text-blue-700" />} colorClass="bg-blue-50" />
        <StatBlock label="Badges actifs" value={s?.badgesActifs || 0}
          icon={<ShieldCheck className="w-6 h-6 text-emerald-700" />} colorClass="bg-emerald-50" />
        <StatBlock label="Badges suspendus" value={s?.badgesSuspendus || 0}
          icon={<ShieldOff className="w-6 h-6 text-amber-700" />} colorClass="bg-amber-50" />
        <StatBlock label="Badges expirés" value={s?.badgesExpires || 0}
          icon={<Clock className="w-6 h-6 text-orange-700" />} colorClass="bg-orange-50" />
        <StatBlock label="Badges révoqués" value={s?.badgesRevoques || 0}
          icon={<ShieldX className="w-6 h-6 text-red-700" />} colorClass="bg-red-50" />
        <StatBlock label="Total badges" value={totalBadges}
          icon={<TrendingUp className="w-6 h-6 text-purple-700" />} colorClass="bg-purple-50" />
      </div>

      {/* Taux de validité */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Taux de validité des badges</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${tauxValidite}%` }}
              />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{tauxValidite}%</div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {s?.badgesActifs || 0} badges actifs sur {totalBadges} au total
        </p>
      </div>

      {/* Répartition */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Répartition des badges</h2>
        <div className="space-y-3">
          {[
            { label: 'Actifs', value: s?.badgesActifs || 0, color: 'bg-emerald-500' },
            { label: 'Suspendus', value: s?.badgesSuspendus || 0, color: 'bg-amber-500' },
            { label: 'Expirés', value: s?.badgesExpires || 0, color: 'bg-orange-500' },
            { label: 'Révoqués', value: s?.badgesRevoques || 0, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
              <div className="flex-1 text-sm text-gray-700">{item.label}</div>
              <div className="text-sm font-medium text-gray-900 w-8 text-right">{item.value}</div>
              <div className="w-32">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 ${item.color} rounded-full`}
                    style={{ width: totalBadges > 0 ? `${Math.round((item.value / totalBadges) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-400 w-8 text-right">
                {totalBadges > 0 ? Math.round((item.value / totalBadges) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
