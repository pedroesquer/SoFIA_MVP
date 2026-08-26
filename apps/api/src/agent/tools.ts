import { tool } from 'langchain';
import { z } from 'zod';
import {
  calculateMonthlyPayment,
  INITIAL_BANK_RATES,
  INITIAL_MORTGAGE_FILES,
} from '../../../../packages/domain/src/mockData';

export const consultarTasasTool = tool(
  async ({ banco, categoria }) => {
    const bancoNormalizado = banco?.trim().toLowerCase();
    const categoriaNormalizada = categoria?.trim().toLowerCase();

    const tasas = INITIAL_BANK_RATES.filter((rate) => {
      const matchBanco = !bancoNormalizado || rate.bankName.toLowerCase().includes(bancoNormalizado);
      const matchCategoria = !categoriaNormalizada || (rate.category && rate.category.toLowerCase() === categoriaNormalizada);
      return matchBanco && matchCategoria;
    });

    if (tasas.length === 0) {
      return {
        encontrado: false,
        mensaje: `No se encontraron tasas${categoria ? ` de categoría "${categoria}"` : ''}${banco ? ` para el banco "${banco}"` : ''}.`,
        tasas: [],
      };
    }

    return {
      encontrado: true,
      fechaConsulta: new Date().toISOString(),
      aviso: 'Datos internos de demostración. Las tasas deben validarse antes de formalizar una propuesta.',
      tasas: tasas.map((rate) => ({
        id: rate.id,
        banco: rate.bankName,
        producto: rate.productName,
        categoria: rate.category ?? 'Hipotecario',
        tasaInteres: rate.interestRate,
        cat: rate.cat,
        comisionApertura: rate.commission,
        fechaActualizacion: rate.lastUpdated,
        estado: rate.status,
        nivelConfianza: rate.trustLevel,
        fuente: rate.source,
      })),
    };
  },
  {
    name: 'consultar_tasas',
    description:
      'Consulta el catálogo interno de tasas de crédito (Hipotecario o Automotriz). Debe utilizarse antes de responder preguntas sobre tasas, CAT, comisiones o productos bancarios.',
    schema: z.object({
      banco: z
        .string()
        .min(2)
        .optional()
        .describe(
          'Nombre del banco que se desea consultar. Debe omitirse para consultar todos los bancos.',
        ),
      categoria: z
        .enum(['Hipotecario', 'Automotriz'])
        .optional()
        .describe(
          'Categoría de crédito a consultar: "Hipotecario" o "Automotriz". Omitir para consultar ambas.',
        ),
    }),
  },
);

export const simularHipotecaTool = tool(
  async ({ montoCredito, plazoAnios, bancos, categoria }) => {
    const bancosNormalizados = bancos.map((banco) =>
      banco.trim().toLowerCase(),
    );
    const categoriaNormalizada = categoria?.trim().toLowerCase();

    const tasasSeleccionadas = INITIAL_BANK_RATES.filter((rate) => {
      const matchBanco = bancosNormalizados.some((banco) =>
        rate.bankName.toLowerCase().includes(banco),
      );
      const matchCategoria = !categoriaNormalizada || (rate.category && rate.category.toLowerCase() === categoriaNormalizada);
      return matchBanco && matchCategoria;
    });

    const bancosNoEncontrados = bancos.filter((banco) =>
      !INITIAL_BANK_RATES.some((rate) =>
        rate.bankName.toLowerCase().includes(banco.trim().toLowerCase()),
      ),
    );

    if (tasasSeleccionadas.length === 0) {
      return {
        encontrado: false,
        mensaje: `No se encontraron productos${categoria ? ` de categoría "${categoria}"` : ''} para los bancos solicitados.`,
        bancosNoEncontrados,
        simulaciones: [],
      };
    }

    const simulaciones = tasasSeleccionadas.map((rate) => ({
      banco: rate.bankName,
      producto: rate.productName,
      categoria: rate.category ?? 'Hipotecario',
      montoCredito,
      moneda: 'MXN',
      plazoAnios,
      tasaAnual: rate.interestRate,
      cat: rate.cat,
      mensualidadCapitalInteres: calculateMonthlyPayment(
        montoCredito,
        rate.interestRate,
        plazoAnios,
      ),
      comisionAperturaPorcentaje: rate.commission,
      comisionAperturaMonto: Math.round(
        montoCredito * (rate.commission / 100),
      ),
      fechaActualizacion: rate.lastUpdated,
      estadoTasa: rate.status,
      nivelConfianza: rate.trustLevel,
      fuente: rate.source,
    }));

    return {
      encontrado: true,
      fechaSimulacion: new Date().toISOString(),
      metodo:
        'Amortización de pago fijo calculada con tasa anual dividida entre 12.',
      supuestos: [
        'La mensualidad incluye únicamente capital e interés.',
        'No incluye seguros, impuestos, avalúo, gastos notariales ni otras comisiones.',
        'La simulación no representa aprobación, oferta vinculante ni cotización oficial.',
        'Las tasas y condiciones deben validarse directamente con cada institución.',
      ],
      bancosNoEncontrados,
      simulaciones,
    };
  },
  {
    name: 'simular_hipoteca',
    description:
      'Calcula de forma determinista la mensualidad de capital e interés y la comisión de apertura para un monto, plazo y uno o más bancos (Crédito Hipotecario o Automotriz). Debe utilizarse antes de mencionar cualquier mensualidad.',
    schema: z.object({
      montoCredito: z
        .number()
        .finite()
        .min(50_000)
        .max(100_000_000)
        .describe('Monto del crédito solicitado en pesos mexicanos.'),
      plazoAnios: z
        .number()
        .int()
        .min(1)
        .max(30)
        .describe('Plazo solicitado en años (1 a 6 para Crédito Automotriz, 1 a 30 para Crédito Hipotecario).'),
      bancos: z
        .array(z.string().trim().min(2))
        .min(1)
        .max(10)
        .describe(
          'Bancos que deben simularse. Debe preguntarse al usuario si no los especificó.',
        ),
      categoria: z
        .enum(['Hipotecario', 'Automotriz'])
        .optional()
        .describe('Categoría del crédito a simular: "Hipotecario" o "Automotriz".'),
    }),
  },
);

export const consultarExpedienteTool = tool(
  async ({ busqueda }) => {
    const query = busqueda.trim().toLowerCase();

    const coincidencia = INITIAL_MORTGAGE_FILES.find((file) => {
      return (
        file.id.toLowerCase().includes(query) ||
        file.name.toLowerCase().includes(query) ||
        file.email.toLowerCase().includes(query)
      );
    });

    if (!coincidencia) {
      return {
        encontrado: false,
        mensaje: `No se encontró ningún expediente que coincida con "${busqueda}".`,
        expediente: null,
      };
    }

    const dtiRatio = Math.round(
      ((coincidencia.monthlyExpenses + coincidencia.otherDebts) /
        coincidencia.monthlyIncome) *
        100,
    );
    const ltvRatio = Math.round(
      (coincidencia.requestedAmount / coincidencia.propertyValue) * 100,
    );

    return {
      encontrado: true,
      fechaConsulta: new Date().toISOString(),
      expediente: {
        id: coincidencia.id,
        cliente: coincidencia.name,
        correo: coincidencia.email,
        telefono: coincidencia.phone,
        broker: coincidencia.broker,
        sede: coincidencia.sede,
        edad: coincidencia.age,
        actividadEconomica: coincidencia.economicActivity,
        antiguedadLaboralMeses: coincidencia.jobTenureMonths,
        financiero: {
          ingresoMensualMXN: coincidencia.monthlyIncome,
          gastosMensualesMXN: coincidencia.monthlyExpenses,
          deudasExternasBuroMXN: coincidencia.otherDebts,
          relacionDeudaIngresoDTI: `${dtiRatio}%`,
        },
        solicitud: {
          montoSolicitadoMXN: coincidencia.requestedAmount,
          valorPropiedadMXN: coincidencia.propertyValue,
          aforoLTV: `${ltvRatio}%`,
          plazoAnios: coincidencia.termYears,
          tipoCredito: coincidencia.creditType,
        },
        crm: {
          etapaActual: coincidencia.stage,
          prioridad: coincidencia.priority,
          siguienteAccion: coincidencia.nextAction,
          fechaUltimoAnalisis: coincidencia.lastAnalysisDate,
          observaciones: coincidencia.observations,
        },
        buroCredito: {
          score: coincidencia.buro.score ?? 'No disponible',
          estatusAutorizacion: coincidencia.buro.authStatus,
          puntualidadPago: coincidencia.buro.paymentPunctuality ?? 'N/A',
          alertasRiesgo: coincidencia.buro.riskAlerts ?? [],
        },
        documentosChecklist: coincidencia.documents.map((doc) => ({
          nombre: doc.name,
          estado: doc.status,
          observaciones: doc.remarks ?? '',
        })),
      },
    };
  },
  {
    name: 'consultar_expediente',
    description:
      'Consulta la información financiera detallada, perfil de riesgo, estado de Buró y checklist de documentos de un expediente específico. Debe utilizarse cuando el usuario pregunte por un cliente, folio o estado de expediente.',
    schema: z.object({
      busqueda: z
        .string()
        .min(2)
        .describe(
          'Nombre del cliente, correo electrónico o ID/folio del expediente a consultar.',
        ),
    }),
  },
);

export const listarExpedientesTool = tool(
  async ({ etapa, prioridad }) => {
    let resultado = [...INITIAL_MORTGAGE_FILES];

    if (etapa) {
      resultado = resultado.filter(
        (file) => file.stage.toLowerCase() === etapa.toLowerCase(),
      );
    }

    if (prioridad) {
      resultado = resultado.filter(
        (file) => file.priority.toLowerCase() === prioridad.toLowerCase(),
      );
    }

    if (resultado.length === 0) {
      return {
        encontrado: false,
        mensaje: 'No se encontraron expedientes con los criterios seleccionados.',
        expedientes: [],
      };
    }

    return {
      encontrado: true,
      total: resultado.length,
      filtroAplicado: { etapa, prioridad },
      expedientes: resultado.map((file) => ({
        id: file.id,
        cliente: file.name,
        correo: file.email,
        montoSolicitadoMXN: file.requestedAmount,
        valorPropiedadMXN: file.propertyValue,
        tipoCredito: file.creditType,
        etapa: file.stage,
        prioridad: file.priority,
        siguienteAccion: file.nextAction,
      })),
    };
  },
  {
    name: 'listar_expedientes',
    description:
      'Obtiene una lista resumida de los expedientes de crédito activos en el CRM. Permite filtrar por etapa operativa o por prioridad.',
    schema: z.object({
      etapa: z
        .enum([
          'Prospecto',
          'En análisis',
          'Docs integrados',
          'Enviado a banco',
          'Rechazado',
          'Aprobado',
        ])
        .optional()
        .describe('Filtra la lista de expedientes por una etapa específica del CRM.'),
      prioridad: z
        .enum(['Alta', 'Media', 'Baja'])
        .optional()
        .describe('Filtra la lista por nivel de prioridad.'),
    }),
  },
);

export const sofiaTools = [
  consultarTasasTool,
  simularHipotecaTool,
  consultarExpedienteTool,
  listarExpedientesTool,
];

