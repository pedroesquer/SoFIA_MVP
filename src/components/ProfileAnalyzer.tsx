import React, { useState, useEffect } from 'react';
import { User, BankRate, MortgageFile } from '../types';
import { calculateMonthlyPayment, generateSimulationForBank } from '../mockData';
import { 
  Zap, 
  UserCheck, 
  Percent, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  Wallet,
  Play,
  Save,
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface ProfileAnalyzerProps {
  currentUser: User;
  rates: BankRate[];
  activeFile?: MortgageFile;
  onSaveAnalysis?: (analysisData: Partial<MortgageFile>) => void;
  onProceedToSimulation?: (selectedBankNames: string[]) => void;
}

export default function ProfileAnalyzer({ 
  currentUser, 
  rates, 
  activeFile, 
  onSaveAnalysis,
  onProceedToSimulation
}: ProfileAnalyzerProps) {
  // Local state initialized with active file or defaults
  const [age, setAge] = useState(activeFile?.age || 35);
  const [monthlyIncome, setMonthlyIncome] = useState(activeFile?.monthlyIncome || 50000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(activeFile?.monthlyExpenses || 15000);
  const [otherDebts, setOtherDebts] = useState(activeFile?.otherDebts || 5000);
  const [buroScore, setBuroScore] = useState(activeFile?.buro.score || 680);
  const [creditType, setCreditType] = useState(activeFile?.creditType || 'Adquisición');
  const [requestedAmount, setRequestedAmount] = useState(activeFile?.requestedAmount || 2000000);
  const [propertyValue, setPropertyValue] = useState(activeFile?.propertyValue || 2500000);
  const [termYears, setTermYears] = useState(activeFile?.termYears || 20);
  const [economicActivity, setEconomicActivity] = useState(activeFile?.economicActivity || 'Asalariado');
  const [jobTenureMonths, setJobTenureMonths] = useState(activeFile?.jobTenureMonths || 24);
  const [observations, setObservations] = useState(activeFile?.observations || '');

  const [diagnosticRun, setDiagnosticRun] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
    overallScore: number;
    paymentToIncomeRatio: number;
    debtToIncomeRatio: number;
    estimatedMonthlyPayment: number;
    viableBanks: { name: string; productName: string; rate: number; monthlyPayment: number; viability: 'Alta' | 'Media' | 'Baja'; reason: string }[];
    rejectedBanks: { name: string; reason: string }[];
    strengths: string[];
    alerts: string[];
    recommendation: string;
  } | null>(null);

  // Auto-fill when activeFile changes
  useEffect(() => {
    if (activeFile) {
      setAge(activeFile.age);
      setMonthlyIncome(activeFile.monthlyIncome);
      setMonthlyExpenses(activeFile.monthlyExpenses);
      setOtherDebts(activeFile.otherDebts);
      setBuroScore(activeFile.buro.score || 650);
      setCreditType(activeFile.creditType);
      setRequestedAmount(activeFile.requestedAmount);
      setPropertyValue(activeFile.propertyValue);
      setTermYears(activeFile.termYears);
      setEconomicActivity(activeFile.economicActivity);
      setJobTenureMonths(activeFile.jobTenureMonths);
      setObservations(activeFile.observations);
      setDiagnosticRun(false);
      setDiagnostics(null);
    }
  }, [activeFile]);

  const runRiskAnalysis = () => {
    // 1. Calculate weighted average monthly payment based on current available rates
    const avgRate = rates.reduce((sum, r) => sum + r.interestRate, 0) / (rates.length || 1);
    const estimatedMonthlyPayment = calculateMonthlyPayment(requestedAmount, avgRate, termYears);

    // 2. Compute payment-to-income and debt-to-income ratios
    const paymentToIncomeRatio = Math.round((estimatedMonthlyPayment / monthlyIncome) * 100);
    const totalCommitments = estimatedMonthlyPayment + otherDebts;
    const debtToIncomeRatio = Math.round((totalCommitments / monthlyIncome) * 100);

    // 3. Define strengths & alerts lists
    const strengths: string[] = [];
    const alerts: string[] = [];
    let overallScore = 100;

    // Evaluate loan-to-value (LTV)
    const ltv = Math.round((requestedAmount / propertyValue) * 100);
    if (ltv <= 80) {
      strengths.push(`Excelente aforo / enganche. El aforo solicitado es del ${ltv}%, lo que reduce el perfil de riesgo ante comités de crédito.`);
    } else if (ltv > 90) {
      alerts.push(`Aforo elevado (${ltv}%). La mayoría de los bancos limitan el financiamiento al 90% para Adquisición. Requiere enganche propio del 10% más gastos de escrituración.`);
      overallScore -= 15;
    }

    // Evaluate Buro
    if (buroScore >= 700) {
      strengths.push(`Historial crediticio premium. El score estimado es de ${buroScore} puntos, lo que califica para tasas preferenciales.`);
    } else if (buroScore < 630) {
      alerts.push(`Historial crediticio comprometido (${buroScore} puntos). Riesgo elevado de rechazo automático en la precalificación de algunos bancos.`);
      overallScore -= 20;
    } else {
      strengths.push(`Historial crediticio estable (${buroScore} puntos) dentro de parámetros de precalificación general.`);
    }

    // Evaluate job tenure & activity
    if (economicActivity === 'Asalariado') {
      if (jobTenureMonths >= 24) {
        strengths.push(`Estabilidad laboral sólida. Cuenta con ${jobTenureMonths} meses de antigüedad en su empleo actual.`);
      } else if (jobTenureMonths < 12) {
        alerts.push(`Antigüedad laboral ajustada (${jobTenureMonths} meses). Se requieren mínimo 12 meses de continuidad de cotización IMSS/Nómina.`);
        overallScore -= 10;
      }
    } else {
      if (jobTenureMonths >= 36) {
        strengths.push(`Trayectoria de negocio probada. Suma más de 3 años comprobables en su actividad comercial.`);
      } else if (jobTenureMonths < 24) {
        alerts.push(`Inicio de actividad comercial reciente (${jobTenureMonths} meses). Los bancos usualmente solicitan mínimo 2 años de declaraciones anuales fiscales.`);
        overallScore -= 15;
      }
    }

    // Evaluate Debt Ratio (DTI)
    if (debtToIncomeRatio <= 35) {
      strengths.push(`Excelente capacidad de endeudamiento global (${debtToIncomeRatio}%).`);
    } else if (debtToIncomeRatio > 50) {
      alerts.push(`Índice de endeudamiento crítico (${debtToIncomeRatio}%). La mensualidad del crédito hipotecario más deudas externas excede el 50% de sus ingresos comprobables.`);
      overallScore -= 30;
    } else if (debtToIncomeRatio > 40) {
      alerts.push(`Índice de endeudamiento en el límite de riesgo (${debtToIncomeRatio}%). Requiere mitigación consolidando saldos menores.`);
      overallScore -= 15;
    }

    // Evaluate Age limits
    const ageAtMaturity = age + termYears;
    if (ageAtMaturity > 75) {
      alerts.push(`La edad al vencimiento del crédito (${ageAtMaturity} años) excede la política de Scotiabank, Santander y Banorte (límite 75 años).`);
      overallScore -= 25;
    } else if (ageAtMaturity > 70) {
      strengths.push(`Edad al vencimiento (${ageAtMaturity} años) califica en la mayoría de las políticas bancarias.`);
    }

    // 4. Score to risk translation
    let riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Bajo';
    if (overallScore >= 80) riskLevel = 'Bajo';
    else if (overallScore >= 60) riskLevel = 'Medio';
    else if (overallScore >= 40) riskLevel = 'Alto';
    else riskLevel = 'Crítico';

    // 5. Evaluate viable and rejected banks
    const viableBanks: typeof diagnostics.viableBanks = [];
    const rejectedBanks: typeof diagnostics.rejectedBanks = [];

    rates.forEach(rate => {
      const bankPayment = calculateMonthlyPayment(requestedAmount, rate.interestRate, termYears);
      const bankDti = Math.round(((bankPayment + otherDebts) / monthlyIncome) * 100);
      const limitAge = rate.bankName === 'BBVA' ? 80 : 75;

      let bankViability: 'Alta' | 'Media' | 'Baja' = 'Alta';
      let reason = '';

      if (age + termYears > limitAge) {
        rejectedBanks.push({ name: rate.bankName, reason: `Excede edad límite del banco: ${age + termYears} años (máx. ${limitAge})` });
        return;
      }

      if (buroScore < 600) {
        rejectedBanks.push({ name: rate.bankName, reason: `Score de Buró (${buroScore}) insuficiente para precalificar.` });
        return;
      }

      if (bankDti > 55) {
        bankViability = 'Baja';
        reason = `Relación de endeudamiento muy elevada (${bankDti}%). Alto riesgo de rechazo por el analista del banco.`;
      } else if (bankDti > 42) {
        bankViability = 'Media';
        reason = `Relación de endeudamiento moderadamente alta (${bankDti}%). Requiere comprobación detallada de ingresos adicionales.`;
      } else {
        bankViability = 'Alta';
        reason = `Capacidad de pago óptima. Endeudamiento global de apenas el ${bankDti}% del ingreso reportado.`;
      }

      viableBanks.push({
        name: rate.bankName,
        productName: rate.productName,
        rate: rate.interestRate,
        monthlyPayment: bankPayment,
        viability: bankViability,
        reason
      });
    });

    let recommendation = '';
    if (riskLevel === 'Bajo') {
      recommendation = `Proceder de inmediato con Scotiabank (Tasa 9.90%) o BBVA. El perfil es sumamente robusto y goza de excelente aforo (${ltv}%). Se recomienda iniciar flujo de firmas de Buró para precalificación formal.`;
    } else if (riskLevel === 'Medio') {
      recommendation = `El perfil es viable, pero se sugiere consolidar deudas menores ($${otherDebts.toLocaleString('es-MX')} MXN mensuales actuales) para optimizar la relación DTI. Banorte o Santander son excelentes opciones de análisis alternativo.`;
    } else if (riskLevel === 'Alto') {
      recommendation = `Se aconseja ingresar un co-acreditado (cónyuge o padres de primer grado) para aumentar el ingreso comprobado o disminuir el monto del crédito solicitado a un aforo de máximo el 80%. Citibanamex o Afirme podrían revisar este caso mediante comités de crédito excepcionales.`;
    } else {
      recommendation = `Caso altamente comprometido. Rediseñar el expediente disminuyendo drásticamente el monto solicitado, aportando mayor enganche propio, o liquidando compromisos de corto plazo de manera prioritaria.`;
    }

    setDiagnostics({
      riskLevel,
      overallScore,
      paymentToIncomeRatio,
      debtToIncomeRatio,
      estimatedMonthlyPayment,
      viableBanks,
      rejectedBanks,
      strengths,
      alerts,
      recommendation
    });
    setDiagnosticRun(true);
  };

  const handleSave = () => {
    if (onSaveAnalysis) {
      onSaveAnalysis({
        age,
        monthlyIncome,
        monthlyExpenses,
        otherDebts,
        creditType,
        requestedAmount,
        propertyValue,
        termYears,
        economicActivity,
        jobTenureMonths,
        observations,
        lastAnalysisDate: new Date().toISOString().split('T')[0]
      });
      alert('¡Diagnóstico de riesgo guardado con éxito en el expediente del cliente!');
    }
  };

  const handleSimulationRedirect = () => {
    if (onProceedToSimulation && diagnostics) {
      const viableBankNames = diagnostics.viableBanks.map(b => b.name);
      onProceedToSimulation(viableBankNames);
    }
  };

  return (
    <div className="space-y-6" id="risk-analyzer-view">
      <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-600" />
          Analizador de Perfil y Diagnóstico de Riesgo
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {activeFile 
            ? `Estructurando el diagnóstico financiero de: ${activeFile.name}` 
            : 'Simulador financiero integral para prospectos externos. Determina viabilidad y perfil de riesgos de crédito.'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulario de Entrada */}
        <div className="xl:col-span-1 bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="h-4.5 w-4.5 text-slate-400" />
            Parámetros del Cliente
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Edad del cliente</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Score Buró Est.</label>
              <input 
                type="number" 
                value={buroScore} 
                onChange={(e) => setBuroScore(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actividad Económica</label>
            <select 
              value={economicActivity} 
              onChange={(e) => setEconomicActivity(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
            >
              <option value="Asalariado">Asalariado (Nómina / CFDI)</option>
              <option value="Independiente / Persona Física con Actividad Empresarial">Independiente (PFAE)</option>
              <option value="Empresario">Empresario (Persona Moral / Accionista)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Antigüedad (meses)</label>
              <input 
                type="number" 
                value={jobTenureMonths} 
                onChange={(e) => setJobTenureMonths(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tipo de Crédito</label>
              <select 
                value={creditType} 
                onChange={(e) => setCreditType(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="Adquisición">Adquisición</option>
                <option value="Liquidez">Liquidez</option>
                <option value="Construcción">Construcción</option>
                <option value="Sustitución de Hipoteca">Sustitución</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monto Solicitado (Crédito)</label>
            <input 
              type="number" 
              value={requestedAmount} 
              onChange={(e) => setRequestedAmount(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Valor de Propiedad</label>
              <input 
                type="number" 
                value={propertyValue} 
                onChange={(e) => setPropertyValue(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plazo (Años)</label>
              <select 
                value={termYears} 
                onChange={(e) => setTermYears(parseInt(e.target.value) || 20)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500 cursor-pointer"
              >
                <option value="5">5 años</option>
                <option value="10">10 años</option>
                <option value="15">15 años</option>
                <option value="20">20 años</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ingreso Mensual Comprobable</label>
            <input 
              type="number" 
              value={monthlyIncome} 
              onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gastos Estimados</label>
              <input 
                type="number" 
                value={monthlyExpenses} 
                onChange={(e) => setMonthlyExpenses(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Deudas externas (Buró)</label>
              <input 
                type="number" 
                value={otherDebts} 
                onChange={(e) => setOtherDebts(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Observaciones de Perfil</label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notas del broker sobre el origen de ingresos, etc."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-3 outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button 
              onClick={runRiskAnalysis}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
            >
              <Play className="h-4 w-4" /> Ejecutar Diagnóstico
            </button>
            {activeFile && (
              <button 
                onClick={handleSave}
                className="p-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                title="Guardar en Expediente"
              >
                <Save className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* Diagnóstico de Resultados */}
        <div className="xl:col-span-2 space-y-6">
          {diagnosticRun && diagnostics ? (
            <div className="space-y-6">
              {/* Scorecard de Diagnóstico */}
              <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                      diagnostics.riskLevel === 'Bajo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      diagnostics.riskLevel === 'Medio' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      diagnostics.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Riesgo {diagnostics.riskLevel}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-2.5">
                      Viabilidad Operativa Estimada: <strong className="text-slate-900">{diagnostics.overallScore} / 100 puntos</strong>
                    </h3>
                  </div>
                  
                  {/* Gauge Meter (Custom SVG) */}
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <circle cx="24" cy="24" r="20" stroke={diagnostics.riskLevel === 'Bajo' ? '#10b981' : diagnostics.riskLevel === 'Medio' ? '#f59e0b' : '#f43f5e'} strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * diagnostics.overallScore / 100)} />
                      </svg>
                      <span className="absolute text-xs font-bold text-slate-800">{diagnostics.overallScore}%</span>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Tasa de Acierto</p>
                      <p className="text-xs font-bold text-slate-700">Precalificación Operativa</p>
                    </div>
                  </div>
                </div>

                {/* Métricas Estimadas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 mt-5 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mensualidad Hipotecaria Est.</p>
                    <p className="text-lg font-bold text-slate-800 mt-0.5">${diagnostics.estimatedMonthlyPayment.toLocaleString('es-MX')} MXN</p>
                    <p className="text-[10px] text-slate-400 mt-1">Con base en tasa promedio</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Pago vs Ingresos (Mensualidad)</p>
                    <p className={`text-lg font-bold mt-0.5 ${diagnostics.paymentToIncomeRatio > 40 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {diagnostics.paymentToIncomeRatio}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Recomendado máximo 40%</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Endeudamiento Global (DTI)</p>
                    <p className={`text-lg font-bold mt-0.5 ${diagnostics.debtToIncomeRatio > 45 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {diagnostics.debtToIncomeRatio}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Límite bancario usual 45% - 50%</p>
                  </div>
                </div>

                {/* Recomendación Textual */}
                <div className="mt-5 p-4 bg-slate-50 border border-slate-150 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Recomendación Operativa CREDIDIEZ
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{diagnostics.recommendation}</p>
                </div>
              </div>

              {/* Fortalezas vs Alertas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-150 px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Fortalezas de Viabilidad
                  </h4>
                  <ul className="space-y-2">
                    {diagnostics.strengths.map((st, idx) => (
                      <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{st}</span>
                      </li>
                    ))}
                    {diagnostics.strengths.length === 0 && (
                      <li className="text-xs text-slate-400 italic">No se identificaron fortalezas críticas en este perfil.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-150 px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    Alertas de Riesgo / Políticas
                  </h4>
                  <ul className="space-y-2">
                    {diagnostics.alerts.map((al, idx) => (
                      <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                        <span className="text-rose-500 font-bold mt-0.5">⚠️</span>
                        <span>{al}</span>
                      </li>
                    ))}
                    {diagnostics.alerts.length === 0 && (
                      <li className="text-xs text-slate-400 italic">¡Excelente! El perfil no reporta alertas de riesgo regulatorias.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Tabla de Viabilidad por Institución */}
              <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Diagnóstico de Viabilidad por Banco</h4>
                <div className="overflow-x-auto border border-slate-150 rounded-lg">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-150 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Banco</th>
                        <th className="px-4 py-3">Tasa Base</th>
                        <th className="px-4 py-3">Mensualidad Est.</th>
                        <th className="px-4 py-3">Viabilidad</th>
                        <th className="px-4 py-3">Diagnóstico Detallado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {diagnostics.viableBanks.map((bank, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{bank.name}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{bank.rate.toFixed(2)}%</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">${bank.monthlyPayment.toLocaleString('es-MX')}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              bank.viability === 'Alta' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              bank.viability === 'Media' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {bank.viability}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 leading-normal max-w-[250px] truncate" title={bank.reason}>{bank.reason}</td>
                        </tr>
                      ))}
                      {diagnostics.rejectedBanks.map((bank, idx) => (
                        <tr key={`rej-${idx}`} className="bg-slate-50/30">
                          <td className="px-4 py-3 font-bold text-slate-400">{bank.name}</td>
                          <td className="px-4 py-3 text-slate-400">-</td>
                          <td className="px-4 py-3 text-slate-400">-</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">Rechazado</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 leading-normal font-semibold text-rose-600/85">{bank.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Redirect Link to Simulator */}
                {onProceedToSimulation && (
                  <div className="mt-5 pt-4 border-t border-slate-150 flex justify-end">
                    <button 
                      onClick={handleSimulationRedirect}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 shadow-sm transition-all cursor-pointer"
                    >
                      <Percent className="h-4 w-4" />
                      Proceder a Simulación Detallada
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-150 border-dashed rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 h-[400px]">
              <HelpCircle className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Sin análisis activo</p>
              <p className="text-xs text-slate-400 max-w-sm leading-normal">
                Configura los parámetros del cliente en el panel de la izquierda y haz clic en <strong>Ejecutar Diagnóstico</strong> para procesar la viabilidad financiera e hipotecaria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
