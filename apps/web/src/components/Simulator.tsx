import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MortgageFile, BankRate, SimulatedOffer, User } from '../types';
import { generateSimulationForBank } from '../mockData';
import { authenticatedFetch } from '../lib/api';
import { 
  Check, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  DollarSign, 
  Grid, 
  List, 
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  Info
} from 'lucide-react';

interface SimulatorProps {
  currentUser: User;
  rates: BankRate[];
  activeFile?: MortgageFile;
  onUpdateSimulations?: (simulations: SimulatedOffer[]) => void;
}

export default function Simulator({ currentUser, rates, activeFile, onUpdateSimulations }: SimulatorProps) {
  // Selectable banks
  const [selectedBanks, setSelectedBanks] = useState<string[]>(
    rates.map(r => r.bankName) // select all by default
  );

  const [sortCriteria, setSortCriteria] = useState<'rate' | 'payment' | 'viability' | 'risk'>('rate');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [generatedSims, setGeneratedSims] = useState<SimulatedOffer[]>([]);
  
  // SoFIA AI analysis states
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState('');

  // Default values for client data if no activeFile exists
  const clientData = activeFile ? {
    requestedAmount: activeFile.requestedAmount,
    propertyValue: activeFile.propertyValue,
    termYears: activeFile.termYears,
    monthlyIncome: activeFile.monthlyIncome,
    monthlyExpenses: activeFile.monthlyExpenses,
    otherDebts: activeFile.otherDebts,
    age: activeFile.age,
    economicActivity: activeFile.economicActivity,
    jobTenureMonths: activeFile.jobTenureMonths,
    buroScore: activeFile.buro.score || 680
  } : {
    requestedAmount: 2000000,
    propertyValue: 2500000,
    termYears: 20,
    monthlyIncome: 50000,
    monthlyExpenses: 15000,
    otherDebts: 5000,
    age: 35,
    economicActivity: 'Asalariado',
    jobTenureMonths: 24,
    buroScore: 680
  };

  // Run simulations when selected banks or client context changes
  useEffect(() => {
    const sims = rates
      .filter(rate => selectedBanks.includes(rate.bankName))
      .map(rate => generateSimulationForBank(clientData, rate));

    setGeneratedSims(sims);

    // Persist to parent if requested
    if (onUpdateSimulations && activeFile) {
      onUpdateSimulations(sims);
    }
  }, [selectedBanks, activeFile, rates]);

  const toggleBankSelection = (bankName: string) => {
    if (selectedBanks.includes(bankName)) {
      if (selectedBanks.length > 1) {
        setSelectedBanks(selectedBanks.filter(name => name !== bankName));
      } else {
        alert('Debes seleccionar al menos un banco para realizar la simulación.');
      }
    } else {
      setSelectedBanks([...selectedBanks, bankName]);
    }
  };

  const selectAllBanks = () => {
    setSelectedBanks(rates.map(r => r.bankName));
  };

  const selectNoneBanks = () => {
    setSelectedBanks([rates[0]?.bankName]);
  };

  // Sort simulations based on criteria
  const getSortedSimulations = () => {
    return [...generatedSims].sort((a, b) => {
      if (sortCriteria === 'rate') {
        return a.interestRate - b.interestRate;
      }
      if (sortCriteria === 'payment') {
        return a.monthlyPayment - b.monthlyPayment;
      }
      if (sortCriteria === 'risk') {
        // lower ratio first (less risk)
        return a.debtToIncomeRatio - b.debtToIncomeRatio;
      }
      if (sortCriteria === 'viability') {
        // High, then Media, then Baja
        const vWeight = { 'Actualizado': 3, 'Validado internamente': 3, 'Pendiente de validar': 2, 'Requiere revisión': 1, 'Desactualizado': 0 };
        return (vWeight[b.verifiedStatus] || 0) - (vWeight[a.verifiedStatus] || 0);
      }
      return 0;
    });
  };

  // Run AI Analysis
  const runAiAnalysisWithSofia = async () => {
    if (generatedSims.length === 0) return;
    setIsAiLoading(true);
    setAiAnalysis('');
    
    // Staggered status messages for premium feel
    const statusMessages = [
      'Analizando perfil socioeconómico del prospecto...',
      'Escrudiñando políticas de riesgo para cada banco seleccionado...',
      'Calculando relaciones de endeudamiento y límites de aforo...',
      'SoFIA está redactando el informe ejecutivo de viabilidad comercial...'
    ];

    let msgIdx = 0;
    setAiAnalysisStatus(statusMessages[0]);
    const interval = setInterval(() => {
      msgIdx++;
      if (msgIdx < statusMessages.length) {
        setAiAnalysisStatus(statusMessages[msgIdx]);
      }
    }, 2000);

    try {
      const response = await authenticatedFetch('/api/sofia/analyze-simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client: {
            name: activeFile?.name || 'Prospecto Simulado',
            age: clientData.age,
            economicActivity: clientData.economicActivity,
            monthlyIncome: clientData.monthlyIncome,
            monthlyExpenses: clientData.monthlyExpenses,
            otherDebts: clientData.otherDebts,
            requestedAmount: clientData.requestedAmount,
            propertyValue: clientData.propertyValue,
            termYears: clientData.termYears,
            buro: { score: clientData.buroScore }
          },
          simulations: generatedSims
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo analizar las simulaciones.');
      }

      const data = await response.json();
      setAiAnalysis(data.text);
    } catch (error) {
      console.error('Error analyzing simulations:', error);
      setAiAnalysis(`### ⚠️ Ocurrió una interrupción al consultar a SoFIA

No pudimos procesar la auditoría con inteligencia artificial en tiempo real. Aquí tienes una recomendación comercial resumida:
- **Mejor opción financiera:** ${generatedSims[0]?.bankName || 'Scotiabank'} con tasa de ${generatedSims[0]?.interestRate || '9.90'}%.
- **Alerta de riesgo:** Verifica que la relación pago/ingreso se mantenga debajo del **40%** para evitar observaciones de la Mesa de Control.
- *Por favor, vuelve a intentar más tarde o revisa tu clave de API en el menú de Secrets de AI Studio.*`);
    } finally {
      clearInterval(interval);
      setIsAiLoading(false);
    }
  };

  // Badges logic (calculate bests dynamically based on current generation)
  const sortedByRate = [...generatedSims].sort((a, b) => a.interestRate - b.interestRate);
  const sortedByPayment = [...generatedSims].sort((a, b) => a.monthlyPayment - b.monthlyPayment);
  
  const bestRateBank = sortedByRate[0]?.bankName;
  const bestPaymentBank = sortedByPayment[0]?.bankName;

  return (
    <div className="space-y-6" id="mortgage-simulator-view">
      {/* Title */}
      <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Simulador y Comparador Bancario Dinámico
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeFile 
              ? `Generando escenarios comerciales para el expediente de: ${activeFile.name}` 
              : 'Escenarios hipotecarios dinámicos. Selecciona bancos para cotizar de manera simultánea.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={selectAllBanks}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Seleccionar Todos
          </button>
          <button 
            onClick={selectNoneBanks}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          >
            Limpiar Selección
          </button>
        </div>
      </div>

      {/* Selector de Bancos (Cards) */}
      <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Instituciones Financieras Disponibles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {rates.map(rate => {
            const isSelected = selectedBanks.includes(rate.bankName);
            return (
              <div 
                key={rate.id}
                onClick={() => toggleBankSelection(rate.bankName)}
                className={`border rounded-lg p-3.5 text-center cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-emerald-50/55 border-emerald-500 text-emerald-950 shadow-sm font-bold' 
                    : 'bg-white border-slate-200 hover:border-slate-350 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold block truncate">{rate.bankName}</span>
                  {isSelected ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[8px]">✓</span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 block" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">{rate.interestRate.toFixed(2)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel de Ordenamiento y Gráficos Visuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Comparativo Rápido (Custom SVG) */}
        <div className="lg:col-span-2 bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Comparativa de Mensualidades por Institución</h4>
            <span className="text-[10px] text-slate-400 font-medium">Monto: ${clientData.requestedAmount.toLocaleString('es-MX')} MXN · {clientData.termYears} años</span>
          </div>

          <div className="space-y-4">
            {generatedSims.map((sim, idx) => {
              const maxPayment = Math.max(...generatedSims.map(s => s.monthlyPayment)) || 1;
              const barWidth = (sim.monthlyPayment / maxPayment) * 100;

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-bold text-slate-700 truncate">{sim.bankName}</div>
                  <div className="flex-1 bg-slate-50 border border-slate-100 rounded-full h-6 overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        sim.bankName === bestPaymentBank ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                    <span className="absolute left-3.5 top-1 text-[10px] font-bold text-slate-700">
                      ${sim.monthlyPayment.toLocaleString('es-MX')} / mes
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 w-12 text-right">
                    Tasa: {sim.interestRate.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Criterios de Selección Rápidos */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Filtrado y Ordenamiento</h4>
            <div className="space-y-2">
              <button 
                onClick={() => setSortCriteria('rate')}
                className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  sortCriteria === 'rate' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>Menor Tasa de Interés</span>
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setSortCriteria('payment')}
                className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  sortCriteria === 'payment' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>Menor Mensualidad Estimada</span>
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setSortCriteria('viability')}
                className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  sortCriteria === 'viability' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>Mayor Viabilidad Operativa</span>
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setSortCriteria('risk')}
                className={`w-full flex justify-between items-center p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${
                  sortCriteria === 'risk' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>Menor Nivel de Endeudamiento (DTI)</span>
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 bg-white rounded-lg transition-all"
            >
              {viewMode === 'grid' ? <List className="h-3.5 w-3.5" /> : <Grid className="h-3.5 w-3.5" />}
              {viewMode === 'grid' ? 'Vista de Tabla' : 'Vista de Tarjetas'}
            </button>
            
            <button 
              onClick={runAiAnalysisWithSofia}
              disabled={isAiLoading || generatedSims.length === 0}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-300"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Analizar con SoFIA
            </button>
          </div>
        </div>
      </div>

      {/* Advertencia obligatoria */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start gap-2.5">
        <Info className="h-4.5 w-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-slate-500 leading-normal font-medium">
          <strong>Esta simulación es estimada</strong> con base en la información registrada del cliente y las tasas vigentes disponibles. La oferta final, tasas, aforo y seguros definitivos deben validarse de manera formal con la institución bancaria correspondiente.
        </p>
      </div>

      {/* Resultados de AI SoFIA Analysis */}
      {isAiLoading && (
        <div className="bg-slate-50 border border-slate-150 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-150 flex items-center justify-center font-bold text-xs flex-shrink-0 animate-bounce">
            SF
          </div>
          <p className="text-xs font-bold text-slate-700">{aiAnalysisStatus}</p>
          <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {aiAnalysis && !isAiLoading && (
        <div className="bg-emerald-50/20 border border-emerald-150 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-emerald-100">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">Informe de Viabilidad Cruzada · Inteligencia SoFIA</h3>
          </div>
          <div className="markdown-body text-xs text-slate-700 leading-relaxed max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiAnalysis}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Resultados en Grid u Organizados */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {getSortedSimulations().map((sim) => (
            <div key={sim.id} className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{sim.bankName}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">{sim.productName}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {sim.bankName === bestRateBank && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Mejor Tasa</span>
                    )}
                    {sim.bankName === bestPaymentBank && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Pago Bajo</span>
                    )}
                    {sim.debtToIncomeRatio > 55 && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">Riesgo Alto</span>
                    )}
                  </div>
                </div>

                {/* Métricas clave */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50 border border-slate-100 rounded-lg p-3 my-4">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tasa de interés</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">{sim.interestRate.toFixed(2)}%</p>
                    <span className="text-[8px] text-slate-400 font-semibold">Tasa al: {sim.rateUpdatedDate}</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mensualidad Est.</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">${sim.monthlyPayment.toLocaleString('es-MX')}</p>
                    <span className="text-[8px] text-slate-400 font-semibold">Plazo {sim.termYears} años</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CAT Estimado</p>
                    <p className="text-xs font-extrabold text-slate-700 mt-0.5">{sim.cat.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Endeudamiento (DTI)</p>
                    <p className={`text-xs font-extrabold mt-0.5 ${sim.debtToIncomeRatio > 45 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {sim.debtToIncomeRatio}%
                    </p>
                  </div>
                </div>

                {/* Gastos de Cierre Iniciales */}
                <div className="space-y-1 text-[11px] text-slate-500 border-b border-slate-100 pb-3 mb-3 font-semibold">
                  <div className="flex justify-between">
                    <span>Comisión de Apertura:</span>
                    <span className="text-slate-800">${(sim.loanAmount * (sim.commission / 100)).toLocaleString('es-MX')} ({sim.commission}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avalúo Técnico Est.:</span>
                    <span className="text-slate-800">${sim.appraisalCost.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingreso Mín. Requerido:</span>
                    <span className="text-slate-800 font-extrabold">${sim.requiredIncome.toLocaleString('es-MX')} MXN</span>
                  </div>
                </div>

                {/* Ventajas y Limitaciones */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ventajas del producto:</p>
                    <ul className="space-y-1">
                      {sim.advantages.map((adv, idx) => (
                        <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1">
                          <span className="text-emerald-500">✓</span>
                          <span className="truncate max-w-[220px]" title={adv}>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botón y Estado */}
              <div className="mt-4 pt-3 border-t border-slate-150 flex justify-between items-center">
                <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Estado: {sim.verifiedStatus}
                </span>
                <span className="text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5">
                  Ver requisitos completos
                  <ChevronDown className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista de Tabla Premium */
        <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="px-5 py-4">Banco</th>
                  <th className="px-5 py-4">Tasa</th>
                  <th className="px-5 py-4">Mensualidad Est.</th>
                  <th className="px-5 py-4">Ingreso Mínimo</th>
                  <th className="px-5 py-4">Endeudamiento (DTI)</th>
                  <th className="px-5 py-4">Comisión Apertura</th>
                  <th className="px-5 py-4">Avalúo Técnico</th>
                  <th className="px-5 py-4">Soporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {getSortedSimulations().map((sim, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {sim.bankName}
                      <span className="text-[10px] font-semibold text-slate-400 block">{sim.productName}</span>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-800">{sim.interestRate.toFixed(2)}%</td>
                    <td className="px-5 py-4 font-extrabold text-slate-900">${sim.monthlyPayment.toLocaleString('es-MX')}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">${sim.requiredIncome.toLocaleString('es-MX')}</td>
                    <td className={`px-5 py-4 font-bold ${sim.debtToIncomeRatio > 45 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {sim.debtToIncomeRatio}%
                    </td>
                    <td className="px-5 py-4 text-slate-500">${(sim.loanAmount * (sim.commission / 100)).toLocaleString('es-MX')} ({sim.commission}%)</td>
                    <td className="px-5 py-4 text-slate-500">${sim.appraisalCost.toLocaleString('es-MX')}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sim.verifiedStatus === 'Validado internamente' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {sim.verifiedStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
