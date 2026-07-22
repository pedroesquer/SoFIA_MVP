import { supabase } from './supabase';
import type { MortgageFile } from '../types';

interface ExpedienteRow {
  id: string;
  asesor_id: string;
  nombre_cliente: string;
  correo_cliente: string;
  telefono_cliente: string;
  edad: number;
  actividad_economica: string;
  antiguedad_laboral_meses: number;
  ingreso_mensual: number | string;
  gastos_mensuales: number | string;
  otras_deudas: number | string;
  monto_solicitado: number | string;
  valor_propiedad: number | string;
  plazo_anios: number;
  tipo_credito: string;
  etapa: MortgageFile['stage'];
  prioridad: MortgageFile['priority'];
  siguiente_accion: string | null;
  observaciones: string | null;
  fecha_ultimo_analisis: string | null;
  documentos: MortgageFile['documents'];
  buro_credito: MortgageFile['buro'];
  ofertas_simuladas: MortgageFile['simulatedOffers'];
  historial: MortgageFile['logs'];
}

function rowToMortgageFile(
  row: ExpedienteRow,
  asesorEmail: string,
  sede: string,
): MortgageFile {
  return {
    id: row.id,
    advisorId: row.asesor_id,
    name: row.nombre_cliente,
    email: row.correo_cliente,
    phone: row.telefono_cliente,
    broker: asesorEmail,
    sede,
    requestedAmount: Number(row.monto_solicitado),
    propertyValue: Number(row.valor_propiedad),
    termYears: row.plazo_anios,
    creditType: row.tipo_credito,
    monthlyIncome: Number(row.ingreso_mensual),
    monthlyExpenses: Number(row.gastos_mensuales),
    otherDebts: Number(row.otras_deudas),
    age: row.edad,
    economicActivity: row.actividad_economica,
    jobTenureMonths: row.antiguedad_laboral_meses,
    observations: row.observaciones ?? '',
    stage: row.etapa,
    priority: row.prioridad,
    nextAction: row.siguiente_accion ?? '',
    lastAnalysisDate: row.fecha_ultimo_analisis ?? '',
    documents: row.documentos ?? [],
    buro: row.buro_credito ?? {
      authStatus: 'Autorización pendiente',
    },
    simulatedOffers: row.ofertas_simuladas ?? [],
    logs: row.historial ?? [],
  };
}

export async function listarExpedientes(
  asesorEmail: string,
  sede: string,
): Promise<MortgageFile[]> {
  const { data, error } = await supabase
    .from('expedientes')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ExpedienteRow[]).map((row) =>
    rowToMortgageFile(row, asesorEmail, sede),
  );
}

export async function crearExpediente(
  expediente: Omit<MortgageFile, 'id'>,
): Promise<MortgageFile> {
  const { data, error } = await supabase
    .from('expedientes')
    .insert({
      // asesor_id se obtiene automáticamente de auth.uid()
      nombre_cliente: expediente.name,
      correo_cliente: expediente.email,
      telefono_cliente: expediente.phone,
      edad: expediente.age,
      actividad_economica: expediente.economicActivity,
      antiguedad_laboral_meses: expediente.jobTenureMonths,
      ingreso_mensual: expediente.monthlyIncome,
      gastos_mensuales: expediente.monthlyExpenses,
      otras_deudas: expediente.otherDebts,
      monto_solicitado: expediente.requestedAmount,
      valor_propiedad: expediente.propertyValue,
      plazo_anios: expediente.termYears,
      tipo_credito: expediente.creditType,
      etapa: expediente.stage,
      prioridad: expediente.priority,
      siguiente_accion: expediente.nextAction,
      observaciones: expediente.observations,
      fecha_ultimo_analisis: expediente.lastAnalysisDate || null,
      documentos: expediente.documents,
      buro_credito: expediente.buro,
      ofertas_simuladas: expediente.simulatedOffers,
      historial: expediente.logs,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToMortgageFile(
    data as ExpedienteRow,
    expediente.broker,
    expediente.sede,
  );
}