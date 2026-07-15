import React, { useState } from 'react';
import { MortgageFile, User, CRMStage } from '../types';
import { 
  Folder, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon, 
  Mail, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Filter,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface KanbanBoardProps {
  currentUser: User;
  files: MortgageFile[];
  onUpdateFile: (fileId: string, updatedFields: Partial<MortgageFile>) => void;
  onSelectFile: (fileId: string) => void;
}

export default function KanbanBoard({ currentUser, files, onUpdateFile, onSelectFile }: KanbanBoardProps) {
  const [selectedSede, setSelectedSede] = useState('Todos');

  const columns: { stage: CRMStage; label: string; color: string; border: string }[] = [
    { stage: 'Prospecto', label: 'Prospectos', color: 'bg-slate-50', border: 'border-slate-200' },
    { stage: 'En análisis', label: 'En Análisis', color: 'bg-amber-50/20', border: 'border-amber-100' },
    { stage: 'Docs integrados', label: 'Docs Integrados', color: 'bg-indigo-50/20', border: 'border-indigo-100' },
    { stage: 'Enviado a banco', label: 'Enviados a Banco', color: 'bg-blue-50/20', border: 'border-blue-100' },
    { stage: 'Aprobado', label: 'Aprobados', color: 'bg-emerald-50/20', border: 'border-emerald-100' },
    { stage: 'Rechazado', label: 'Rechazados', color: 'bg-rose-50/20', border: 'border-rose-100' }
  ];

  // Sede options
  const uniqueSedes = ['Todos', ...Array.from(new Set(files.map(f => f.sede)))];

  // Filter based on roles and active sede
  const filteredFiles = files.filter(f => {
    let allowed = true;
    if (currentUser.role === 'Superadministrador') {
      allowed = true;
    } else if (currentUser.role === 'Administrador de Centro') {
      allowed = f.sede === currentUser.sede;
    } else {
      allowed = f.broker === currentUser.email;
    }

    if (!allowed) return false;

    return selectedSede === 'Todos' || f.sede === selectedSede;
  });

  const moveCard = (fileId: string, currentStage: CRMStage, direction: 'prev' | 'next') => {
    const stageFlow: CRMStage[] = ['Prospecto', 'En análisis', 'Docs integrados', 'Enviado a banco', 'Aprobado', 'Rechazado'];
    const currentIndex = stageFlow.indexOf(currentStage);

    let nextIndex = currentIndex;
    if (direction === 'next' && currentIndex < stageFlow.length - 1) {
      nextIndex += 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      nextIndex -= 1;
    }

    if (nextIndex !== currentIndex) {
      const nextStage = stageFlow[nextIndex];
      const selectedFile = files.find(f => f.id === fileId);
      if (!selectedFile) return;

      const newLog = {
        id: `log-kanban-${Date.now()}`,
        user: currentUser.name,
        action: `Movió expediente de "${currentStage}" a "${nextStage}" mediante el Kanban Operativo.`,
        timestamp: new Date().toISOString()
      };

      onUpdateFile(fileId, {
        stage: nextStage,
        logs: [newLog, ...selectedFile.logs]
      });
    }
  };

  return (
    <div className="space-y-6" id="kanban-workflow-panel">
      {/* Filters bar */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Kanban Operativo CREDIDIEZ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza y arrastra el flujo de tus expedientes desde el ingreso como prospecto hasta el desembolso y cierre.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 self-start md:self-auto">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>Filtrar Oficina:</span>
          <select
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
            className="bg-transparent border-none font-semibold text-slate-700 outline-none cursor-pointer"
          >
            {uniqueSedes.map(sede => (
              <option key={sede} value={sede}>{sede}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnFiles = filteredFiles.filter(f => f.stage === column.stage);

          return (
            <div 
              key={column.stage} 
              className={`border border-dashed rounded-xl p-3 min-h-[550px] flex flex-col ${column.color} ${column.border}`}
            >
              {/* Header Columna */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-800">{column.label}</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {columnFiles.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnFiles.map((file) => {
                  const verifiedDocsCount = file.documents.filter(d => d.status === 'Validado').length;
                  return (
                    <div 
                      key={file.id}
                      className="bg-white border border-slate-150 hover:border-slate-350 rounded-lg p-3.5 shadow-sm transition-all relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 
                            onClick={() => onSelectFile(file.id)}
                            className="text-xs font-bold text-slate-800 hover:text-emerald-700 hover:underline cursor-pointer truncate"
                          >
                            {file.name}
                          </h4>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                            file.priority === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {file.priority}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{file.email}</p>

                        <div className="mt-3.5 space-y-1 text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-semibold">
                          <div className="flex justify-between">
                            <span>Monto:</span>
                            <span className="text-slate-800">${file.requestedAmount.toLocaleString('es-MX')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tipo:</span>
                            <span className="text-slate-700">{file.creditType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Docs:</span>
                            <span className="text-emerald-600">{verifiedDocsCount} / 7 Validados</span>
                          </div>
                        </div>
                      </div>

                      {/* Moving buttons */}
                      <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <button 
                          onClick={() => moveCard(file.id, file.stage, 'prev')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          disabled={column.stage === 'Prospecto'}
                          title="Mover anterior"
                        >
                          <ChevronLeft className="h-4.5 w-4.5" />
                        </button>
                        
                        <span className="text-[9px] text-slate-400 font-bold">Arrastrar</span>

                        <button 
                          onClick={() => moveCard(file.id, file.stage, 'next')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          disabled={column.stage === 'Rechazado'}
                          title="Mover siguiente"
                        >
                          <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {columnFiles.length === 0 && (
                  <div className="py-8 text-center text-slate-300 font-semibold text-[10px] italic">
                    Sin expedientes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
