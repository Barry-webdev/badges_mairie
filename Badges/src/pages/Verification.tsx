import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, AlertCircle, Loader2, User } from 'lucide-react';
import type { VerificationData } from '../types';
import { verifyService } from '../services/verify.service';
import { agentService } from '../services/agent.service';

const STATUT_CONFIG = {
  ACTIF: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    headerBg: 'bg-emerald-600',
    icon: <CheckCircle className="w-8 h-8 text-white" />,
    label: '🟢 BADGE AUTHENTIQUE',
    desc: 'Ce badge est valide et authentique.',
  },
  SUSPENDU: {
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    headerBg: 'bg-amber-500',
    icon: <AlertCircle className="w-8 h-8 text-white" />,
    label: '🟠 BADGE SUSPENDU',
    desc: 'Ce badge est temporairement suspendu.',
  },
  EXPIRÉ: {
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    headerBg: 'bg-orange-500',
    icon: <AlertCircle className="w-8 h-8 text-white" />,
    label: '🟠 BADGE EXPIRÉ',
    desc: 'Ce badge est arrivé à expiration.',
  },
  RÉVOQUÉ: {
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    headerBg: 'bg-red-600',
    icon: <XCircle className="w-8 h-8 text-white" />,
    label: '🔴 BADGE NON VALIDE',
    desc: 'Ce badge a été révoqué. Il n\'est plus valide.',
  },
};

// Page publique — accessible via /verification/:token (scan QR)
export const VerificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }
    verifyService.verify(token)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-500 rounded-2xl shadow-lg mb-3">
            <Shield className="w-7 h-7 text-blue-950" />
          </div>
          <h1 className="text-white font-bold text-xl">COMMUNE DE PITA</h1>
          <p className="text-blue-300 text-sm">Vérification de badge officiel</p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-700" />
            <p className="text-gray-500">Vérification en cours...</p>
          </div>
        )}

        {!loading && (error || !data?.found) && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gray-600 p-5 text-center">
              <XCircle className="w-8 h-8 text-white mx-auto mb-2" />
              <h2 className="text-white font-bold text-lg">Badge introuvable</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-4">
                Ce QR Code ne correspond à aucun badge enregistré dans notre système.
              </p>
              <p className="text-xs text-gray-400">
                Si vous pensez qu'il s'agit d'une erreur, contactez la Mairie de Pita.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && data?.found && data.statut && (() => {
          const cfg = STATUT_CONFIG[data.statut] || STATUT_CONFIG.RÉVOQUÉ;
          return (
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border ${cfg.bg}`}>
              {/* Status header */}
              <div className={`${cfg.headerBg} p-5 text-center`}>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-2">
                  {cfg.icon}
                </div>
                <h2 className="text-white font-bold text-lg">{cfg.label}</h2>
                <p className="text-white/80 text-sm">{cfg.desc}</p>
              </div>

              {/* Garde Communale header */}
              <div className="bg-blue-900 text-white text-center py-2 px-4">
                <div className="flex justify-center mb-1">
                  <div className="flex h-4 w-6 rounded overflow-hidden">
                    <div className="flex-1 bg-red-600" />
                    <div className="flex-1 bg-yellow-400" />
                    <div className="flex-1 bg-green-600" />
                  </div>
                </div>
                <div className="text-xs font-bold text-yellow-400">GARDE COMMUNALE DE PITA</div>
                <div className="text-xs text-blue-300">République de Guinée</div>
              </div>

              {/* Agent info */}
              {data.agent && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                      {data.statut !== 'RÉVOQUÉ' && data.agent.photo ? (
                        <img
                          src={agentService.getPhotoUrl(data.agent.photo)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {data.agent.prenom} {data.agent.nom}
                      </div>
                      <div className="text-sm text-gray-500">{data.agent.fonction}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Matricule</div>
                      <div className="font-mono font-bold text-gray-900">{data.agent.matricule}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Affectation</div>
                      <div className="font-medium text-gray-900">{data.agent.affectation}</div>
                    </div>
                    {data.badge && (
                      <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Validité</div>
                        <div className="font-medium text-gray-900">{data.badge.validite}</div>
                      </div>
                    )}
                    <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Statut</div>
                      <div className={`font-bold ${cfg.color}`}>{data.statut}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-5 pb-5 text-center">
                <p className="text-xs text-gray-400">
                  Vérification effectuée le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })()}

        <p className="text-center text-blue-300/50 text-xs mt-5">
          Mairie de Pita · Garde Communale · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

// Page de vérification manuelle (depuis le menu admin)
export const VerificationSearch = () => {
  const [token, setToken] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vérification de badge</h1>
        <p className="text-gray-500 text-sm mt-1">Entrez un token de QR Code pour vérifier un badge</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Entrez le token QR (ex: a1b2c3d4e5f6...)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && token && setSubmitted(true)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => token && setSubmitted(true)}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Vérifier
          </button>
        </div>

        {submitted && token && (
          <div className="mt-4">
            <Link
              to={`/verification/${token}`}
              target="_blank"
              className="text-sm text-blue-700 hover:underline"
            >
              Ouvrir la page de vérification →
            </Link>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
        <p className="text-sm text-blue-800 font-medium mb-1">Comment vérifier un badge ?</p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Scannez le QR Code présent sur le badge physique</li>
          <li>Vous serez redirigé vers la page de vérification publique</li>
          <li>Le statut du badge s'affichera en temps réel</li>
          <li>Un badge révoqué ou expiré sera clairement identifié</li>
        </ul>
      </div>
    </div>
  );
};
