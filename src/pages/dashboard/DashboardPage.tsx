import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn, formatCurrency } from '../../lib/utils/utils';
import { useAuthStore } from '../../store/authStore';
import {
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  BadgeCheck,
  Plus,
  ArrowLeftRight,
  FileText,
  BarChart3,
} from "lucide-react";

/**
 * 📊 Dashboard Page - MIolo (renderizado dentro do AppLayout via <Outlet />)
 */

export const DashboardPage: React.FC = () => {
  const { user, tenant } = useAuthStore();

  // Mock data - substituir por dados reais da API
  const stats = {
    balance: 15750.5,
    income: 8500.0,
    expenses: 4320.75,
    savings: 3429.75,
  };

  const recentTransactions = [
    { id: 1, description: 'Salário', category: 'Receita', amount: 8500, date: '2026-01-20', type: 'income' },
    { id: 2, description: 'Supermercado', category: 'Alimentação', amount: 350.5, date: '2026-01-19', type: 'expense' },
    { id: 3, description: 'Netflix', category: 'Entretenimento', amount: 59.9, date: '2026-01-18', type: 'expense' },
    { id: 4, description: 'Freelance', category: 'Receita', amount: 1200, date: '2026-01-17', type: 'income' },
  ] as const;

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance Card */}
        <Card variant="elevated" padding="md" className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Saldo Total</p>
              <p className="text-3xl font-bold text-neutral-900">{formatCurrency(stats.balance)}</p>
              <p className="text-sm text-success-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12.5% este mês
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Income Card */}
        <Card variant="elevated" padding="md" className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Receitas</p>
              <p className="text-3xl font-bold text-success-600">{formatCurrency(stats.income)}</p>
              <p className="text-sm text-neutral-500 mt-1">Este mês</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <ArrowUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>

        {/* Expenses Card */}
        <Card variant="elevated" padding="md" className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Despesas</p>
              <p className="text-3xl font-bold text-danger-600">{formatCurrency(stats.expenses)}</p>
              <p className="text-sm text-neutral-500 mt-1">Este mês</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center">
              <ArrowDown className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </Card>

        {/* Savings Card */}
        <Card variant="elevated" padding="md" className="hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Economia</p>
              <p className="text-3xl font-bold text-brand-primary-600">{formatCurrency(stats.savings)}</p>
              <p className="text-sm text-neutral-500 mt-1">Este mês</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-primary-100 flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-brand-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card variant="elevated" padding="md" className="hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transações Recentes</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mt-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          transaction.type === 'income' ? 'bg-success-100' : 'bg-danger-100'
                        )}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUp className="w-5 h-5 text-success-600" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-danger-600" />
                        )}
                      </div>

                      <div className="space-y-0">
                        <p
                      className={cn(
                        'font-bold text-lg',
                        transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
                      )}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                        <p className="font-semibold text-neutral-900">{transaction.description}</p>
                        <p className="text-sm text-neutral-500">
                          {transaction.category}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                    </div>

                    
                  </div>
                ))}
                <div className="text-right">
                  <Button variant="outline" size="sm">
                    Ver todas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
      
    </div>
  );
};

export default DashboardPage;
