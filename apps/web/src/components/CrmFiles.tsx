import React, { useState } from 'react';
import { MortgageFile, User, Document, DocumentStatus, BuroAuthStatus } from '../types';
import {
  Search,
  Filter,
  FileText,
  ChevronRight,
  X,
  User as UserIcon,
  Folder,
  ShieldCheck,
  Plus,
  TrendingUp,
  MoreVertical,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  Upload,
  AlertTriangle,
  Clipboard,
  History,
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface CrmFilesProps {
  currentUser: User;
  files: MortgageFile[];
  onSelectFile: (fileId: string) => void;
  onUpdateFile: (fileId: string, updatedFields: Partial<MortgageFile>) => void;
  onStartGuidedFlow: (fileId: string) => void;
  onAddFile: (
    file: Omit<MortgageFile, 'id'>,
  ) => Promise<MortgageFile>;
}

export default function CrmFiles({
  currentUser,
  files,
  onSelectFile,
  onUpdateFile,
  onAddFile,
  onStartGuidedFlow
}: CrmFilesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('Todos');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'docs' | 'buro' | 'asistente' | 'envio' | 'logs'>('resumen');

  // New client form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRequestedAmount, setNewRequestedAmount] = useState(2500000);
  const [newPropertyValue, setNewPropertyValue] = useState(3200000);
  const [newCreditType, setNewCreditType] = useState('Adquisición');
  const [newIncome, setNewIncome] = useState(60000);
  const [creatingClient, setCreatingClient] = useState(false);

  // Filter files based on roles and search
  const visibleFiles = files.filter(f => {
    // Role filtering
    let allowed = true;
    if (currentUser.role === 'Superadministrador') {
      allowed = true;
    } else if (currentUser.role === 'Administrador de Centro') {
      allowed = f.sede === currentUser.sede;
    } else {
      allowed = f.broker === currentUser.email;
    }

    if (!allowed) return false;

    // Search & Stage filtering
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery);

    const matchesStage = selectedStage === 'Todos' || f.stage === selectedStage;

    return matchesSearch && matchesStage;
  });

  const activeFile = files.find(f => f.id === selectedFileId);

  // Document uploader helper
  const [dragActive, setDragActive] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(docId);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileName = e.dataTransfer.files[0].name;
      uploadDocSuccess(docId, fileName);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      uploadDocSuccess(docId, fileName);
    }
  };

  const uploadDocSuccess = (docId: string, fileName: string) => {
    if (!activeFile) return;

    const updatedDocs = activeFile.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'En revisión' as DocumentStatus,
          uploadDate: new Date().toISOString().split('T')[0],
          remarks: `Cargado correctamente: "${fileName}" por el asesor.`
        };
      }
      return d;
    });

    const newLog = {
      id: `log-doc-${Date.now()}`,
      user: currentUser.name,
      action: `Cargó archivo para documento: ${activeFile.documents.find(d => d.id === docId)?.name}`,
      timestamp: new Date().toISOString()
    };

    onUpdateFile(activeFile.id, {
      documents: updatedDocs,
      logs: [newLog, ...activeFile.logs]
    });
  };

  const updateDocStatus = (docId: string, newStatus: DocumentStatus, remarks?: string) => {
    if (!activeFile) return;

    const updatedDocs = activeFile.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: newStatus,
          responsible: currentUser.name,
          remarks: remarks || `Estatus actualizado a: ${newStatus} por la Mesa de Control.`
        };
      }
      return d;
    });

    const newLog = {
      id: `log-doc-status-${Date.now()}`,
      user: currentUser.name,
      action: `Cambió estatus de documento a ${newStatus}: ${activeFile.documents.find(d => d.id === docId)?.name}`,
      timestamp: new Date().toISOString()
    };

    onUpdateFile(activeFile.id, {
      documents: updatedDocs,
      logs: [newLog, ...activeFile.logs]
    });
  };

  // Buro status triggers
  const handleBuroAction = (action: 'firma_remota' | 'firma_presencial' | 'cargar' | 'validar') => {
    if (!activeFile) return;

    let newStatus: BuroAuthStatus = 'Autorización pendiente';
    let logMessage = '';

    if (action === 'firma_remota') {
      newStatus = 'Autorización pendiente';
      logMessage = 'Envió solicitud de firma remota de Buró al correo del cliente.';
      alert('Se ha enviado el enlace de firma remota a: ' + activeFile.email);
    } else if (action === 'firma_presencial') {
      newStatus = 'Autorización firmada';
      logMessage = 'Registró firma presencial autógrafa del cliente en la oficina.';
    } else if (action === 'cargar') {
      newStatus = 'Autorización firmada';
      logMessage = 'Cargó formato firmado de consulta de Buró de Crédito.';
    } else if (action === 'validar') {
      newStatus = 'Autorización firmada';
      logMessage = 'Validó y aprobó la firma de la autorización de Buró.';
    }

    const updatedBuro = {
      ...activeFile.buro,
      authStatus: newStatus,
      authDate: newStatus === 'Autorización firmada' ? new Date().toISOString().split('T')[0] : undefined
    };

    const newLog = {
      id: `log-buro-${Date.now()}`,
      user: currentUser.name,
      action: logMessage,
      timestamp: new Date().toISOString()
    };

    onUpdateFile(activeFile.id, {
      buro: updatedBuro,
      logs: [newLog, ...activeFile.logs]
    });
  };

  // Submission checklist state toggle
  const toggleSubmissionStep = (stepIndex: number) => {
    // visual feedback for checklist
    alert('Paso de envío bancario guardado y actualizado con éxito.');
  };

  // Clipboard copies
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copiado al portapapeles: ${label}`);
  };

  const createNewClient = async () => {
    if (!newName || !newEmail || !newPhone) {
      alert('Por favor, llena los campos básicos obligatorios.');
      return;
    }

    try {
      setCreatingClient(true);

      const newFile: Omit<MortgageFile, 'id'> = {
        advisorId: currentUser.id,
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim(),
        broker: currentUser.email,
        sede: currentUser.sede || 'Sede Centro Monterrey',
        requestedAmount: newRequestedAmount,
        propertyValue: newPropertyValue,
        termYears: 20,
        creditType: newCreditType,
        monthlyIncome: newIncome,
        monthlyExpenses: Math.round(newIncome * 0.3),
        otherDebts: 0,
        age: 35,
        economicActivity: 'Asalariado',
        jobTenureMonths: 24,
        observations:
          'Nuevo cliente registrado mediante consola corporativa SoFIA.',
        stage: 'Prospecto',
        priority: 'Alta',
        nextAction: 'Iniciar flujo guiado o consulta de Buró',
        lastAnalysisDate: new Date().toISOString().split('T')[0],
        documents: [
          {
            id: crypto.randomUUID(),
            name: 'Identificación oficial',
            status: 'Pendiente',
          },
          {
            id: crypto.randomUUID(),
            name: 'Comprobante de domicilio',
            status: 'Pendiente',
          },
          {
            id: crypto.randomUUID(),
            name: 'Estados de cuenta',
            status: 'Pendiente',
          },
          {
            id: crypto.randomUUID(),
            name: 'Reporte de Buró',
            status: 'Pendiente',
          },
          {
            id: crypto.randomUUID(),
            name: 'Constancia de Situación Fiscal',
            status: 'Pendiente',
          },
          {
            id: crypto.randomUUID(),
            name: 'Comprobante de ingresos',
            status: 'Pendiente',
          },
          {
            id: crypto.randomUUID(),
            name: 'Autorización de consulta de Buró firmada',
            status: 'Pendiente',
          },
        ],
        buro: {
          authStatus: 'Autorización pendiente',
        },
        simulatedOffers: [],
        logs: [
          {
            id: crypto.randomUUID(),
            user: currentUser.name,
            action: 'Registro e ingreso de cliente nuevo',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const createdFile = await onAddFile(newFile);

      onSelectFile(createdFile.id);
      setSelectedFileId(createdFile.id);
      setShowAddModal(false);

      setNewName('');
      setNewEmail('');
      setNewPhone('');
    } catch (error) {
      console.error('Error registrando cliente:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'No fue posible registrar al cliente.',
      );
    } finally {
      setCreatingClient(false);
    }
  };

  return (
    <div className="space-y-6" id="crm-maestro-container">
      {/* Top bar search and control */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-lg relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo, teléfono o folio..."
            className="w-full text-xs font-medium bg-slate-50 border border-slate-250 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:bg-white focus:border-emerald-500 transition-all text-slate-800"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Etapa:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-transparent border-none font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Prospecto">Prospecto</option>
              <option value="En análisis">En análisis</option>
              <option value="Docs integrados">Docs integrados</option>
              <option value="Enviado a banco">Enviado a banco</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Registrar Cliente
          </button>
        </div>
      </div>

      {/* Roster Table of Files */}
      <div className="bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 font-medium">
            <thead className="bg-slate-50 border-b border-slate-150 uppercase tracking-wider text-[10px] text-slate-700 font-bold">
              <tr>
                <th className="px-5 py-4">Cliente / Contacto</th>
                <th className="px-5 py-4">Asesor / Sede</th>
                <th className="px-5 py-4">Monto / Tipo</th>
                <th className="px-5 py-4">Estatus / Prioridad</th>
                <th className="px-5 py-4">Siguiente Acción</th>
                <th className="px-5 py-4 text-center">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleFiles.map((file) => {
                const pendingDocs = file.documents.filter(d => d.status === 'Pendiente' || d.status === 'Requiere actualización');
                return (
                  <tr key={file.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-800">{file.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <Mail className="h-3 w-3" /> {file.email} · <Phone className="h-3 w-3" /> {file.phone}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <p className="font-semibold">{file.broker.split('@')[0].replace('.', ' ')}</p>
                      <p className="text-[10px] text-slate-400">{file.sede}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-800">${file.requestedAmount.toLocaleString('es-MX')} MXN</p>
                      <p className="text-[10px] text-slate-400">{file.creditType}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${file.stage === 'Aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          file.stage === 'Rechazado' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            file.stage === 'Enviado a banco' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              file.stage === 'Docs integrados' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                file.stage === 'En análisis' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          {file.stage}
                        </span>
                        <span className={`text-[9px] font-semibold ${file.priority === 'Alta' ? 'text-rose-500' : 'text-slate-400'}`}>
                          Prioridad {file.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-[180px] truncate" title={file.nextAction}>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Acción:</p>
                      <p className="font-semibold text-slate-700 truncate">{file.nextAction}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedFileId(file.id);
                          onSelectFile(file.id);
                          setActiveTab('resumen');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all"
                      >
                        Expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visibleFiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs border-dashed">
                    No se encontraron expedientes con los criterios establecidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer de Detalle del Expediente */}
      {selectedFileId && activeFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-4xl bg-white h-full flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300">
            {/* Header del Drawer */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-800">Expediente Hipotecario: {activeFile.name}</h2>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-full">
                    {activeFile.stage}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Folio: CRED-{activeFile.id.split('-')[1] || activeFile.id.substr(5, 5).toUpperCase()} · Broker Responsable: {activeFile.broker}</p>
              </div>
              <button
                onClick={() => setSelectedFileId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs del Drawer */}
            <div className="px-6 bg-slate-50 border-b border-slate-150 flex gap-1.5 overflow-x-auto">
              {[
                { id: 'resumen', label: 'Resumen del Perfil' },
                { id: 'docs', label: 'Documentos' },
                { id: 'buro', label: 'Buró de Crédito' },
                { id: 'asistente', label: 'Asistente de Portal' },
                { id: 'envio', label: 'Envío de Solicitud' },
                { id: 'logs', label: 'Actividad e Historial' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-3 text-xs font-bold tracking-tight outline-none border-b-2 transition-all cursor-pointer ${activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido del Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* TAB 1: RESUMEN PERFIL */}
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  {/* Tarjeta de Información General */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200/60 rounded-xl p-5">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                        <UserIcon className="h-4 w-4" /> Datos de Identificación
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="text-slate-400">Edad:</span>
                        <span className="font-bold text-slate-800">{activeFile.age} años</span>
                        <span className="text-slate-400">Actividad:</span>
                        <span className="font-bold text-slate-800">{activeFile.economicActivity}</span>
                        <span className="text-slate-400">Antigüedad:</span>
                        <span className="font-bold text-slate-800">{activeFile.jobTenureMonths} meses</span>
                        <span className="text-slate-400">Ingreso Mensual:</span>
                        <span className="font-bold text-slate-800 text-emerald-700">${activeFile.monthlyIncome.toLocaleString('es-MX')} MXN</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                        <Briefcase className="h-4 w-4" /> Criterios del Financiamiento
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="text-slate-400">Monto Solicitado:</span>
                        <span className="font-bold text-slate-800">${activeFile.requestedAmount.toLocaleString('es-MX')}</span>
                        <span className="text-slate-400">Valor Propiedad:</span>
                        <span className="font-bold text-slate-800">${activeFile.propertyValue.toLocaleString('es-MX')}</span>
                        <span className="text-slate-400">Plazo solicitado:</span>
                        <span className="font-bold text-slate-800">{activeFile.termYears} años</span>
                        <span className="text-slate-400">Tipo Crédito:</span>
                        <span className="font-bold text-slate-800">{activeFile.creditType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notas Operativas */}
                  <div className="space-y-2 bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-4 w-4 text-slate-400" /> Observaciones y Notas del Broker
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-3 rounded">{activeFile.observations}</p>
                  </div>

                  {/* Acciones Rápidas del expediente */}
                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    {activeFile.stage === 'Prospecto' && (
                      <button
                        onClick={() => {
                          setSelectedFileId(null);
                          onStartGuidedFlow(activeFile.id);
                        }}
                        className="flex items-center gap-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <Zap className="h-4 w-4" /> Iniciar Diagnóstico Guiado
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DOCUMENTACIÓN */}
              {activeTab === 'docs' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cumplimiento del Expediente</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">La mesa de control requiere validación total de los 7 documentos obligatorios.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                      {activeFile.documents.filter(d => d.status === 'Validado').length} / 7 Validados
                    </span>
                  </div>

                  {/* Lista de Documentos con uploader */}
                  <div className="space-y-3">
                    {activeFile.documents.map((doc) => {
                      const isDragActive = dragActive === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onDragEnter={(e) => handleDrag(e, doc.id)}
                          onDragOver={(e) => handleDrag(e, doc.id)}
                          onDragLeave={(e) => handleDrag(e, doc.id)}
                          onDrop={(e) => handleDrop(e, doc.id)}
                          className={`border rounded-lg p-3.5 transition-all ${doc.status === 'Validado' ? 'bg-emerald-50/15 border-emerald-250' :
                            doc.status === 'En revisión' ? 'bg-indigo-50/10 border-indigo-200' :
                              doc.status === 'Rechazado' ? 'bg-rose-50/10 border-rose-200' : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <div className={`p-2 rounded mt-0.5 ${doc.status === 'Validado' ? 'bg-emerald-50 text-emerald-600' :
                                doc.status === 'En revisión' ? 'bg-indigo-50 text-indigo-600' :
                                  doc.status === 'Rechazado' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                                }`}>
                                <FileCheck className="h-4.5 w-4.5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold">
                                  <span>Estatus:
                                    <strong className={`ml-1 ${doc.status === 'Validado' ? 'text-emerald-600' :
                                      doc.status === 'En revisión' ? 'text-indigo-600' :
                                        doc.status === 'Rechazado' ? 'text-rose-600' : 'text-slate-500'
                                      }`}>{doc.status}</strong>
                                  </span>
                                  {doc.uploadDate && (
                                    <>
                                      <span>·</span>
                                      <span>Modificado: {doc.uploadDate}</span>
                                    </>
                                  )}
                                </div>
                                {doc.remarks && (
                                  <p className="text-[11px] text-slate-500 mt-1.5 leading-normal bg-slate-50 p-2 rounded border border-slate-100 font-medium">
                                    Obs: {doc.remarks}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Acciones de Documento (Subida manual, Aprobación / Rechazo) */}
                            <div className="flex gap-2.5 self-end sm:self-auto">
                              {/* Drag/Drop and Manual trigger for upload */}
                              {doc.status !== 'Validado' && (
                                <div className="relative">
                                  <input
                                    type="file"
                                    id={`file-input-${doc.id}`}
                                    onChange={(e) => handleFileInputChange(e, doc.id)}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`file-input-${doc.id}`}
                                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <Upload className="h-3.5 w-3.5" /> Cargar
                                  </label>
                                </div>
                              )}

                              {/* Mesa de control validation actions (visible to admins) */}
                              {['Superadministrador', 'Administrador de Centro'].includes(currentUser.role) && doc.status === 'En revisión' && (
                                <>
                                  <button
                                    onClick={() => updateDocStatus(doc.id, 'Validado', 'Aprobado y validado en Mesa de Control.')}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm cursor-pointer"
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() => {
                                      const cause = prompt('Indica el motivo del rechazo del documento:', 'Firma ilegible o formato cortado.');
                                      if (cause) {
                                        updateDocStatus(doc.id, 'Rechazado', `Rechazado. Motivo: ${cause}`);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-bold"
                                  >
                                    Rechazar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: BURÓ DE CRÉDITO */}
              {activeTab === 'buro' && (
                <div className="space-y-6">
                  {/* Warning when authorization is pending */}
                  {activeFile.buro.authStatus !== 'Autorización firmada' ? (
                    <div className="bg-amber-50/50 border border-amber-250 p-6 rounded-xl space-y-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-amber-900">Consulta de Buró Bloqueada</h4>
                          <p className="text-xs text-amber-700 leading-relaxed mt-1">
                            Para consultar Buró es necesario contar con la autorización firmada del cliente. Sin este respaldo digital, la consulta infringe políticas de la alianza bancaria.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-150">
                        <button
                          onClick={() => handleBuroAction('firma_remota')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                        >
                          Enviar Firma Remota
                        </button>
                        <button
                          onClick={() => handleBuroAction('firma_presencial')}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Registrar Firma Presencial
                        </button>
                        <button
                          onClick={() => handleBuroAction('cargar')}
                          className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-lg"
                        >
                          Cargar Formato PDF Firmado
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display full Buro details if signed */
                    <div className="space-y-6">
                      <div className="bg-white border border-slate-250 rounded-xl p-5 shadow-sm space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                              Autorización de Consulta de Buró Validada
                            </h3>
                            <p className="text-[10px] text-slate-400">Verificado el: {activeFile.buro.authDate}</p>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            Autorización Vigente
                          </span>
                        </div>

                        {/* Roster de Score de Buró */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score Crediticio</p>
                            <p className="text-xl font-extrabold text-slate-800 mt-1">{activeFile.buro.score || '692'}</p>
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full uppercase mt-1 inline-block">Óptimo</span>
                          </div>

                          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Puntualidad de Pagos</p>
                            <p className="text-xl font-extrabold text-slate-800 mt-1">{activeFile.buro.paymentPunctuality || 'Excelente (99%)'}</p>
                            <span className="text-[8px] text-slate-400 mt-1 block">Sin compromisos vencidos</span>
                          </div>

                          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cuentas Abiertas</p>
                            <p className="text-xl font-extrabold text-slate-800 mt-1">{activeFile.buro.activeAccounts || '4'}</p>
                            <span className="text-[8px] text-slate-400 mt-1 block">Tarjetas y automotriz</span>
                          </div>
                        </div>

                        {/* Alertas de Riesgo */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alertas Preventivas del Sistema de Crédito</h4>
                          {activeFile.buro.riskAlerts && activeFile.buro.riskAlerts.length > 0 ? (
                            <ul className="space-y-1">
                              {activeFile.buro.riskAlerts.map((alert, idx) => (
                                <li key={idx} className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-100 font-semibold leading-normal flex items-start gap-1">
                                  <span>⚠️</span>
                                  <span>{alert}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded leading-normal border border-slate-100 font-medium">
                              ✓ Ninguna alerta de riesgo o morosidad registrada. Comportamiento crediticio ejemplar en los últimos 36 meses.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ASISTENTE DE PORTAL (Pre-llenado) */}
              {activeTab === 'asistente' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start gap-3">
                    <Clipboard className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Asistente de Llenado de Solicitud</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Evita recapturas manuales. Usa estos bloques prellenados para copiar y pegar rápidamente los datos validados del cliente en los portales oficiales de los bancos.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bloque 1 */}
                    <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm relative">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Datos Generales</h4>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Nombre Completo:</span>
                          <span className="font-bold text-slate-700 select-all">{activeFile.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Email:</span>
                          <span className="font-bold text-slate-700 select-all">{activeFile.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Teléfono:</span>
                          <span className="font-bold text-slate-700 select-all">{activeFile.phone}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${activeFile.name}\n${activeFile.email}\n${activeFile.phone}`, 'Datos generales')}
                        className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded border border-slate-200 transition-colors"
                      >
                        Copiar Bloque
                      </button>
                    </div>

                    {/* Bloque 2 */}
                    <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm relative">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Ingresos y Finanzas</h4>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ingreso Mensual:</span>
                          <span className="font-bold text-slate-700 select-all">${activeFile.monthlyIncome} MXN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gastos Mensuales:</span>
                          <span className="font-bold text-slate-700 select-all">${activeFile.monthlyExpenses} MXN</span>
                        </div>
                        <span className="text-[10px] block text-slate-400 mt-2">Actividad Económica: {activeFile.economicActivity}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`Ingreso: ${activeFile.monthlyIncome}\nGastos: ${activeFile.monthlyExpenses}\nActividad: ${activeFile.economicActivity}`, 'Ingresos y finanzas')}
                        className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded border border-slate-200 transition-colors"
                      >
                        Copiar Bloque
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ENVÍO DE SOLICITUD CHECKLIST */}
              {activeTab === 'envio' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Flujo de Envío Formal de Expediente</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Etapas críticas obligatorias para formalizar la solicitud hipotecaria ante la institución bancaria.</p>
                  </div>

                  {/* Checklist visual */}
                  <div className="space-y-3.5">
                    {[
                      { step: '1. Datos y Diagnóstico de Perfil', desc: 'Datos del cliente capturados y validados mediante el Analizador de Perfil SoFIA.', done: true },
                      { step: '2. Buró de Crédito Autorizado y Firmado', desc: 'La autorización de Buró de Crédito cuenta con firma autógrafa digitalizada vigente.', done: activeFile.buro.authStatus === 'Autorización firmada' },
                      { step: '3. Documentación del Expediente Completa', desc: 'Los 7 documentos requeridos en el checklist están cargados y validados internamente.', done: activeFile.documents.filter(d => d.status === 'Validado').length === 7 },
                      { step: '4. Generación de Comparativas Bancarias', desc: 'Se ha realizado y analizado la simulación de propuestas con SoFIA.', done: true },
                      { step: '5. Solicitud Prellenada y Enviada', desc: 'Se cargó formalmente la solicitud en el portal del banco asignado y se espera dictamen.', done: activeFile.stage === 'Enviado a banco' || activeFile.stage === 'Aprobado' }
                    ].map((st, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleSubmissionStep(idx)}
                        className={`border rounded-lg p-3.5 flex items-start gap-3 cursor-pointer transition-all ${st.done ? 'bg-emerald-50/10 border-emerald-250' : 'bg-white border-slate-200 hover:border-slate-350'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${st.done ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-300'
                          }`}>
                          {st.done ? '✓' : idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${st.done ? 'text-emerald-900' : 'text-slate-800'}`}>{st.step}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{st.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: TRAZABILIDAD Y LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bitácora de Trazabilidad Operativa</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Historial inmutable de auditorías de documentos, simulaciones y envíos de solicitud.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {activeFile.logs.map((log) => (
                      <div key={log.id} className="border-l-2 border-slate-200 pl-4 py-1 relative">
                        <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-350" />
                        <div className="text-xs font-semibold text-slate-700">{log.action}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">
                          Responsable: {log.user} · {new Date(log.timestamp).toLocaleString('es-MX')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer del Drawer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedFileId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR CLIENTE NUEVO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-150 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Registrar Nuevo Prospecto</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Cliente</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Sofía Ramos Elizondo"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3.5 py-2 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Institucional / Personal</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ej. sofia.ramos@gmail.com"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3.5 py-2 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Ej. 811-234-5678"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3.5 py-2 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto Solicitado</label>
                  <input
                    type="number"
                    value={newRequestedAmount}
                    onChange={(e) => setNewRequestedAmount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3.5 py-2 outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo Crédito</label>
                  <select
                    value={newCreditType}
                    onChange={(e) => setNewCreditType(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3.5 py-2 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Adquisición">Adquisición</option>
                    <option value="Liquidez">Liquidez</option>
                    <option value="Construcción">Construcción</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={creatingClient}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createNewClient}
                disabled={creatingClient}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                {creatingClient ? 'Registrando...' : 'Registrar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
