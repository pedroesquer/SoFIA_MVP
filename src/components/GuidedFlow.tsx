import React, { useState, useEffect } from 'react';
import { MortgageFile, BankRate, SimulatedOffer, User } from '../types';
import ProfileAnalyzer from './ProfileAnalyzer';
import Simulator from './Simulator';
import { 
  Zap, 
  UserCheck, 
  Percent, 
  FileText, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Award,
  ArrowRight,
  Printer,
  Download,
  AlertTriangle
} from 'lucide-react';

interface GuidedFlowProps {
  currentUser: User;
  files: MortgageFile[];
  rates: BankRate[];
  initialFileId?: string | null;
  onUpdateFile: (fileId: string, updatedFields: Partial<MortgageFile>) => void;
  onFinishFlow?: () => void;
}

export default function GuidedFlow({ 
  currentUser, 
  files, 
  rates, 
  initialFileId,
  onUpdateFile,
  onFinishFlow 
}: GuidedFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(initialFileId || null);
  const [stepSimulations, setStepSimulations] = useState<SimulatedOffer[]>([]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  // Sync initialFileId if passed from outside
  useEffect(() => {
    if (initialFileId) {
      setSelectedFileId(initialFileId);
      setCurrentStep(2); // directly to diagnostics if a file is already active
    }
  }, [initialFileId]);

  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setCurrentStep(2); // advance to diagnostics
  };

  const handleSaveAnalyzerDiagnostics = (updatedData: Partial<MortgageFile>) => {
    if (selectedFileId) {
      const logs = [
        {
          id: `log-diag-${Date.now()}`,
          user: currentUser.name,
          action: 'Actualizó y guardó diagnóstico de riesgo en flujo guiado.',
          timestamp: new Date().toISOString()
        },
        ...(selectedFile?.logs || [])
      ];
      onUpdateFile(selectedFileId, { ...updatedData, logs });
    }
  };

  const handleSimulationsUpdate = (sims: SimulatedOffer[]) => {
    setStepSimulations(sims);
  };

  const handleFinishProposal = () => {
    if (!selectedFileId || !selectedFile) return;

    const finalLogs = [
      {
        id: `log-guided-finish-${Date.now()}`,
        user: currentUser.name,
        action: 'Completó flujo guiado y generó la propuesta hipotecaria formal.',
        timestamp: new Date().toISOString()
      },
      ...selectedFile.logs
    ];

    onUpdateFile(selectedFileId, {
      stage: 'En análisis', // update stage to analytical review
      nextAction: 'Solicitar firmas de Buró de Crédito formales',
      simulatedOffers: stepSimulations,
      logs: finalLogs
    });

    alert('¡Propuesta hipotecaria formal generada con éxito y archivada en el expediente! El estatus avanzó a "En análisis"');
    if (onFinishFlow) onFinishFlow();
  };

  return (
    <div className="space-y-6" id="guided-flow-container">
      {/* Indicador de Pasos del Wizard */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
              Estructurador Guiado de Crédito Hipotecario
            </h1>
            <p className="text-xs text-slate-500 mt-1">Sigue los 4 pasos validados de CREDIDIEZ para integrar expedientes perfectos.</p>
          </div>

          {/* Pasos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 font-bold text-xs">
            {[
              { num: 1, label: 'Expediente' },
              { num: 2, label: 'Diagnóstico de Riesgo' },
              { num: 3, label: 'Simular Bancos' },
              { num: 4, label: 'Propuesta Final' }
            ].map(step => (
              <React.Fragment key={step.num}>
                {step.num > 1 && <span className="text-slate-350">/</span>}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  currentStep === step.num 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : currentStep > step.num ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-white text-slate-400 border-slate-150'
                }`}>
                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep >= step.num ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.num}
                  </span>
                  <span className="whitespace-nowrap">{step.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Flujo Principal */}
      <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-sm min-h-[450px]">
        
        {/* PASO 1: SELECCIÓN DE EXPEDIENTE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-md mx-auto space-y-2">
              <UserCheck className="h-8 w-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Paso 1: Seleccionar Expediente del Cliente</h3>
              <p className="text-xs text-slate-500">
                Selecciona uno de los prospectos cargados en tu cartera o CRM de CREDIDIEZ para iniciar la cotización cruzada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
              {files.filter(f => f.stage === 'Prospecto' || f.stage === 'En análisis').map(file => (
                <div 
                  key={file.id}
                  onClick={() => handleSelectFile(file.id)}
                  className="border border-slate-200 hover:border-emerald-400 rounded-xl p-4 bg-slate-50/50 hover:bg-emerald-50/10 cursor-pointer transition-all flex flex-col justify-between h-40"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{file.name}</h4>
                    <span className="text-[9px] font-semibold text-slate-400">Monto: ${file.requestedAmount.toLocaleString('es-MX')} MXN</span>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-semibold">actividad: {file.economicActivity} · edad: {file.age} años</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-3 text-[10px] font-bold text-emerald-600">
                    <span>Estatus: {file.stage}</span>
                    <span className="flex items-center gap-0.5">Analizar <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-xl">
                  No hay prospectos activos. Por favor registra uno en la sección de CRM.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 2: DIAGNÓSTICO DE PERFIL */}
        {currentStep === 2 && selectedFile && (
          <div className="space-y-6">
            <ProfileAnalyzer 
              currentUser={currentUser} 
              rates={rates} 
              activeFile={selectedFile}
              onSaveAnalysis={handleSaveAnalyzerDiagnostics}
              onProceedToSimulation={() => setCurrentStep(3)} // advance on confirm
            />
            
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 text-slate-600 rounded-lg text-xs font-semibold"
              >
                <ChevronLeft className="h-4.5 w-4.5" /> Cambiar Cliente
              </button>
              
              <button 
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-850/90 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Simular y Comparar Bancos <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: SIMULAR Y COMPARAR */}
        {currentStep === 3 && selectedFile && (
          <div className="space-y-6">
            <Simulator 
              currentUser={currentUser} 
              rates={rates} 
              activeFile={selectedFile}
              onUpdateSimulations={handleSimulationsUpdate}
            />

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 text-slate-600 rounded-lg text-xs font-semibold"
              >
                <ChevronLeft className="h-4.5 w-4.5" /> Regresar al Perfil
              </button>
              
              <button 
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-850 hover:bg-slate-850/90 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Generar Propuesta Hipotecaria <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: PROPUESTA FINAL / REPORTE IMPRIMIBLE */}
        {currentStep === 4 && selectedFile && (
          <div className="space-y-6">
            
            {/* Reporte imprimible / Propuesta formal */}
            <div className="border border-slate-250 rounded-xl p-8 bg-white shadow-sm space-y-6 max-w-3xl mx-auto" id="printable-proposal">
              
              {/* Encabezado Corporativo */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">CREDIDIEZ ASESORES</h1>
                  <p className="text-[10px] font-bold text-emerald-700 tracking-widest uppercase mt-0.5">Propuesta de Financiamiento Hipotecario</p>
                  <p className="text-[9px] text-slate-400 mt-1">Generado el: {new Date().toLocaleDateString('es-MX')} por {currentUser.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-extrabold text-slate-800">Folio Propuesta</span>
                  <p className="text-xs font-bold text-emerald-600">PROP-{selectedFile.id.split('-')[1]?.toUpperCase() || 'M710'}</p>
                </div>
              </div>

              {/* Ficha del Cliente */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">1. Ficha Técnica del Prospecto</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-medium">Nombre Completo: <strong className="text-slate-700 font-bold">{selectedFile.name}</strong></p>
                    <p className="text-slate-400 font-medium">Ingreso Comprobable: <strong className="text-slate-700 font-bold">${selectedFile.monthlyIncome.toLocaleString('es-MX')} MXN</strong></p>
                    <p className="text-slate-400 font-medium">Actividad Económica: <strong className="text-slate-700 font-bold">{selectedFile.economicActivity}</strong></p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-medium">Valor de Propiedad: <strong className="text-slate-700 font-bold">${selectedFile.propertyValue.toLocaleString('es-MX')} MXN</strong></p>
                    <p className="text-slate-400 font-medium">Crédito Solicitado: <strong className="text-slate-700 font-bold">${selectedFile.requestedAmount.toLocaleString('es-MX')} MXN</strong></p>
                    <p className="text-slate-400 font-medium">Plazo de Pago: <strong className="text-slate-700 font-bold">{selectedFile.termYears} años</strong></p>
                  </div>
                </div>
              </div>

              {/* Opciones bancarias simuladas */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">2. Opciones de Crédito Seleccionadas</h3>
                {stepSimulations.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-3.5 py-2.5">Banco / Producto</th>
                          <th className="px-3.5 py-2.5">Tasa Base</th>
                          <th className="px-3.5 py-2.5">Mensualidad Est.</th>
                          <th className="px-3.5 py-2.5">Ingreso Mín.</th>
                          <th className="px-3.5 py-2.5">CAT Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {stepSimulations.slice(0, 3).map((sim, idx) => (
                          <tr key={idx}>
                            <td className="px-3.5 py-2.5 font-bold text-slate-800">{sim.bankName} - {sim.productName}</td>
                            <td className="px-3.5 py-2.5 font-semibold text-slate-700">{sim.interestRate.toFixed(2)}%</td>
                            <td className="px-3.5 py-2.5 font-bold text-slate-900">${sim.monthlyPayment.toLocaleString('es-MX')}</td>
                            <td className="px-3.5 py-2.5">${sim.requiredIncome.toLocaleString('es-MX')}</td>
                            <td className="px-3.5 py-2.5">{sim.cat.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No has seleccionado ninguna simulación. Regresa al Paso 3 para cotizar opciones bancarias.</p>
                )}
              </div>

              {/* Dictamen y consideraciones */}
              <div className="space-y-2 bg-slate-50 border border-slate-150 rounded-lg p-4 text-xs text-slate-600 leading-relaxed font-semibold">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-emerald-600" /> Notas Operativas y Próximos Pasos
                </h4>
                <p>1. El aforo solicitado equivale al {Math.round((selectedFile.requestedAmount / selectedFile.propertyValue) * 100)}% del valor de la garantía, lo cual es viable.</p>
                <p>2. Es indispensable formalizar la consulta de Buró cargando el formato firmado en la pestaña de documentos.</p>
                <p>3. Esta propuesta es de carácter informativo. Las condiciones pueden cambiar según perfil definitivo de Buró y avalúo.</p>
              </div>

              {/* Firmas de conformidad */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-200 text-center text-[10px] text-slate-400">
                <div className="space-y-6">
                  <div className="h-10 border-b border-dashed border-slate-300" />
                  <p className="font-bold text-slate-600">{currentUser.name}</p>
                  <p className="font-medium">Asesor Hipotecario CREDIDIEZ</p>
                </div>
                <div className="space-y-6">
                  <div className="h-10 border-b border-dashed border-slate-300" />
                  <p className="font-bold text-slate-600">{selectedFile.name}</p>
                  <p className="font-medium">Aceptación de Propuesta e Inicio de Trámite</p>
                </div>
              </div>
            </div>

            {/* Acciones de propuesta */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-slate-150 max-w-3xl mx-auto">
              <button 
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 text-slate-600 rounded-lg text-xs font-semibold"
              >
                <ChevronLeft className="h-4.5 w-4.5" /> Modificar Opciones
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" /> Imprimir Propuesta
                </button>

                <button 
                  onClick={handleFinishProposal}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Guardar Propuesta y Avanzar en Pipeline
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
