import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  CalendarClock,
  FileText,
  CreditCard,
  Wallet,
  Receipt,
  Landmark,
  TrendingUp,
  ShieldCheck,
  CheckSquare,
  BarChart3,
  Target,
  FolderKanban,
  UserCheck,
  HeartPulse,
  FileBarChart,
  Sparkles,
  GraduationCap,
  Brain,
  Users,
  Tags,
  KeyRound,
  Star,
  Building2,
  Shield,
  Ticket,
  CreditCard as SubscriptionIcon,
  PlugZap,
} from 'lucide-react';

/**
 * ✅ Ordem e nomes oficiais dos grupos (fonte única de verdade)
 */
export const GROUP_ORDER = [
  'PRINCIPAL',
  'FINANÇAS',
  'PLANEJAMENTO',
  'ANÁLISES',
  'GERENCIAMENTO',
  'ADMINISTRAÇÃO',
] as const;

/**
 * ✅ Tipo derivado automaticamente da constante acima
 */
export type MenuGroup = (typeof GROUP_ORDER)[number];

/**
 * ✅ Tipo base compartilhado por Sidebar + MobileMenuGrid + AppLayout
 */
export type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
  active?: boolean; // opcional (o AppLayout costuma setar)
  children?: MenuItem[];

  group?: MenuGroup; // ✅ agora padronizado
  order?: number;
};

/**
 * ✅ Lista oficial de itens do menu (fonte única)
 * Ajuste aqui e reflete em Sidebar + MobileMenuGrid + BottomNav (se quiser)
 */
export const MENU_ITEMS: MenuItem[] = [
  /* ======================== PRINCIPAL ======================== */
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-6 h-6" />,
    group: 'PRINCIPAL',
    order: 1,
  },
  {
    id: 'transactions',
    label: 'Lançamentos',
    href: '/transactions',
    icon: <ArrowUpDown className="w-6 h-6" />,
    group: 'PRINCIPAL',
    order: 2,
  },
  {
    id: 'schedule',
    label: 'Cronograma',
    href: '/accounts',
    icon: <CalendarClock className="w-6 h-6" />,
    group: 'PRINCIPAL',
    order: 3,
  },

  /* ======================== FINANÇAS ========================= */
  {
    id: 'documents',
    label: 'Documentos',
    href: '/documents',
    icon: <FileText className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 1,
  },
  {
    id: 'accounts',
    label: 'Contas',
    href: '/accounts',
    icon: <Wallet className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 2,
  },
  {
    id: 'cards',
    label: 'Cartões',
    href: '/cards',
    icon: <CreditCard className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 3,
  },
  {
    id: 'invoices',
    label: 'Faturas',
    href: '/invoices',
    icon: <Receipt className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 4,
  },
  {
    id: 'debts',
    label: 'Dívidas',
    href: '/debts',
    icon: <Landmark className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 5,
  },
  {
    id: 'investments',
    label: 'Investimentos',
    href: '/investments',
    icon: <TrendingUp className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 6,
  },
  {
    id: 'open-finance',
    label: 'Open Finance',
    href: '/open-finance',
    icon: <ShieldCheck className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 7,
  },
  {
    id: 'approvals',
    label: 'Aprovações',
    href: '/approvals',
    icon: <CheckSquare className="w-6 h-6" />,
    group: 'FINANÇAS',
    order: 8,
  },

  /* ====================== PLANEJAMENTO ======================= */
  {
    id: 'budget',
    label: 'Orçamento',
    href: '/budget',
    icon: <BarChart3 className="w-6 h-6" />,
    group: 'PLANEJAMENTO',
    order: 1,
  },
  {
    id: 'goals',
    label: 'Metas',
    href: '/goals',
    icon: <Target className="w-6 h-6" />,
    group: 'PLANEJAMENTO',
    order: 2,
  },
  {
    id: 'projects',
    label: 'Projetos',
    href: '/projects',
    icon: <FolderKanban className="w-6 h-6" />,
    group: 'PLANEJAMENTO',
    order: 3,
  },
  {
    id: 'investor-profile',
    label: 'Perfil de Investidor',
    href: '/investor-profile',
    icon: <UserCheck className="w-6 h-6" />,
    group: 'PLANEJAMENTO',
    order: 4,
  },
  {
    id: 'financial-health',
    label: 'Saúde Financeira',
    href: '/financial-health',
    icon: <HeartPulse className="w-6 h-6" />,
    group: 'PLANEJAMENTO',
    order: 5,
  },

  /* ======================== ANÁLISES ========================= */
  {
    id: 'reports',
    label: 'Relatórios',
    href: '/reports',
    icon: <FileBarChart className="w-6 h-6" />,
    group: 'ANÁLISES',
    order: 1,
  },
  {
    id: 'ai-reports',
    label: 'Relatórios com IA',
    href: '/reports-ai',
    icon: <Sparkles className="w-6 h-6" />,
    group: 'ANÁLISES',
    order: 2,
  },
  {
    id: 'education',
    label: 'Educação',
    href: '/education',
    icon: <GraduationCap className="w-6 h-6" />,
    group: 'ANÁLISES',
    order: 3,
  },
  {
    id: 'financial-coach',
    label: 'Coach Financeiro',
    href: '/coach',
    icon: <Brain className="w-6 h-6" />,
    group: 'ANÁLISES',
    order: 4,
  },

  /* ===================== GERENCIAMENTO ======================= */
  {
    id: 'users',
    label: 'Usuários',
    href: '/users',
    icon: <Users className="w-6 h-6" />,
    group: 'GERENCIAMENTO',
    order: 1,
  },
  {
    id: 'categories',
    label: 'Categorias',
    href: '/categories',
    icon: <Tags className="w-6 h-6" />,
    group: 'GERENCIAMENTO',
    order: 2,
  },
  {
    id: 'access-requests',
    label: 'Pedidos de Acesso',
    href: '/access-requests',
    icon: <KeyRound className="w-6 h-6" />,
    group: 'GERENCIAMENTO',
    order: 3,
  },
  {
    id: 'reviews',
    label: 'Avaliações',
    href: '/reviews',
    icon: <Star className="w-6 h-6" />,
    group: 'GERENCIAMENTO',
    order: 4,
  },
  {
    id: 'tenant-config',
    label: 'Config. Tenant',
    href: '/tenant-config',
    icon: <Building2 className="w-6 h-6" />,
    group: 'GERENCIAMENTO',
    order: 5,
  },

  /* ==================== ADMINISTRAÇÃO ======================== */
  {
    id: 'admin-panel',
    label: 'Painel Admin',
    href: '/admin',
    icon: <Shield className="w-6 h-6" />,
    group: 'ADMINISTRAÇÃO',
    order: 1,
  },
  {
    id: 'coupons',
    label: 'Gestão de Cupons',
    href: '/admin/coupons',
    icon: <Ticket className="w-6 h-6" />,
    group: 'ADMINISTRAÇÃO',
    order: 2,
  },
  {
    id: 'subscriptions',
    label: 'Assinaturas',
    href: '/admin/subscriptions',
    icon: <SubscriptionIcon className="w-6 h-6" />,
    group: 'ADMINISTRAÇÃO',
    order: 3,
  },
  {
    id: 'pluggy-test',
    label: 'Pluggy Test',
    href: '/admin/pluggy-test',
    icon: <PlugZap className="w-6 h-6" />,
    group: 'ADMINISTRAÇÃO',
    order: 4,
  },
];
