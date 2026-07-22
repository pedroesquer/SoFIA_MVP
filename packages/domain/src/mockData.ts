import { BankRate, MortgageFile, SimulatedOffer, CRMStage } from './types';

export const INITIAL_BANK_RATES: BankRate[] = [
  {
    id: 'rate-1',
    bankName: 'Santander',
    productName: 'Hipoteca Santander Única',
    interestRate: 10.15,
    cat: 12.1,
    commission: 1.0,
    appraisalCost: 3.5, // per mill (al millar) of property value
    lastUpdated: '2026-07-09',
    source: 'Circular 24-Santander & Portal Broker',
    verifiedBy: 'Mesa de Control CREDIDIEZ',
    status: 'Validado internamente',
    trustLevel: 'Crítico',
    requirements: [
      'Edad de 21 a 75 años (edad + plazo < 75)',
      'Ingreso mínimo comprobable de $15,000 MXN',
      'Antigüedad laboral de 12 meses',
      'Buen historial crediticio (Buró de Crédito >= 650)'
    ],
    advantages: [
      'Tasa preferencial competitiva',
      'Sin comisión por prepago',
      'Excelente esquema de seguros integrados'
    ],
    risks: [
      'Comisión de apertura rígida del 1%',
      'Costos notariales elevados con convenios específicos',
      'Penalización leve si se demora el pago de seguros'
    ]
  },
  {
    id: 'rate-2',
    bankName: 'Banorte',
    productName: 'Hipoteca Fuerte Banorte',
    interestRate: 10.25,
    cat: 12.3,
    commission: 1.25,
    appraisalCost: 3.0,
    lastUpdated: '2026-07-08',
    source: 'Boletín de Tasas Banorte Julio',
    verifiedBy: 'Gerencia Nacional de Alianzas',
    status: 'Actualizado',
    trustLevel: 'Alto',
    requirements: [
      'Edad de 20 a 69 años',
      'Ingreso mínimo de $12,000 MXN (puede mancomunar)',
      'Antigüedad laboral mínima de 2 años si es independiente',
      'Buen comportamiento de Buró'
    ],
    advantages: [
      'Financiamiento hasta el 90% del valor de la propiedad',
      'Excelente opción para ingresos mixtos (asalariado + comisiones)',
      'Aprobación rápida en menos de 48 horas'
    ],
    risks: [
      'Tasa de interés variable según el perfil de riesgo del cliente',
      'Comisión de apertura de 1.25%',
      'Seguro de desempleo obligatorio'
    ]
  },
  {
    id: 'rate-3',
    bankName: 'Scotiabank',
    productName: 'Hipoteca Scotiabank 7X',
    interestRate: 9.90,
    cat: 11.9,
    commission: 0.0, // Promo especial de verano
    appraisalCost: 4.0,
    lastUpdated: '2026-07-10',
    source: 'Ficha Técnica Scotia-Promo Verano',
    verifiedBy: 'Mesa de Control CREDIDIEZ',
    status: 'Validado internamente',
    trustLevel: 'Crítico',
    requirements: [
      'Edad de 25 a 74 años',
      'Ingreso mínimo mensual de $20,000 MXN',
      'Antigüedad laboral de 1 año',
      'Score de Buró mínimo de 680'
    ],
    advantages: [
      'Comisión por apertura del 0% durante la vigencia de la campaña',
      'Tasa fija por debajo de los dos dígitos (9.90%)',
      'Pagos fijos garantizados'
    ],
    risks: [
      'Costo de avalúo un poco por encima del mercado',
      'Políticas de riesgo muy estrictas con independientes',
      'Requiere contratación de nómina para mantener tasa'
    ]
  },
  {
    id: 'rate-4',
    bankName: 'HSBC',
    productName: 'Hipoteca HSBC Fija Pago Bajo',
    interestRate: 10.45,
    cat: 12.6,
    commission: 1.0,
    appraisalCost: 3.2,
    lastUpdated: '2026-07-01',
    source: 'Anexo de Tasas HSBC Premier',
    verifiedBy: 'Mesa de Control CREDIDIEZ',
    status: 'Requiere revisión',
    trustLevel: 'Medio',
    requirements: [
      'Edad de 22 a 75 años',
      'Ingreso mínimo comprobable de $15,000 MXN',
      '6 meses de antigüedad en el empleo actual',
      'Buen historial crediticio'
    ],
    advantages: [
      'Mensualidades iniciales bajas con incrementos conocidos',
      'Excelente para perfiles jóvenes con expectativas de crecimiento',
      'Atención preferente si es cliente de nómina HSBC'
    ],
    risks: [
      'Tasa de interés base ligeramente más alta (10.45%)',
      'El pago mensual incrementa de forma programada anualmente',
      'Requiere revisión de tasas vigentes para no incurrir en desactualización'
    ]
  },
  {
    id: 'rate-5',
    bankName: 'Afirme',
    productName: 'Hipoteca Afirme Total',
    interestRate: 10.85,
    cat: 13.1,
    commission: 1.5,
    appraisalCost: 3.5,
    lastUpdated: '2026-06-15',
    source: 'Boletín Regional Afirme',
    verifiedBy: 'Control Interno Sede Monterrey',
    status: 'Desactualizado',
    trustLevel: 'Bajo',
    requirements: [
      'Edad de 21 a 70 años',
      'Ingreso mínimo de $15,000 MXN',
      'Antigüedad de 1 año en empleo actual o 2 años de actividad independiente',
      'Score de Buró >= 640'
    ],
    advantages: [
      'Flexibilidad notable para personas con actividad empresarial',
      'Excelente atención personalizada a nivel broker regional',
      'Acepta copropietarios de primer grado'
    ],
    risks: [
      'Tasa de interés de 10.85% más alta que el promedio',
      'Comisión de apertura de 1.50%',
      'Tasa desactualizada al 15/06/2026 - Requiere confirmación directa'
    ]
  },
  {
    id: 'rate-6',
    bankName: 'BBVA',
    productName: 'Hipoteca BBVA Fija',
    interestRate: 10.10,
    cat: 12.0,
    commission: 1.0,
    appraisalCost: 3.0,
    lastUpdated: '2026-07-09',
    source: 'Portal Operativo BBVA Bancomer',
    verifiedBy: 'Gerente Comercial BBVA-CREDIDIEZ',
    status: 'Validado internamente',
    trustLevel: 'Crítico',
    requirements: [
      'Edad de 18 a 70 años (edad + plazo < 80)',
      'Ingreso mínimo de $15,000 MXN',
      'Antigüedad laboral de 3 meses (nómina BBVA) o 1 año',
      'Buró sin deudas vencidas'
    ],
    advantages: [
      'Excelente soporte digital de punta a punta',
      'Criterio de aprobación automatizado rápido',
      'Seguro de daños cubre valor de construcción y terreno comercializado'
    ],
    risks: [
      'Cargos administrativos fijos mensuales de $250 MXN',
      'No se permiten abonos a capital por debajo de cierto monto',
      'Penalidad si se cambia de cuenta de nómina asociada'
    ]
  },
  {
    id: 'rate-7',
    bankName: 'Banamex',
    productName: 'Hipoteca Citibanamex Perfiles',
    interestRate: 10.30,
    cat: 12.4,
    commission: 1.0,
    appraisalCost: 3.3,
    lastUpdated: '2026-07-05',
    source: 'Manual de Políticas Citibanamex v12',
    verifiedBy: 'Mesa de Control CREDIDIEZ',
    status: 'Actualizado',
    trustLevel: 'Alto',
    requirements: [
      'Edad de 23 a 69 años',
      'Ingreso mínimo mensual de $15,000 MXN',
      'Antigüedad laboral mínima de 1 año',
      'Score de Buró >= 660'
    ],
    advantages: [
      'Excelente atención en sucursales a nivel nacional',
      'Esquema de pagos fijos o crecientes elegibles',
      'Se pueden mancomunar ingresos con cónyuges, padres e hijos'
    ],
    risks: [
      'El proceso de escrituración suele demorar un poco más',
      'Comisión por apertura fija del 1%',
      'Políticas rígidas para ingresos en efectivo de comerciantes'
    ]
  }
];

// Calculation utility: PMT Formula
// monthly_payment = (monthly_rate * PV) / (1 - (1 + monthly_rate) ^ (-n))
export function calculateMonthlyPayment(loanAmount: number, annualRate: number, termYears: number): number {
  const monthlyRate = (annualRate / 12) / 100;
  const totalMonths = termYears * 12;
  if (monthlyRate === 0) return loanAmount / totalMonths;
  const payment = (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
  return Math.round(payment);
}

// Generate an individual SimulatedOffer based on client metrics and a target BankRate
export function generateSimulationForBank(
  client: {
    requestedAmount: number;
    propertyValue: number;
    termYears: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    otherDebts: number;
    age: number;
    economicActivity: string;
    jobTenureMonths: number;
    buroScore: number;
  },
  rate: BankRate
): SimulatedOffer {
  const monthlyPayment = calculateMonthlyPayment(client.requestedAmount, rate.interestRate, client.termYears);
  const requiredIncome = Math.round(monthlyPayment / 0.40); // payment max 40% of income
  const totalMonthlyCommitment = monthlyPayment + client.otherDebts;
  const debtToIncomeRatio = Math.round((totalMonthlyCommitment / client.monthlyIncome) * 100);

  // Determine viability score
  let viabilityScore = 100;
  
  // Debt to income penalties
  if (debtToIncomeRatio > 55) viabilityScore -= 40;
  else if (debtToIncomeRatio > 45) viabilityScore -= 20;
  else if (debtToIncomeRatio > 35) viabilityScore -= 5;

  // Age + Term limit (commonly 75 years, BBVA 80, afirme 70)
  const ageAtMaturity = client.age + client.termYears;
  if (ageAtMaturity > 75) {
    viabilityScore -= 30;
  }

  // Job tenure penalties
  if (client.economicActivity === 'Asalariado') {
    if (client.jobTenureMonths < 12) viabilityScore -= 15;
  } else {
    // independent needs 2 years
    if (client.jobTenureMonths < 24) viabilityScore -= 25;
  }

  // Buro score penalties
  if (client.buroScore < 600) viabilityScore -= 40;
  else if (client.buroScore < 650) viabilityScore -= 20;
  else if (client.buroScore >= 700) viabilityScore += 5; // boost

  let recommendation = '';
  if (viabilityScore >= 80) {
    recommendation = `Excelente viabilidad. El cliente califica holgadamente por relación pago/ingreso (${debtToIncomeRatio}%) y buen historial crediticio. Se recomienda proceder de inmediato con Scotiabank o Santander.`;
  } else if (viabilityScore >= 60) {
    recommendation = `Viabilidad media. El cliente califica para este banco, pero se debe vigilar la relación pago/ingreso (${debtToIncomeRatio}%). Es prudente comprobar ingresos adicionales o consolidar deudas menores para mejorar el perfil.`;
  } else {
    recommendation = `Riesgo de rechazo. Motivo principal: ${debtToIncomeRatio > 50 ? 'Capacidad de pago ajustada' : ''} ${ageAtMaturity > 75 ? 'Edad al término del plazo excede límite' : ''} ${client.buroScore < 620 ? 'Score de Buró bajo' : ''}. Se sugiere solicitar un co-acreditado o reducir el monto solicitado.`;
  }

  return {
    id: `sim-${rate.bankName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    bankName: rate.bankName,
    productName: rate.productName,
    interestRate: rate.interestRate,
    rateUpdatedDate: rate.lastUpdated.split('-').reverse().join('/'),
    cat: rate.cat,
    commission: rate.commission,
    appraisalCost: Math.round(client.propertyValue * (rate.appraisalCost / 1000)),
    termYears: client.termYears,
    monthlyPayment,
    loanAmount: client.requestedAmount,
    requiredIncome,
    debtToIncomeRatio,
    keyRequirements: rate.requirements,
    advantages: rate.advantages,
    risks: rate.risks,
    trustLevel: rate.trustLevel,
    verifiedStatus: rate.status,
    recommendation
  };
}

export const INITIAL_MORTGAGE_FILES: MortgageFile[] = [
  {
    id: 'file-1',
    advisorId: 'carlos.mendoza@credidiez.mx',
    name: 'Sofía Ramos Elizondo',
    email: 'sofia.ramos@gmail.com',
    phone: '811-234-5678',
    broker: 'carlos.mendoza@credidiez.mx',
    sede: 'Sede Centro Monterrey',
    requestedAmount: 2400000,
    propertyValue: 3000000,
    termYears: 20,
    creditType: 'Adquisición',
    monthlyIncome: 65000,
    monthlyExpenses: 18000,
    otherDebts: 6000,
    age: 34,
    economicActivity: 'Asalariado',
    jobTenureMonths: 48,
    observations: 'Cliente con excelente perfil. Labora como Directora de Marketing en empresa multinacional. Cuenta con el 20% del enganche de fondos propios.',
    stage: 'Prospecto',
    priority: 'Alta',
    nextAction: 'Iniciar diagnóstico de riesgo de perfil',
    lastAnalysisDate: '2026-07-10',
    documents: [
      { id: 'doc-1', name: 'Identificación oficial', status: 'Validado', uploadDate: '2026-07-10', responsible: 'Carlos Mendoza', remarks: 'INE vigente digitalizado por ambos lados en alta resolución.' },
      { id: 'doc-2', name: 'Comprobante de domicilio', status: 'Validado', uploadDate: '2026-07-10', responsible: 'Carlos Mendoza', remarks: 'Recibo de luz CFE menor a 2 meses.' },
      { id: 'doc-3', name: 'Estados de cuenta', status: 'En revisión', uploadDate: '2026-07-10', responsible: 'Carlos Mendoza', remarks: 'Últimos 3 meses de nómina Santander.' },
      { id: 'doc-4', name: 'Reporte de Buró', status: 'Pendiente' },
      { id: 'doc-5', name: 'Constancia de Situación Fiscal', status: 'Pendiente' },
      { id: 'doc-6', name: 'Comprobante de ingresos', status: 'En revisión', uploadDate: '2026-07-10', remarks: 'Recibos de nómina timbrados del último trimestre.' },
      { id: 'doc-7', name: 'Autorización de consulta de Buró firmada', status: 'Pendiente' }
    ],
    buro: {
      score: 692,
      activeAccounts: 4,
      paymentPunctuality: 'Excelente (99%)',
      riskAlerts: [],
      lastChecked: '2026-07-05',
      authStatus: 'Autorización pendiente'
    },
    simulatedOffers: [],
    logs: [
      { id: 'log-1-1', user: 'Carlos Mendoza', action: 'Registro del prospecto en plataforma SoFIA', timestamp: '2026-07-10T10:15:00-07:00' },
      { id: 'log-1-2', user: 'Carlos Mendoza', action: 'Digitalización y carga de INE y Comprobante de domicilio', timestamp: '2026-07-10T10:30:00-07:00' }
    ]
  },
  {
    id: 'file-2',
    advisorId: 'carlos.mendoza@credidiez.mx',
    name: 'Alejandro Garza Sada',
    email: 'alejandro.garza@hotmail.com',
    phone: '818-987-6543',
    broker: 'carlos.mendoza@credidiez.mx',
    sede: 'Sede Centro Monterrey',
    requestedAmount: 4800000,
    propertyValue: 6000000,
    termYears: 15,
    creditType: 'Adquisición',
    monthlyIncome: 140000,
    monthlyExpenses: 45000,
    otherDebts: 12000,
    age: 41,
    economicActivity: 'Independiente / Persona Física con Actividad Empresarial',
    jobTenureMonths: 72,
    observations: 'Cliente dueño de despacho de arquitectura de gran renombre en San Pedro Garza García. Ingresos variables por proyectos. Cuenta con 20% enganche.',
    stage: 'Docs integrados',
    priority: 'Alta',
    nextAction: 'Generar reporte comercial para envío de propuesta',
    lastAnalysisDate: '2026-07-09',
    documents: [
      { id: 'doc-1', name: 'Identificación oficial', status: 'Validado', uploadDate: '2026-07-08', responsible: 'Carlos Mendoza', remarks: 'Pasaporte mexicano vigente.' },
      { id: 'doc-2', name: 'Comprobante de domicilio', status: 'Validado', uploadDate: '2026-07-08', responsible: 'Carlos Mendoza', remarks: 'Recibo Telmex reciente.' },
      { id: 'doc-3', name: 'Estados de cuenta', status: 'Validado', uploadDate: '2026-07-09', responsible: 'Carlos Mendoza', remarks: 'Últimos 6 meses de cuentas empresariales y personales (Banregio).' },
      { id: 'doc-4', name: 'Reporte de Buró', status: 'Validado', uploadDate: '2026-07-09', responsible: 'Carlos Mendoza', remarks: 'Historial impecable.' },
      { id: 'doc-5', name: 'Constancia de Situación Fiscal', status: 'Validado', uploadDate: '2026-07-08', responsible: 'Carlos Mendoza', remarks: 'Régimen de Actividad Empresarial, activo.' },
      { id: 'doc-6', name: 'Comprobante de ingresos', status: 'Validado', uploadDate: '2026-07-09', responsible: 'Carlos Mendoza', remarks: 'Declaración anual 2025 y parciales 2026.' },
      { id: 'doc-7', name: 'Autorización de consulta de Buró firmada', status: 'Validado', uploadDate: '2026-07-08', responsible: 'Carlos Mendoza', remarks: 'Formato firmado autógrafamente y validado.' }
    ],
    buro: {
      score: 742,
      activeAccounts: 8,
      paymentPunctuality: 'Excelente (100%)',
      riskAlerts: [],
      lastChecked: '2026-07-09',
      authStatus: 'Autorización firmada',
      authDate: '2026-07-08'
    },
    simulatedOffers: [
      // Pre-simulate Scotiabank
      {
        id: 'sim-scotiabank-ale',
        bankName: 'Scotiabank',
        productName: 'Hipoteca Scotiabank 7X',
        interestRate: 9.90,
        rateUpdatedDate: '10/07/2026',
        cat: 11.9,
        commission: 0,
        appraisalCost: 24000,
        termYears: 15,
        monthlyPayment: 51280,
        loanAmount: 4800000,
        requiredIncome: 128200,
        debtToIncomeRatio: 45,
        keyRequirements: [
          'Edad de 25 a 74 años',
          'Ingreso mínimo mensual de $20,000 MXN',
          'Antigüedad laboral de 1 año',
          'Score de Buró mínimo de 680'
        ],
        advantages: [
          'Comisión por apertura del 0% durante la vigencia de la campaña',
          'Tasa fija por debajo de los dos dígitos (9.90%)',
          'Pagos fijos garantizados'
        ],
        risks: [
          'Costo de avalúo un poco por encima del mercado',
          'Políticas de riesgo muy estrictas con independientes'
        ],
        trustLevel: 'Crítico',
        verifiedStatus: 'Validado internamente',
        recommendation: 'Excelente viabilidad. Aunque es independiente, sus declaraciones fiscales sustentan holgadamente la capacidad de pago requerida de $128,200 MXN mensuales.'
      },
      // Pre-simulate Santander
      {
        id: 'sim-santander-ale',
        bankName: 'Santander',
        productName: 'Hipoteca Santander Única',
        interestRate: 10.15,
        rateUpdatedDate: '09/07/2026',
        cat: 12.1,
        commission: 1,
        appraisalCost: 21000,
        termYears: 15,
        monthlyPayment: 52024,
        loanAmount: 4800000,
        requiredIncome: 130060,
        debtToIncomeRatio: 46,
        keyRequirements: [
          'Edad de 21 a 75 años (edad + plazo < 75)',
          'Ingreso mínimo comprobable de $15,000 MXN',
          'Antigüedad laboral de 12 meses',
          'Buen historial crediticio (Buró de Crédito >= 650)'
        ],
        advantages: [
          'Tasa preferencial competitiva',
          'Sin comisión por prepago',
          'Excelente esquema de seguros integrados'
        ],
        risks: [
          'Comisión de apertura del 1% ($48,000 MXN)',
          'Políticas estrictas con firmas independientes'
        ],
        trustLevel: 'Crítico',
        verifiedStatus: 'Validado internamente',
        recommendation: 'Viabilidad Alta. Santander ve con buenos ojos el score de 742 en Buró. La comisión de apertura del 1% es negociable por volumen de corretaje.'
      }
    ],
    logs: [
      { id: 'log-2-1', user: 'Carlos Mendoza', action: 'Registro de expediente completo', timestamp: '2026-07-08T09:00:00-07:00' },
      { id: 'log-2-2', user: 'Carlos Mendoza', action: 'Validación de autorización de Buró de Crédito', timestamp: '2026-07-08T11:20:00-07:00' },
      { id: 'log-2-3', user: 'Carlos Mendoza', action: 'Consulta exitosa de Reporte de Buró con Score 742', timestamp: '2026-07-09T14:40:00-07:00' },
      { id: 'log-2-4', user: 'Carlos Mendoza', action: 'Generación de simulaciones preliminares (Scotiabank, Santander)', timestamp: '2026-07-09T15:10:00-07:00' }
    ]
  },
  {
    id: 'file-3',
    advisorId: 'carlos.mendoza@credidiez.mx',
    name: 'Mariana Villarreal Cantú',
    email: 'mariana.v@villarreal.mx',
    phone: '812-444-5566',
    broker: 'carlos.mendoza@credidiez.mx',
    sede: 'Sede Centro Monterrey',
    requestedAmount: 1800000,
    propertyValue: 2200000,
    termYears: 20,
    creditType: 'Adquisición',
    monthlyIncome: 42000,
    monthlyExpenses: 15000,
    otherDebts: 8000,
    age: 28,
    economicActivity: 'Asalariado',
    jobTenureMonths: 18,
    observations: 'Cliente joven, primer crédito hipotecario. Cuenta con apoyo familiar para el enganche. Buró con score medio pero sin atrasos actuales.',
    stage: 'Enviado a banco',
    priority: 'Media',
    nextAction: 'Monitorear respuesta de aprobación de Banorte',
    lastAnalysisDate: '2026-07-05',
    documents: [
      { id: 'doc-1', name: 'Identificación oficial', status: 'Validado', uploadDate: '2026-07-03' },
      { id: 'doc-2', name: 'Comprobante de domicilio', status: 'Validado', uploadDate: '2026-07-03' },
      { id: 'doc-3', name: 'Estados de cuenta', status: 'Validado', uploadDate: '2026-07-04' },
      { id: 'doc-4', name: 'Reporte de Buró', status: 'Validado', uploadDate: '2026-07-04' },
      { id: 'doc-5', name: 'Constancia de Situación Fiscal', status: 'Validado', uploadDate: '2026-07-03' },
      { id: 'doc-6', name: 'Comprobante de ingresos', status: 'Validado', uploadDate: '2026-07-04' },
      { id: 'doc-7', name: 'Autorización de consulta de Buró firmada', status: 'Validado', uploadDate: '2026-07-03' }
    ],
    buro: {
      score: 665,
      activeAccounts: 3,
      paymentPunctuality: 'Excelente (97%)',
      riskAlerts: [],
      lastChecked: '2026-07-04',
      authStatus: 'Autorización firmada',
      authDate: '2026-07-03'
    },
    simulatedOffers: [
      {
        id: 'sim-banorte-mariana',
        bankName: 'Banorte',
        productName: 'Hipoteca Fuerte Banorte',
        interestRate: 10.25,
        rateUpdatedDate: '08/07/2026',
        cat: 12.3,
        commission: 1.25,
        appraisalCost: 6600,
        termYears: 20,
        monthlyPayment: 17684,
        loanAmount: 1800000,
        requiredIncome: 44210,
        debtToIncomeRatio: 61, // slightly high
        keyRequirements: ['Edad de 20 a 69 años', 'Ingreso mínimo de $12,000 MXN', 'Buen comportamiento de Buró'],
        advantages: ['Financiamiento hasta 90%', 'Aprobación ágil en menos de 48 horas'],
        risks: ['Tasa variable según perfil', 'Comisión del 1.25%'],
        trustLevel: 'Alto',
        verifiedStatus: 'Actualizado',
        recommendation: 'Viabilidad Media. La relación de endeudamiento supera ligeramente el 60% sumando otras deudas de tarjeta, por lo que el analista de Banorte solicitó liquidar una cuenta de crédito revolvente antes de formalizar.'
      }
    ],
    logs: [
      { id: 'log-3-1', user: 'Carlos Mendoza', action: 'Registro inicial de Mariana Villarreal', timestamp: '2026-07-03T11:00:00-07:00' },
      { id: 'log-3-2', user: 'Carlos Mendoza', action: 'Carga completa de expediente y firmas de Buró', timestamp: '2026-07-04T15:00:00-07:00' },
      { id: 'log-3-3', user: 'Carlos Mendoza', action: 'Generación de simulación Banorte Fuerte', timestamp: '2026-07-04T16:20:00-07:00' },
      { id: 'log-3-4', user: 'Carlos Mendoza', action: 'Envío formal de solicitud al portal del banco Banorte', timestamp: '2026-07-05T09:30:00-07:00' }
    ]
  },
  {
    id: 'file-4',
    advisorId: 'carlos.mendoza@credidiez.mx',
    name: 'Roberto Cantú Cantú',
    email: 'roberto.cantu@coporativos.mx',
    phone: '333-111-2233',
    broker: 'sofia.martinez@credidiez.mx', // direct center director client or colleague assignment
    sede: 'Sede Centro Monterrey',
    requestedAmount: 3500000,
    propertyValue: 5000000,
    termYears: 10,
    creditType: 'Liquidez',
    monthlyIncome: 110000,
    monthlyExpenses: 30000,
    otherDebts: 0,
    age: 48,
    economicActivity: 'Asalariado',
    jobTenureMonths: 120,
    observations: 'Director Jurídico Regional. Solicita un crédito de liquidez con garantía hipotecaria para inversión en expansión de negocio familiar.',
    stage: 'Aprobado',
    priority: 'Media',
    nextAction: 'Coordinar avalúo técnico e inicio del proceso notarial',
    lastAnalysisDate: '2026-07-08',
    documents: [
      { id: 'doc-1', name: 'Identificación oficial', status: 'Validado', uploadDate: '2026-07-05' },
      { id: 'doc-2', name: 'Comprobante de domicilio', status: 'Validado', uploadDate: '2026-07-05' },
      { id: 'doc-3', name: 'Estados de cuenta', status: 'Validado', uploadDate: '2026-07-06' },
      { id: 'doc-4', name: 'Reporte de Buró', status: 'Validado', uploadDate: '2026-07-06' },
      { id: 'doc-5', name: 'Constancia de Situación Fiscal', status: 'Validado', uploadDate: '2026-07-05' },
      { id: 'doc-6', name: 'Comprobante de ingresos', status: 'Validado', uploadDate: '2026-07-06' },
      { id: 'doc-7', name: 'Autorización de consulta de Buró firmada', status: 'Validado', uploadDate: '2026-07-05' }
    ],
    buro: {
      score: 785,
      activeAccounts: 5,
      paymentPunctuality: 'Excelente (100%)',
      riskAlerts: [],
      lastChecked: '2026-07-06',
      authStatus: 'Autorización firmada',
      authDate: '2026-07-05'
    },
    simulatedOffers: [
      {
        id: 'sim-bbva-roberto',
        bankName: 'BBVA',
        productName: 'Hipoteca BBVA Fija',
        interestRate: 10.10,
        rateUpdatedDate: '09/07/2026',
        cat: 12.0,
        commission: 1,
        appraisalCost: 15000,
        termYears: 10,
        monthlyPayment: 46487,
        loanAmount: 3500000,
        requiredIncome: 116200,
        debtToIncomeRatio: 42,
        keyRequirements: ['Edad de 18 a 70 años', 'Ingreso mínimo de $15,000 MXN', 'Buró impecable'],
        advantages: ['Proceso digital sumamente ágil', 'Aprobación automatizada rápida'],
        risks: ['Gasto de administración de $250 MXN mensuales'],
        trustLevel: 'Crítico',
        verifiedStatus: 'Validado internamente',
        recommendation: 'Aprobado formalmente por BBVA. Se emitió certificado de pre-aprobación y el banco asignó notaría para formalización. El cliente aceptó tasa preferencial del 10.10%.'
      }
    ],
    logs: [
      { id: 'log-4-1', user: 'Sofia Martinez', action: 'Registro del cliente Roberto Cantú', timestamp: '2026-07-05T14:00:00-07:00' },
      { id: 'log-4-2', user: 'Sofia Martinez', action: 'Integración de documentos fiscales y comprobación de ingresos', timestamp: '2026-07-06T11:00:00-07:00' },
      { id: 'log-4-3', user: 'Sofia Martinez', action: 'Envío formal a BBVA Hipotecario', timestamp: '2026-07-07T09:15:00-07:00' },
      { id: 'log-4-4', user: 'Mesa de Control CREDIDIEZ', action: 'Aprobación recibida y registrada con éxito', timestamp: '2026-07-08T16:45:00-07:00' }
    ]
  },
  {
    id: 'file-5',
    advisorId: 'carlos.mendoza@credidiez.mx',
    name: 'Diana Leticia Ruiz',
    email: 'diana_ruiz@guadalajara.com',
    phone: '331-555-8899',
    broker: 'maria.gomez@credidiez.mx', // Sede Guadalajara
    sede: 'Sede Guadalajara',
    requestedAmount: 1200000,
    propertyValue: 1800000,
    termYears: 15,
    creditType: 'Construcción',
    monthlyIncome: 25000,
    monthlyExpenses: 12000,
    otherDebts: 5000,
    age: 52,
    economicActivity: 'Independiente / Persona Física con Actividad Empresarial',
    jobTenureMonths: 14,
    observations: 'Comerciante de calzado en la zona de Guadalajara. Desea financiamiento para construir segundo piso de vivienda actual. Ingresos difíciles de comprobar fuera de depósitos mensuales.',
    stage: 'Rechazado',
    priority: 'Baja',
    nextAction: 'Buscar alternativa con Cofinavit o reestructurar expediente',
    lastAnalysisDate: '2026-06-25',
    documents: [
      { id: 'doc-1', name: 'Identificación oficial', status: 'Validado', uploadDate: '2026-06-20' },
      { id: 'doc-2', name: 'Comprobante de domicilio', status: 'Validado', uploadDate: '2026-06-20' },
      { id: 'doc-3', name: 'Estados de cuenta', status: 'Rechazado', uploadDate: '2026-06-21', remarks: 'Los estados de cuenta presentan demasiados depósitos en efectivo que el banco no pondera al 100%.' },
      { id: 'doc-4', name: 'Reporte de Buró', status: 'Validado', uploadDate: '2026-06-22' },
      { id: 'doc-5', name: 'Constancia de Situación Fiscal', status: 'Validado', uploadDate: '2026-06-20' },
      { id: 'doc-6', name: 'Comprobante de ingresos', status: 'Rechazado', uploadDate: '2026-06-21', remarks: 'Notas de compraventa informales no sustituyen comprobación fiscal.' },
      { id: 'doc-7', name: 'Autorización de consulta de Buró firmada', status: 'Validado', uploadDate: '2026-06-20' }
    ],
    buro: {
      score: 590, // Low Score
      activeAccounts: 6,
      paymentPunctuality: 'Regular (85%)',
      riskAlerts: ['Retraso de más de 60 días en tarjeta comercial'],
      lastChecked: '2026-06-22',
      authStatus: 'Autorización firmada',
      authDate: '2026-06-20'
    },
    simulatedOffers: [
      {
        id: 'sim-afirme-diana',
        bankName: 'Afirme',
        productName: 'Hipoteca Afirme Total',
        interestRate: 10.85,
        rateUpdatedDate: '15/06/2026',
        cat: 13.1,
        commission: 1.5,
        appraisalCost: 6300,
        termYears: 15,
        monthlyPayment: 13540,
        loanAmount: 1200000,
        requiredIncome: 33850,
        debtToIncomeRatio: 74, // extremely high debt ratio
        keyRequirements: ['Edad de 21 a 70 años', 'Ingreso mínimo de $15,000 MXN', 'Antigüedad 2 años independiente'],
        advantages: ['Mayor flexibilidad para actividad empresarial'],
        risks: ['Tasa más alta del mercado (10.85%)', 'Mayor comisión (1.50%)'],
        trustLevel: 'Bajo',
        verifiedStatus: 'Desactualizado',
        recommendation: 'Rechazado. La relación pago/ingreso sumada a deudas vigentes supera el 70% de sus ingresos declarados de $25,000 MXN mensuales. Adicionalmente, el score de Buró es de 590 con alertas de morosidad.'
      }
    ],
    logs: [
      { id: 'log-5-1', user: 'María Gómez', action: 'Registro inicial del prospecto Diana Leticia Ruiz', timestamp: '2026-06-20T10:00:00-07:00' },
      { id: 'log-5-2', user: 'María Gómez', action: 'Consulta de Buró revelando score de 590 y alertas', timestamp: '2026-06-22T11:45:00-07:00' },
      { id: 'log-5-3', user: 'María Gómez', action: 'Envío de expediente preliminar a Afirme', timestamp: '2026-06-23T09:00:00-07:00' },
      { id: 'log-5-4', user: 'Mesa de Control CREDIDIEZ', action: 'Rechazo emitido por el área de análisis de crédito del banco', timestamp: '2026-06-25T15:30:00-07:00' }
    ]
  }
];
