'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Users, Truck, UserCheck, TrendingUp,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { DashboardData } from '@/types';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get('/admin/dashboard');
        setData(response.data.data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse-soft">
              <div className="h-4 w-20 bg-[hsl(var(--muted))] rounded mb-3" />
              <div className="h-8 w-16 bg-[hsl(var(--muted))] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: 'Total de Doações',
      value: data.metrics.totalDonations,
      icon: Package,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Usuários Ativos',
      value: data.metrics.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Entregas Realizadas',
      value: data.metrics.deliveredDonations,
      icon: Truck,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      trend: '+15%',
      trendUp: true,
    },
    {
      label: 'Voluntários Ativos',
      value: data.metrics.activeVolunteers,
      icon: UserCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      trend: '+5%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Visão geral do sistema Rede Solidária
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                metric.trendUp ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {metric.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.trend}
              </span>
            </div>
            <p className="text-3xl font-heading font-bold">{metric.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donations by status */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6">
          <h3 className="font-heading font-semibold mb-4">Status das Doações</h3>
          <div className="space-y-3">
            {data.donationsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <span className="font-semibold text-sm">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly chart placeholder */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6">
          <h3 className="font-heading font-semibold mb-4">Doações por Mês</h3>
          <div className="space-y-2">
            {data.donationsByMonth.map((item) => {
              const maxCount = Math.max(...data.donationsByMonth.map((m) => m.count), 1);
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] w-16">
                    {item.month}
                  </span>
                  <div className="flex-1 h-6 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6">
          <h3 className="font-heading font-semibold mb-4">Doações Recentes</h3>
          <div className="space-y-3">
            {data.recentDonations.slice(0, 6).map((donation: any) => (
              <div
                key={donation.id}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{donation.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    por {donation.donor?.name} • {formatDate(donation.createdAt)}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium ${getStatusColor(donation.status)}`}>
                  {getStatusLabel(donation.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
