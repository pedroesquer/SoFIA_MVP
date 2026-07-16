# SoFIA Operativa

Prototipo operativo de CREDIDIEZ con una aplicación web React y una API Express independiente. SoFIA utiliza LangChain y Gemini para consultar herramientas controladas del dominio hipotecario.

## Arquitectura

```text
apps/web       React + Vite (puerto 3000)
apps/api       Express + LangChain (puerto 3001)
packages/domain Tipos, datos demo y motor financiero compartido
```

Durante desarrollo, Vite reenvía las solicitudes `/api/*` hacia la API. En producción, ambas aplicaciones pueden desplegarse de manera independiente detrás del mismo dominio o gateway.

## Requisitos

- Node.js 20 o superior
- Una clave válida de Gemini en `.env`

## Configuración

```powershell
Copy-Item .env.example .env
npm.cmd install
```

Configura `GEMINI_API_KEY` dentro de `.env`. No publiques ese archivo.

## Desarrollo

Ejecuta la API en una terminal:

```powershell
npm.cmd run dev:api
```

Ejecuta el frontend en otra terminal:

```powershell
npm.cmd run dev:web
```

Abre `http://localhost:3000`. El estado de la API está disponible en `http://localhost:3001/api/health` y también mediante el proxy en `http://localhost:3000/api/health`.

## Verificación

```powershell
npm.cmd run lint
npm.cmd run build
```

Los artefactos se generan en `apps/web/dist` y `apps/api/dist`.

## Estado actual

- El endpoint nuevo `POST /api/sofia/agent` usa LangChain y herramientas controladas.
- Los endpoints anteriores de Gemini permanecen temporalmente para no romper el simulador.
- Los datos continúan siendo demostrativos; autenticación, persistencia y almacenamiento documental pertenecen a la siguiente fase.
