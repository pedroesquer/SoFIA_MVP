import React, { useState } from 'react';
import { MortgageFile, User, BankRate } from '../types';
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle, 
  ChevronRight,
  Clock,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  files: MortgageFile[];
  rates: BankRate[];
  onSelectFile: (fileId: string) => void;
  onNavigate: (module: number) => void;
  onStartGuidedFlow: (fileId: string) => void;
}

export default function Dashboard({ 
  currentUser, 
  files, 
  rates, 
  onSelectFile, 
  onNavigate,
  onStartGuidedFlow
}: DashboardProps) {
  // Filter files based on user permissions
  const visibleFiles = files.filter(f => {
    if (currentUser.role === 'Superadministrador') return true;
    if (currentUser.role === 'Administrador de Centro') return f.sede === currentUser.sede;
    return f.broker === currentUser.email; // Asesor or Asesor Senior sees only their clients
  });

  // Calculate operational metrics
  const closedCredits = visibleFiles.filter(f => f.stage === 'Aprobado');
  const inProgressCredits = visibleFiles.filter(f => ['En análisis', 'Docs integrados', 'Enviado a banco'].includes(f.stage));
  const activeProspects = visibleFiles.filter(f => f.stage === 'Prospecto');
  
  const totalClosedAmount = closedCredits.reduce((sum, f) => sum + f.requestedAmount, 0);
  const totalInProgressAmount = inProgressCredits.reduce((sum, f) => sum + f.requestedAmount, 0);
  
  // Commission estimate: roughly 1% of closed/approved credits and 0.5% weighting of pipeline
  const estCommission = Math.round((totalClosedAmount * 0.012) + (totalInProgressAmount * 0.003));

  const pendingDocsCount = visibleFiles.reduce((sum, f) => {
    const pending = f.documents.filter(d => d.status === 'Pendiente' || d.status === 'Requiere actualización').length;
    return sum + (pending > 0 ? 1 : 0);
  }, 0);

  // Average interest rate of currently validated banks
  const validRates = rates.filter(r => r.status === 'Actualizado' || r.status === 'Validado internamente');
  const avgRate = validRates.reduce((sum, r) => sum + r.interestRate, 0) / (validRates.length || 1);

  // Solicitudes listas para enviar: files with docs integrated and buro signed
  const readyToSend = visibleFiles.filter(f => f.stage === 'Docs integrados' && f.buro.authStatus === 'Autorización firmada');
  const urgentFollowUps = visibleFiles.filter(f => f.priority === 'Alta' && f.stage !== 'Aprobado');

  // Interactive task list
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Validar estados de cuenta de Sofía Ramos', type: 'doc', status: 'pending', deadline: 'Hoy' },
    { id: 't2', title: 'Confirmar actualización de tasa Afirme', type: 'rate', status: 'pending', deadline: 'Hoy' },
    { id: 't3', title: 'Enviar solicitud de firma remota de Buró a Sofía Ramos', type: 'buro', status: 'pending', deadline: 'Mañana' },
    { id: 't4', title: 'Llenar portal Banorte para expediente Alejandro Garza', type: 'envio', status: 'pending', deadline: '12 Jul' },
    { id: 't5', title: 'Compartir reporte comercial con Alejandro Garza', type: 'reporte', status: 'completed', deadline: 'Completado' }
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  // Pipeline distribution for beautiful responsive custom visual charts
  const stages: { label: string; count: number; color: string; bg: string }[] = [
    { label: 'Prospecto', count: visibleFiles.filter(f => f.stage === 'Prospecto').length, color: 'text-slate-400', bg: 'bg-slate-100' },
    { label: 'En análisis', count: visibleFiles.filter(f => f.stage === 'En análisis').length, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'Docs integrados', count: visibleFiles.filter(f => f.stage === 'Docs integrados').length, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { label: 'Enviado a banco', count: visibleFiles.filter(f => f.stage === 'Enviado a banco').length, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: 'Aprobado', count: visibleFiles.filter(f => f.stage === 'Aprobado').length, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { label: 'Rechazado', count: visibleFiles.filter(f => f.stage === 'Rechazado').length, color: 'text-rose-500', bg: 'bg-rose-100' }
  ];

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {currentUser.role}
          </span>
          <h1 className="text-2xl font-semibold text-slate-800 mt-2 tracking-tight">
            Bienvenido, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentUser.role === 'Superadministrador' 
              ? 'Panel Nacional CREDIDIEZ · Monitoreo y control central' 
              : `Sede: ${currentUser.sede} · Supervisando ${visibleFiles.length} expedientes activos.`}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => onNavigate(6)} // CRM module
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Ver CRM Completo
          </button>
          <button 
            onClick={() => onNavigate(3)} // Profile analyzer
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Zap className="h-4 w-4" />
            Nuevo Diagnóstico
          </button>
        </div>
      </div>

      {/* Grid de Métricas Operativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metrica 1 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Créditos Cerrados (Aprobados)</p>
              <h3 className="text-xl font-semibold text-slate-800">${(totalClosedAmount / 1000000).toFixed(1)}M MXN</h3>
              <p className="text-xs text-slate-500">{closedCredits.length} expedientes formalizados</p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Metrica 2 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pipeline en Proceso</p>
              <h3 className="text-xl font-semibold text-slate-800">${(totalInProgressAmount / 1000000).toFixed(1)}M MXN</h3>
              <p className="text-xs text-slate-500">{inProgressCredits.length} expedientes en trámite</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Metrica 3 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tasa Promedio Actual</p>
              <h3 className="text-xl font-semibold text-slate-800">{avgRate.toFixed(2)}%</h3>
              <p className="text-xs text-slate-500">Bancos de biblioteca CREDIDIEZ</p>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Metrica 4 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:border-slate-200 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Comisión Estimada (Cartera)</p>
              <h3 className="text-xl font-semibold text-slate-800">${estCommission.toLocaleString('es-MX')} MXN</h3>
              <p className="text-xs text-slate-500">Comisión promedio 1.2%</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Segundo Bloque de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-10 bg-amber-500 rounded-full" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Prospectos Activos</p>
            <p className="text-lg font-bold text-slate-700">{activeProspects.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-10 bg-indigo-500 rounded-full" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Docs Pendientes</p>
            <p className="text-lg font-bold text-slate-700">{pendingDocsCount} clientes</p>
          </div>
        </div>
        <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-10 bg-emerald-500 rounded-full" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Listos para Banco</p>
            <p className="text-lg font-bold text-slate-700">{readyToSend.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-10 bg-rose-500 rounded-full" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Seguimiento Urgente</p>
            <p className="text-lg font-bold text-slate-700">{urgentFollowUps.length}</p>
          </div>
        </div>
      </div>

      {/* Gráficos de Analíticas y Sección de Tareas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución del Pipeline (Custom SVG/Tailwind charts) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 tracking-tight">Distribución del Pipeline Operativo</h3>
          
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const maxVal = Math.max(...stages.map(s => s.count)) || 1;
              const percentage = (stage.count / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">{stage.label}</span>
                    <span className="text-slate-800 font-semibold">{stage.count} {stage.count === 1 ? 'cliente' : 'clientes'}</span>
                  </div>
                  <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${stage.bg} border-r border-slate-300`}
                      style={{ 
                        width: `${stage.count > 0 ? Math.max(percentage, 5) : 0}%`,
                        backgroundColor: stage.label === 'Aprobado' ? '#10b981' : stage.label === 'Prospecto' ? '#94a3b8' : stage.label === 'En análisis' ? '#f59e0b' : stage.label === 'Docs integrados' ? '#6366f1' : stage.label === 'Enviado a banco' ? '#3b82f6' : '#f43f5e'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bancos Más Utilizados (Simulado en Base a Expedientes) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Bancos Más Solicitados en Sede</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Banorte</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">35%</p>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '35%' }} />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Scotiabank</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">30%</p>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '30%' }} />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Santander</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">25%</p>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Tareas Críticas e Historial */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-800 tracking-tight">Tareas Críticas</h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                {tasks.filter(t => t.status === 'pending').length} Pendientes
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    task.status === 'completed' 
                      ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={task.status === 'completed'}
                    onChange={() => {}} // toggled on card click
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium text-slate-700 leading-tight ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        task.type === 'doc' ? 'bg-blue-50 text-blue-600' :
                        task.type === 'rate' ? 'bg-purple-50 text-purple-600' :
                        task.type === 'buro' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {task.type}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button 
              onClick={() => onNavigate(7)} // Kanban
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-150 hover:bg-emerald-100 transition-all"
            >
              Organizar Tablero Kanban
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clientes con Seguimiento Urgente */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">Atención y Seguimiento Urgente</h3>
          </div>
          <span className="text-xs text-slate-400">Próximas acciones recomendadas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {urgentFollowUps.slice(0, 3).map(file => {
            const pendingDocs = file.documents.filter(d => d.status === 'Pendiente' || d.status === 'Requiere actualización');
            return (
              <div key={file.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{file.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{file.creditType} · Plazo {file.termYears} años</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                    Prioridad Alta
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Monto Solicitado:</span>
                    <span className="font-semibold text-slate-800">${file.requestedAmount.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Etapa actual:</span>
                    <span className="font-semibold text-slate-800">{file.stage}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Docs Pendientes:</span>
                    <span className="font-semibold text-slate-800">{pendingDocs.length}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Acción recomendada</span>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{file.nextAction}</span>
                  </div>
                  <div className="flex gap-2">
                    {file.stage === 'Prospecto' && (
                      <button 
                        onClick={() => onStartGuidedFlow(file.id)}
                        className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                        title="Iniciar Flujo Guiado"
                      >
                        <Zap className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => onSelectFile(file.id)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-all"
                    >
                      Abrir Expediente
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {urgentFollowUps.length === 0 && (
            <div className="col-span-full py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
              No hay expedientes con prioridad alta pendientes de seguimiento. ¡Todo está bajo control!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
