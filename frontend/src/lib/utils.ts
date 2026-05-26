import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    RESERVED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    IN_TRANSIT: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    DELIVERED: 'bg-green-500/15 text-green-600 dark:text-green-400',
    CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
    PENDING: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
    ACCEPTED: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  };
  return colors[status] || 'bg-gray-500/15 text-gray-600';
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponível',
    RESERVED: 'Reservada',
    IN_TRANSIT: 'Em Transporte',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelada',
    PENDING: 'Pendente',
    ACCEPTED: 'Aceita',
  };
  return labels[status] || status;
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    DONOR: 'Doador',
    VOLUNTEER: 'Voluntário',
    RECEIVER: 'Recebedor',
  };
  return labels[role] || role;
}

export function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    DONOR: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    VOLUNTEER: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    RECEIVER: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  };
  return colors[role] || 'bg-gray-500/15 text-gray-600';
}
