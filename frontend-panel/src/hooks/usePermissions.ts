import { useAuth } from '../context/AuthContext';

export interface Permission {
  canViewDashboard: boolean;
  canViewVotaciones: boolean;
  canCreateVotaciones: boolean;
  canViewManhwas: boolean;
  canCreateManhwas: boolean;
  canViewAportes: boolean;
  canCreateAportes: boolean;
  canViewPedidos: boolean;
  canViewLogs: boolean;
  canViewGrupos: boolean;
  canManageGrupos: boolean;
  canViewUsuarios: boolean;
  canManageUsuarios: boolean;
  canViewQR: boolean;
  canManageBot: boolean;
}

const rolePermissions: Record<string, Permission> = {
  owner: {
    canViewDashboard: true,
    canViewVotaciones: true,
    canCreateVotaciones: true,
    canViewManhwas: true,
    canCreateManhwas: true,
    canViewAportes: true,
    canCreateAportes: true,
    canViewPedidos: true,
    canViewLogs: true,
    canViewGrupos: true,
    canManageGrupos: true,
    canViewUsuarios: true,
    canManageUsuarios: true,
    canViewQR: true,
    canManageBot: true,
  },
  admin: {
    canViewDashboard: true,
    canViewVotaciones: true,
    canCreateVotaciones: true,
    canViewManhwas: true,
    canCreateManhwas: true,
    canViewAportes: true,
    canCreateAportes: true,
    canViewPedidos: true,
    canViewLogs: true,
    canViewGrupos: true,
    canManageGrupos: true,
    canViewUsuarios: true,
    canManageUsuarios: false,
    canViewQR: true,
    canManageBot: false,
  },
  moderador: {
    canViewDashboard: true,
    canViewVotaciones: true,
    canCreateVotaciones: false,
    canViewManhwas: true,
    canCreateManhwas: false,
    canViewAportes: true,
    canCreateAportes: false,
    canViewPedidos: true,
    canViewLogs: true,
    canViewGrupos: true,
    canManageGrupos: false,
    canViewUsuarios: false,
    canManageUsuarios: false,
    canViewQR: false,
    canManageBot: false,
  },
  usuario: {
    canViewDashboard: true,
    canViewVotaciones: true,
    canCreateVotaciones: false,
    canViewManhwas: true,
    canCreateManhwas: false,
    canViewAportes: true,
    canCreateAportes: false,
    canViewPedidos: true,
    canViewLogs: false,
    canViewGrupos: false,
    canManageGrupos: false,
    canViewUsuarios: false,
    canManageUsuarios: false,
    canViewQR: false,
    canManageBot: false,
  },
};

export const usePermissions = (): Permission => {
  const { user } = useAuth();
  
  if (!user || !user.rol) {
    // Permisos por defecto para usuarios no autenticados
    return {
      canViewDashboard: false,
      canViewVotaciones: false,
      canCreateVotaciones: false,
      canViewManhwas: false,
      canCreateManhwas: false,
      canViewAportes: false,
      canCreateAportes: false,
      canViewPedidos: false,
      canViewLogs: false,
      canViewGrupos: false,
      canManageGrupos: false,
      canViewUsuarios: false,
      canManageUsuarios: false,
      canViewQR: false,
      canManageBot: false,
    };
  }

  return rolePermissions[user.rol] || rolePermissions.usuario;
};

export const hasPermission = (userRole: string, permission: keyof Permission): boolean => {
  const permissions = rolePermissions[userRole] || rolePermissions.usuario;
  return permissions[permission];
};
