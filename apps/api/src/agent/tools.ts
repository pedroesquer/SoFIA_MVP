import { tool } from 'langchain';
import { z } from 'zod';
import { INITIAL_BANK_RATES } from '../../../../packages/domain/src/mockData';

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

export const sofiaTools = [
  consultarTasasTool,
];
