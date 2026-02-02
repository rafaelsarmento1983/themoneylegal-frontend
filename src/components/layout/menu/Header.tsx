import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../../store/authStore';
import { TenantSwitcher } from '../../tenant/TenantSwitcher';
import {
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Input } from '../../components/ui/Input';


/**
 * 📱 Header Component - VERSÃO FUNCIONAL
 * Com logout funcional e tenant switcher integrado à API real
 */

interface HeaderProps {
  sidebarCollapsed?: boolean;
  onMenuToggle?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed = false,
  onMenuToggle,
  showSearch = true,
  onSearch,
  className,
}) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLogout = () => {
    // Limpar autenticação
    clearAuth();
    // Navegar para login
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-20 bg-white border-b border-neutral-200 z-[1100]',
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:left-20 left-0' : 'lg:left-64 left-0',
        className
      )}
    >


      <div className="h-full px-6 flex bg-gradient-to-br from-[var(--color-secondary-blue-90)] to-[var(--color-primary-blue-100)] text-white items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          
          {/* Tenant Switcher - Componente integrado com API */}
          <TenantSwitcher />

          {/* Search Bar */}
          {/* {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative pr-4 py-2 mt-6">
                <Input
                  type="text"
                  placeholder="Buscar transações, contas, categorias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  customRounded="rounded-xl"
                  customBorder="!border-0"
                  customBg="bg-white/20 hover:bg-white/30 transition-colors min-w-[240px]"
                  customTextColor="!text-white !font-light !text-sm tracking-wide placeholder:!text-white"
                  leftIcon={<Search className="w-5 h-5" strokeWidth={2} />}
                  leftIconClassName="text-white"
                />
              </div>
            </form>
          )}*/}
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {/*<button
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Toggle theme"
          >
            <Moon className="w-5 h-5" />
          </button>*/}

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Notificações"
          >
              <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/20 hover:bg-white/40 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary-100 to-brand-secondary-100 flex items-center justify-center text-white font-semibold text-xl">
                  {user?.name
  ?.split(' ')
  .filter(Boolean)
  .map((n) => n[0])
  .slice(0, 2)
  .join('')
  .toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-white">
                  {user?.name || 'Usuário'}
                </div>
                <div className="text-xs text-white/80">
                  {user?.email || 'usuario@email.com'}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  showProfileMenu && 'rotate-180'
                )}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 z-20 animate-scale-in">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </button>
                  <div className="my-1 border-t border-neutral-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
