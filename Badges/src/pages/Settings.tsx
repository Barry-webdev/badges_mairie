import { Settings as SettingsIcon, Shield, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-blue-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 text-sm">Configuration du système</p>
        </div>
      </div>

      {/* Profil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-700" />
          Votre profil
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Nom</label>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.nom}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Email</label>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Rôle</label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Responsable de la Garde'}
            </p>
          </div>
        </div>
      </div>

      {/* Infos système */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-700" />
          À propos du système
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Système</span>
            <span className="font-medium text-gray-900">GC PITA — Gestion des Badges</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Version</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Organisation</span>
            <span className="font-medium text-gray-900">Commune de Pita — Garde Communale</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Pays</span>
            <span className="font-medium text-gray-900">République de Guinée</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-sm text-blue-700">
        <p className="font-medium mb-1">Note administrative</p>
        <p>Pour toute modification du système, contacter l'administrateur principal. Les changements de mot de passe et la gestion des utilisateurs sont réservés au rôle ADMIN.</p>
      </div>
    </div>
  );
};
