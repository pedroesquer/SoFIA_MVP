import React, { useState } from 'react';
import { User } from '../types';
import { 
  ShieldAlert, 
  Users, 
  MapPin, 
  Plus, 
  TrendingUp, 
  Activity, 
  ArrowUpRight,
  UserCheck,
  Building,
  Key,
  Shield
} from 'lucide-react';

interface CenterAdminProps {
  currentUser: User;
}

export default function CenterAdmin({ currentUser }: CenterAdminProps) {
  // Mock users
  const [team, setTeam] = useState<{ name: string; email: string; role: User['role']; sede: string; activeFiles: number }[]>([
    { name: 'Pedro Garza', email: 'pedro.garza@credidiez.mx', role: 'Superadministrador', sede: 'Corporativo San Pedro', activeFiles: 14 },
    { name: 'Sofía Martínez', email: 'sofia.martinez@credidiez.mx', role: 'Administrador de Centro', sede: 'Sede Monterrey Centro', activeFiles: 28 },
    { name: 'Carlos Mendoza', email: 'carlos.mendoza@credidiez.mx', role: 'Asesor Senior', sede: 'Sede Monterrey Centro', activeFiles: 8 },
    { name: 'Daniela Treviño', email: 'daniela.t@credidiez.mx', role: 'Asesor', sede: 'Sede Monterrey Centro', activeFiles: 5 },
    { name: 'Andrés Sada', email: 'andres.sada@credidiez.mx', role: 'Asesor', sede: 'Sede Monterrey Centro', activeFiles: 3 },
    { name: 'Clara Guerra', email: 'clara.g@credidiez.mx', role: 'Asesor', sede: 'Sede Monterrey Centro', activeFiles: 1 }
  ]);

  // Mock offices / sedes
  const [sedes, setSedes] = useState([
    { id: '1', name: 'Sede Monterrey Centro', address: 'Av. Constitución 405, Centro, MTY', brokersCount: 5, activeFilesCount: 45, goalAchievement: 92 },
    { id: '2', name: 'Sede San Pedro Garza García', address: 'Av. Lázaro Cárdenas 1000, SPGG', brokersCount: 4, activeFilesCount: 32, goalAchievement: 104 },
    { id: '3', name: 'Sede Guadalupe', address: 'Av. Miguel Alemán 300, Gpe', brokersCount: 2, activeFilesCount: 12, goalAchievement: 78 }
  ]);

  const [sysLogs, setSysLogs] = useState([
    { id: 'log-101', user: 'carlos.mendoza@credidiez.mx', action: 'Acceso corporativo exitoso.', ip: '189.155.24.81', timestamp: '2026-07-10T08:12:00Z' },
    { id: 'log-102', user: 'sofia.martinez@credidiez.mx', action: 'Aprobó documento "Estados de cuenta" de cliente "Lorena Garza".', ip: '189.155.30.95', timestamp: '2026-07-10T09:44:00Z' },
    { id: 'log-103', user: 'pedro.garza@credidiez.mx', action: 'Actualizó catálogo de tasas Scotiabank.', ip: '189.160.10.12', timestamp: '2026-07-10T10:15:00Z' },
    { id: 'log-104', user: 'andres.sada@credidiez.mx', action: 'Inició análisis de riesgo para prospecto externo.', ip: '201.122.90.11', timestamp: '2026-07-10T11:05:00Z' }
  ]);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('Asesor');
  const [newUserSede, setNewUserSede] = useState('Sede Monterrey Centro');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const newUser = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      sede: newUserSede,
      activeFiles: 0
    };

    setTeam([...team, newUser]);
    
    setSysLogs([
      {
        id: `log-${Date.now()}`,
        user: currentUser.email,
        action: `Creó usuario corporativo: ${newUserEmail} con rol ${newUserRole}.`,
        ip: '127.0.0.1',
        timestamp: new Date().toISOString()
      },
      ...sysLogs
    ]);

    setNewUserEmail('');
    setNewUserName('');
    alert('Usuario corporativo registrado exitosamente en la base de CREDIDIEZ.');
  };

  const handleUpdateRole = (email: string, role: User['role']) => {
    setTeam(team.map(u => u.email === email ? { ...u, role } : u));
    
    setSysLogs([
      {
        id: `log-${Date.now()}`,
        user: currentUser.email,
        action: `Actualizó rol de ${email} a ${role}.`,
        ip: '127.0.0.1',
        timestamp: new Date().toISOString()
      },
      ...sysLogs
    ]);

    alert('Rol de usuario actualizado.');
  };

  if (currentUser.role !== 'Superadministrador') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-900">Privilegios Insuficientes</h3>
        <p className="text-xs text-rose-700 leading-relaxed">
          Este panel ejecutivo está reservado estrictamente para el Superadministrador Corporativo de CREDIDIEZ. Tu rol actual es <strong>{currentUser.role}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="center-admin-view">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sedes Activas</span>
            <Building className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">3 Oficinas</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Monterrey Centro, Guadalupe, San Pedro</p>
        </div>

        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asesores Certificados</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{team.filter(u => u.role !== 'Superadministrador').length} Integrantes</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">94% de efectividad de expedientes</p>
        </div>

        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumplimiento de Meta Mensual</span>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">91.3% Promedio</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Meta global: $250M MXN colocados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Team roster & Role editing */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Plantilla de Asesores y Asignación de Roles</h4>
            <div className="overflow-x-auto border border-slate-150 rounded-lg">
              <table className="w-full text-xs text-left text-slate-600 font-medium">
                <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Asesor / Correo</th>
                    <th className="px-4 py-3">Oficina Sede</th>
                    <th className="px-4 py-3">Rol Corporativo</th>
                    <th className="px-4 py-3">Casos</th>
                    <th className="px-4 py-3 text-right">Rol Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {team.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <span className="text-[10px] text-slate-400 block">{user.email}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{user.sede}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          user.role === 'Superadministrador' ? 'bg-slate-950 text-white border-slate-900' :
                          user.role === 'Administrador de Centro' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          user.role === 'Asesor Senior' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-bold">{user.activeFiles}</td>
                      <td className="px-4 py-3 text-right">
                        {user.email !== currentUser.email && (
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.email, e.target.value as any)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-emerald-500 text-[10px] font-bold px-2.5 py-1.5 rounded cursor-pointer"
                          >
                            <option value="Asesor">Asesor</option>
                            <option value="Asesor Senior">Asesor Senior</option>
                            <option value="Administrador de Centro">Administrador de Centro</option>
                            <option value="Superadministrador">Superadministrador</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* List of offices / Sedes details */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Métricas de Rendimiento por Sede Regional</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sedes.map((sede) => (
                <div key={sede.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <h5 className="text-xs font-bold text-slate-800">{sede.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal truncate">{sede.address}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[10px] font-semibold text-slate-500">
                    <div>
                      <p>Brokers:</p>
                      <p className="text-slate-800 font-bold text-xs">{sede.brokersCount}</p>
                    </div>
                    <div>
                      <p>Expedientes:</p>
                      <p className="text-slate-800 font-bold text-xs">{sede.activeFilesCount}</p>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <div className="flex justify-between items-center mb-1 text-[9px] font-bold">
                      <span className="text-slate-400">LOGRO META:</span>
                      <span className={sede.goalAchievement >= 100 ? 'text-emerald-600' : 'text-amber-600'}>{sede.goalAchievement}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${sede.goalAchievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(sede.goalAchievement, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create corporate user & System logs */}
        <div className="space-y-6">
          {/* Creation form */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-4.5 w-4.5 text-slate-400" />
              Alta de Usuario Corporativo
            </h4>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ej. Andrés Martínez"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email CREDIDIEZ (@credidiez.mx)</label>
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Ej. andres.m@credidiez.mx"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rol de Acceso</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="Asesor">Asesor</option>
                  <option value="Asesor Senior">Asesor Senior</option>
                  <option value="Administrador de Centro">Administrador de Centro</option>
                  <option value="Superadministrador">Superadministrador</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                Registrar Asesor
              </button>
            </form>
          </div>

          {/* System Security Audit Logs */}
          <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-slate-400" />
              Auditoría de Seguridad y Accesos
            </h4>

            <div className="space-y-3.5">
              {sysLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-700 truncate max-w-[150px]">{log.user}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1 leading-normal font-medium">{log.action}</p>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">IP de Conexión: {log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
