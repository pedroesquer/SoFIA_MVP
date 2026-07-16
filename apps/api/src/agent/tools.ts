import { tool } from 'langchain';
import { z } from 'zod';
import {
  calculateMonthlyPayment,
  INITIAL_BANK_RATES,
} from '../../../../packages/domain/src/mockData';

export const consultarTasasTool = tool(
  async ({ banco }) => {
    const bancoNormalizado = banco?.trim().toLowerCase();

    const tasas = INITIAL_BANK_RATES.filter((rate) => {
      if (!bancoNormalizado) {
        return true;
      }

      return rate.bankName.toLowerCase().includes(bancoNormalizado);
    });

    if (tasas.length === 0) {
      return {
        encontrado: false,
        mensaje: `No se encontraron tasas para el banco "${banco}".`,
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
      'Consulta el catálogo interno de tasas hipotecarias. Debe utilizarse antes de responder preguntas sobre tasas, CAT, comisiones o productos bancarios.',
    schema: z.object({
      banco: z
        .string()
        .min(2)
        .optional()
        .describe(
          'Nombre del banco que se desea consultar. Debe omitirse para consultar todos los bancos.',
        ),
    }),
  },
);

export const simularHipotecaTool = tool(
  async ({ montoCredito, plazoAnios, bancos }) => {
    const bancosNormalizados = bancos.map((banco) =>
      banco.trim().toLowerCase(),
    );

    const tasasSeleccionadas = INITIAL_BANK_RATES.filter((rate) =>
      bancosNormalizados.some((banco) =>
        rate.bankName.toLowerCase().includes(banco),
      ),
    );

    const bancosNoEncontrados = bancos.filter((banco) =>
      !INITIAL_BANK_RATES.some((rate) =>
        rate.bankName.toLowerCase().includes(banco.trim().toLowerCase()),
      ),
    );

    if (tasasSeleccionadas.length === 0) {
      return {
        encontrado: false,
        mensaje: 'No se encontraron productos para los bancos solicitados.',
        bancosNoEncontrados,
        simulaciones: [],
      };
    }

    const simulaciones = tasasSeleccionadas.map((rate) => ({
      banco: rate.bankName,
      producto: rate.productName,
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
      'Calcula de forma determinista la mensualidad de capital e interés y la comisión de apertura para un monto, plazo y uno o más bancos. Debe utilizarse antes de mencionar cualquier mensualidad hipotecaria.',
    schema: z.object({
      montoCredito: z
        .number()
        .finite()
        .min(100_000)
        .max(100_000_000)
        .describe('Monto del crédito solicitado en pesos mexicanos.'),
      plazoAnios: z
        .number()
        .int()
        .min(1)
        .max(30)
        .describe('Plazo solicitado en años. No debe inferirse ni asumirse.'),
      bancos: z
        .array(z.string().trim().min(2))
        .min(1)
        .max(10)
        .describe(
          'Bancos que deben simularse. Debe preguntarse al usuario si no los especificó.',
        ),
    }),
  },
);

export const sofiaTools = [
  consultarTasasTool,
  simularHipotecaTool,
];
