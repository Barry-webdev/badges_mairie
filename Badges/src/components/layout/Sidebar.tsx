import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Shield, ShieldCheck, ShieldOff,
  ShieldX, Search, BarChart3, History, Settings, LogOut,
  ChevronDown, ChevronRight, Menu, X, CreditCard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  label: string;
  to?: string;
  icon: React.ReactNode;
  children?: { label: string; to: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  {
    label: 'Agents',
    icon: <Users className="w-5 h-5" />,
    children: [
      { label: 'Tous les agents', to: '/agents', icon: <Users className="w-4 h-4" /> },
      { label: 'Ajouter un agent', to: '/agents/new', icon: <UserPlus className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Badges',
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { label: 'Badges actifs', to: '/badges?statut=ACTIF', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Badges expirés', to: '/badges?statut=EXPIRÉ', icon: <Shield className="w-4 h-4" /> },
      { label: 'Badges suspendus', to: '/badges?statut=SUSPENDU', icon: <ShieldOff className="w-4 h-4" /> },
      { label: 'Badges révoqués', to: '/badges?statut=RÉVOQUÉ', icon: <ShieldX className="w-4 h-4" /> },
    ],
  },
  { label: 'Vérification', to: '/verification', icon: <Search className="w-5 h-5" /> },
  { label: 'Statistiques', to: '/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Historique', to: '/history', icon: <History className="w-5 h-5" /> },
  { label: 'Paramètres', to: '/settings', icon: <Settings className="w-5 h-5" /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Agents', 'Badges']);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isGroupActive = (item: NavItem) =>
    item.children?.some((child) => location.pathname.startsWith(child.to.split('?')[0]));

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 bg-gradient-to-b from-blue-950 to-blue-900 
          text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center shadow">
              <Shield className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">GC PITA</div>
              <div className="text-xs text-blue-300">Gestion des Badges</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-blue-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              if (item.to) {
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                        ${isActive
                          ? 'bg-yellow-500 text-blue-950 shadow-md'
                          : 'text-blue-100 hover:bg-blue-800/60'
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  </li>
                );
              }

              const expanded = expandedGroups.includes(item.label);
              const active = isGroupActive(item);

              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium 
                      transition-all duration-150 text-blue-100 hover:bg-blue-800/60
                      ${active ? 'bg-blue-800/60' : ''}`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {expanded ? <ChevronDown className="w-4 h-4 opacity-60" /> : <ChevronRight className="w-4 h-4 opacity-60" />}
                  </button>

                  {expanded && item.children && (
                    <ul className="mt-1 ml-4 pl-3 border-l border-blue-700/40 space-y-0.5">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150
                              ${isActive
                                ? 'bg-yellow-500/20 text-yellow-300 font-medium'
                                : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                              }`
                            }
                          >
                            {child.icon}
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profil + Déconnexion */}
        <div className="p-4 border-t border-blue-800/50 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-blue-950 font-bold text-sm">
                {user.nom.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.nom}</div>
                <div className="text-xs text-blue-300">{user.role === 'ADMIN' ? 'Administrateur' : 'Resp. Garde'}</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-colors duration-150"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export const MobileHeader = ({ onOpen }: { onOpen: () => void }) => (
  <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
    <button onClick={onOpen} className="p-2 hover:bg-gray-100 rounded-lg">
      <Menu className="w-5 h-5" />
    </button>
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
        <Shield className="w-4 h-4 text-yellow-400" />
      </div>
      <span className="font-bold text-blue-900">GC PITA</span>
    </div>
  </header>
);
