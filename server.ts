import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY no está configurada o es el valor de ejemplo.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Simulated backup responses if Gemini API is not configured or fails
function getSimulatedChatResponse(message: string, context?: any): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('tasa') || msg.includes('banco') || msg.includes('comparar') || msg.includes('comparativo')) {
    return `### 📊 Comparativa de Tasas y Condiciones (Simulada - Sin Conexión API)

Aquí tienes una tabla resumen de las ofertas de crédito vigentes en la biblioteca interna de **CREDIDIEZ** para orientar tu estrategia hipotecaria:

| Banco | Producto | Tasa de Interés | CAT Promedio | Comisión de Apertura | Beneficio Clave |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Scotiabank** | Scotia 7X | **9.90%** | 11.9% | **0.0% (Promo)** | Tasa fija preferente y sin comisión de apertura. |
| **BBVA** | Hipoteca Fija | **10.10%** | 12.0% | 1.0% | Proceso digital ágil y aprobación veloz. |
| **Santander** | Hipoteca Única | **10.15%** | 12.1% | 1.0% | Sin comisión por prepago directo a capital. |
| **Banorte** | Fuerte Banorte | **10.25%** | 12.3% | 1.25% | Excelente opción para acumular ingresos mixtos. |
| **Citibanamex** | Hipoteca Perfiles | **10.30%** | 12.4% | 1.0% | Plazos flexibles de hasta 20 años. |

*Fuentes: Biblioteca Financiera Interna validada al 10/07/2026. Recuerda realizar el simulador dinámico en la pestaña del cliente para generar cotizaciones específicas basadas en la capacidad de pago real del acreditado.*`;
  }

  if (msg.includes('buro') || msg.includes('buró') || msg.includes('score') || msg.includes('autorización')) {
    return `### 🛡️ Políticas de Buró de Crédito e Historial Crediticio

Para cualquier trámite hipotecario en **CREDIDIEZ**, la consulta de Buró es un paso obligatorio y crítico:

1. **Requisito de Autorización:** Para realizar la consulta, se debe contar con la **autorización firmada físicamente o mediante firma remota** del cliente. Sin este documento, la consulta infringe políticas de cumplimiento normativo interno.
2. **Score de Buró (Mínimo Recomendado):**
   - **>= 680:** Excelente perfil. Elegible para tasas premium (Scotiabank 9.90%, Santander Única).
   - **640 - 679:** Perfil aceptable. Aceptado por la mayoría de los bancos comerciales con tasas estándar.
   - **< 620:** Perfil con riesgo. Requiere explicación detallada de atrasos y/o liquidación de deudas vigentes.
3. **Estrategia Recomendada:** Si el score está comprometido por tarjetas de crédito saturadas, sugiere al cliente amortizar sus deudas de corto plazo al menos **15 días antes** de la consulta oficial para refrescar el score en la base de datos nacional.`;
  }

  if (msg.includes('documento') || msg.includes('requisito') || msg.includes('expediente')) {
    return `### 📁 Checklist Operativo para Expedientes Completos

Para agilizar el envío a la Mesa de Control de **CREDIDIEZ**, asegúrate de recopilar los siguientes documentos en formato digital (PDF legibles):

| Tipo de Documento | Requisito Clave | Estado Crítico |
| :--- | :--- | :---: |
| **Identificación Oficial** | INE (vigente, ambos lados) o Pasaporte | **Obligatorio** |
| **Comprobante de Domicilio** | Recibo de luz (CFE), teléfono o agua < 2 meses | **Obligatorio** |
| **Estados de Cuenta** | Últimos 3 o 6 meses completos (sin hojas omitidas) | **Obligatorio** |
| **Constancia de Situación Fiscal** | RFC con homoclave actualizada (periodo actual) | **Obligatorio** |
| **Comprobantes de Ingresos** | Recibos de nómina timbrados o declaraciones anuales/parciales | **Obligatorio** |
| **Autorización de Buró** | Formato de autorización firmado exactamente como la identificación | **Crítico** |

*¿Necesitas apoyo preparando una solicitud específica? Recuerda que el **Asistente de Llenado de Solicitud** puede automatizar el prellenado de los portales bancarios con un solo clic en la sección del cliente.*`;
  }

  // Generic intelligent greeting and response helper
  return `### 👋 Hola, soy SoFIA, tu Copiloto Inteligente de Crédito Hipotecario.

Estoy aquí para apoyarte en toda la operación de **CREDIDIEZ**. Puedo ayudarte con:

* **Políticas de bancos comerciales** (tasas actualizadas, CAT, comisiones y condiciones).
* **Diagnóstico de riesgo de prospectos** según edad, ingresos comprobables y deudas.
* **Criterios de integración de expedientes** (documentación requerida, validación).
* **Comparativas y análisis cruzados** entre múltiples simulaciones hipotecarias.
* **Estrategias de negociación** para presentar la mejor propuesta comercial al cliente.

*¿Cómo puedo asistirte el día de hoy? (Ej. "Compara Santander con Scotiabank", "Políticas de Buró", "Requisitos de expediente")*`;
}

function getSimulatedAnalysisResponse(client: any, simulations: any[]): string {
  const tableRows = simulations.map(sim => 
    `| **${sim.bankName}** | ${sim.productName} | ${sim.interestRate}% | $${sim.monthlyPayment.toLocaleString('es-MX')} | $${sim.requiredIncome.toLocaleString('es-MX')} | ${sim.debtToIncomeRatio}% | ${sim.verifiedStatus} |`
  ).join('\n');

  // Find best options
  const sorted = [...simulations].sort((a, b) => a.interestRate - b.interestRate);
  const best = sorted[0] || { bankName: 'Scotiabank', interestRate: 9.9 };
  const secondBest = sorted[1] || { bankName: 'Santander', interestRate: 10.15 };

  return `## 📊 Diagnóstico y Estrategia Hipotecaria de SoFIA

Hemos analizado las **${simulations.length} propuestas hipotecarias** generadas para el perfil de **${client.name}** (${client.age} años, ingresos mensuales de $${client.monthlyIncome.toLocaleString('es-MX')} MXN). 

---

### 🔍 Tabla Resumen de Simulaciones

| Banco | Producto | Tasa | Mensualidad Est. | Ingreso Requerido | Endeudamiento (DTI) | Estado Tasa |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
${tableRows}

---

### 🏆 Recomendaciones de Selección

1. **La Mejor Opción (Tasa y CAT): ${best.bankName} (${best.productName})**
   - **Tasa:** ${best.interestRate}% · **Mensualidad:** $${best.monthlyPayment?.toLocaleString('es-MX')} MXN.
   - **Ventajas:** Es la opción financiera más eficiente en costo total. Ofrece amortización acelerada y un menor costo de CAT.
   - **Estrategia Comercial:** Presentar esta opción como la principal en el reporte. El cliente ahorrará sustancialmente a largo plazo.

2. **Segunda Opción Recomendada (Viabilidad y Rapidez): ${secondBest.bankName} (${secondBest.productName})**
   - **Tasa:** ${secondBest.interestRate}% · **Mensualidad:** $${secondBest.monthlyPayment?.toLocaleString('es-MX')} MXN.
   - **Ventajas:** Mayor flexibilidad en la comprobación de ingresos adicionales y tiempos de aprobación récord de la mesa de control local de CREDIDIEZ.
   - **Estrategia Comercial:** Usar como respaldo inmediato en caso de que la validación de documentación con el primer banco demore o requiera aclaraciones complejas.

---

### ⚠️ Alertas de Riesgo Operativo

* **Relación de Endeudamiento (DTI):** La carga mensual promedio estimada ronda el **${simulations[0]?.debtToIncomeRatio}%** de los ingresos reportados de ${client.name}. Esto se encuentra en los límites de aceptación del banco.
* **Estrategia de Mitigación:** Se aconseja solicitar al cliente que liquide tarjetas de crédito menores o saldos revolventes antes del ingreso formal de la solicitud para reducir deudas externas ($${client.otherDebts.toLocaleString('es-MX')} MXN registradas) y asegurar una aprobación fluida.
* **Autorización de Buró:** Asegúrate de que la firma autógrafa en la solicitud coincida perfectamente con la identificación oficial (INE/Pasaporte) cargada en el expediente para evitar rechazos inmediatos en la consulta del sistema bancario nacional.`;
}

// ENDPOINTS

// 1. SoFIA Intelligent Chat Endpoint
app.post('/api/sofia/chat', async (req, res) => {
  const { messages, clientContext, ratesContext } = req.body;
  const userMessage = messages[messages.length - 1]?.text || '';

  try {
    const ai = getGeminiClient();

    let systemInstruction = `Eres "SoFIA" (Soporte Operativo y Financiero de Inteligencia de Acreditación), el Copiloto Inteligente de Crédito Hipotecario de CREDIDIEZ.
Se te ha encomendado asesorar al broker o asesor hipotecario. Tu tono debe ser extremadamente profesional, analítico, servicial y experto en finanzas de vivienda de México.
Contexto actual del sistema: Julio de 2026.

REGLAS CRÍTICAS DE RESPUESTA:
1. Siempre habla en español de México.
2. Si respondes sobre comparativas de bancos, requisitos, tasas, listas de documentos, simulaciones o análisis de riesgo, DEBES usar tablas de Markdown muy bien estructuradas con encabezados alineados.
3. Basa tus recomendaciones en la Biblioteca Financiera y en los criterios de viabilidad habituales:
   - Capacidad de pago (el pago mensual promedio del cliente no debe superar el 40% de sus ingresos brutos).
   - Endeudamiento global (la relación total de deudas no debe rebasar el 45% o 50% de sus ingresos).
   - Edad límite (la edad del cliente al momento de contratar más el plazo del crédito no debe superar los 75 años, salvo algunas excepciones como BBVA que permite hasta 80 años).
4. Cuando el usuario te pregunte por un cliente específico, usa el contexto del cliente proporcionado.
5. Siempre que uses datos de bancos específicos o tasas, menciona las fuentes y especifica que las tasas deben validarse directamente debido a su volatilidad mensual.

Aquí tienes el contexto operativo relevante:
`;

    if (clientContext) {
      systemInstruction += `\n- CLIENTE ACTUAL CON EL QUE SE TRABAJA: ${JSON.stringify(clientContext)}`;
    }
    if (ratesContext) {
      systemInstruction += `\n- TASAS Y POLÍTICAS DEL SISTEMA VIGENTES: ${JSON.stringify(ratesContext)}`;
    }

    // Prepare contents
    // Map standard roles
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';
    return res.json({ text: replyText });

  } catch (error: any) {
    console.warn('Error llamando a Gemini API en Chat SoFIA:', error.message);
    // Return simulated expert response
    const replyText = getSimulatedChatResponse(userMessage, { clientContext, ratesContext });
    return res.json({ text: replyText, isSimulated: true });
  }
});

// 2. SoFIA Analyze Simulations Endpoint
app.post('/api/sofia/analyze-simulations', async (req, res) => {
  const { client, simulations } = req.body;

  if (!client || !simulations || simulations.length === 0) {
    return res.status(400).json({ error: 'Faltan datos del cliente o simulaciones para analizar.' });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `Analiza las siguientes ofertas hipotecarias simuladas para el cliente ${client.name}.
Información del cliente:
- Edad: ${client.age} años
- Actividad Económica: ${client.economicActivity}
- Ingresos Mensuales: $${client.monthlyIncome} MXN
- Gastos Mensuales: $${client.monthlyExpenses} MXN
- Deudas Externas en Buró: $${client.otherDebts} MXN
- Score de Buró estimado: ${client.buro?.score || 'No disponible'}
- Monto Solicitado: $${client.requestedAmount} MXN
- Valor de Propiedad: $${client.propertyValue} MXN
- Plazo solicitado: ${client.termYears} años

Ofertas simuladas generadas:
${JSON.stringify(simulations, null, 2)}

Entrega un informe ejecutivo en español, estructurado de la siguiente manera:
1. **Un Resumen Ejecutivo** del perfil financiero del cliente (ingreso, endeudamiento real, fortalezas).
2. **Comparativa Resumida** usando una tabla Markdown compacta.
3. **La Mejor Opción Recomendada** y el porqué.
4. **La Segunda Mejor Opción** como plan de respaldo comercial.
5. **Opción de Mayor Riesgo o Rechazo** fundamentada.
6. **Estrategia sugerida para presentar al cliente** (consejos clave para el broker).
7. **Advertencias o siguientes pasos críticos** (Buró de crédito, validaciones, etc.).

Usa un tono sumamente sofisticado y experto en corretaje hipotecario.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres "SoFIA", el motor de inteligencia de CREDIDIEZ. Eres una analista hipotecaria senior de la mesa de control de riesgos.',
        temperature: 0.5,
      },
    });

    const replyText = response.text || '';
    return res.json({ text: replyText });

  } catch (error: any) {
    console.warn('Error llamando a Gemini API en Analizador de Simulaciones:', error.message);
    // Return simulated expert analysis
    const replyText = getSimulatedAnalysisResponse(client, simulations);
    return res.json({ text: replyText, isSimulated: true });
  }
});

// VITE MIDDLEWARE SETUP FOR DEV & PUBLIC PRODUCTION SERVING

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SoFIA Operativa Server] Corriendo en puerto ${PORT}`);
  });
}

startServer();
