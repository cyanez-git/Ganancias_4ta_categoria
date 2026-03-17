# Implementación: Firebase para Parámetros Fiscales Dinámicos AFIP

## Contexto del Problema

Los parámetros impositivos (deducciones personales, escalas Art. 94, topes MoPRe) estaban **hardcodeados** en `src/engine/defaultParams.js`. Cada nueva resolución de ARCA/AFIP requería modificar el código fuente y hacer un nuevo deploy.

El objetivo fue convertir la aplicación en un sistema dinámico donde:
1. Un **administrador** sube los PDFs oficiales de AFIP
2. La app los parsea y guarda los parámetros en **Firebase Firestore**
3. Los usuarios seleccionan el **año fiscal activo** y la app descarga los parámetros dinámicamente
4. Un **banner** visible en toda la app indica el año con el que se está trabajando

---

## Cambios Implementados

### 1. Infraestructura Firebase

#### [NUEVO] `src/config/firebase.js`
Inicializa Firebase con las credenciales del proyecto `ganancias-4ta-cat` leídas desde variables de entorno Vite (`VITE_FIREBASE_*`). Exporta `db` (Firestore) y `auth` (Authentication).

**Variables de entorno requeridas** (en `.env.local` y en Vercel):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

**Estructura Firestore:**
```
tax_parameters/          ← colección
  2025/                  ← documento (un doc por año)
    year: 2025
    deduccionesPersonales:
      sem1: { gananciaNoImponible, conyuge, hijo, ... }
      sem2: { ... }
    escalas:
      sem1: [ { desde, hasta, fijo, porcentaje, excedenteDe }, ... ]
      sem2: [ ... ]
    topesMoPre: [ 12 valores mensuales ]
    porcentajes: { jubilacion: 0.11, obraSocial: 0.03, inssjp: 0.03 }
    topeRetencion: 0.35
```

**Reglas de Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tax_parameters/{year} {
      allow read: if true;               // cualquier usuario puede leer
      allow write: if request.auth != null; // solo admin autenticado puede escribir
    }
  }
}
```

---

### 2. Banner de Año Activo

#### [NUEVO] `src/components/ActiveYearBanner.jsx`
Componente visual que muestra el año fiscal activo en la parte superior de toda la app. Recibe `year` desde `state.params.year` en `App.jsx`.

#### [NUEVO] `src/components/ActiveYearBanner.css`
Estilos del banner con color de alerta para máxima visibilidad.

---

### 3. Selector de Año Fiscal en Parámetros

#### [MODIFICADO] `src/components/ConfigParametros.jsx`
- Al montar, consulta la colección `tax_parameters` en Firestore para obtener los años disponibles y los muestra en un `<select>`.
- Al cambiar el año, descarga el documento correspondiente de Firestore y llama a `setParams()` para actualizar el estado global.
- El año 2025 actúa como fallback si no hay datos en Firebase (usa `defaultParams.js`).

---

### 4. Motor de Cálculo Dinámico

#### [SIN CAMBIOS] `src/engine/calculationEngine.js`
El motor ya recibía `params` como parámetro — no requirió cambios. La fuente de los params ahora es Firebase en vez del archivo local.

---

### 5. Panel de Administración — Carga de PDFs

#### [NUEVO] `src/components/AdminUploadParams.jsx`
Wizard de 2 pasos para cargar los parámetros de un año nuevo:

**Paso 1 — Carga de PDFs:**
El admin sube 4 archivos PDF de AFIP:
- `Deducciones-personales-art-30-enero-junio-YYYY.pdf`
- `Deducciones-personales-art-30-julio-diciembre-YYYY.pdf`
- `Tabla-Art-94-LIG-enero-junio-YYYY.pdf`
- `Tabla-Art-94-LIG-periodo-julio-diciembre-YYYY.pdf`

**Paso 2 — Confirmación de parámetros manuales:**
Los siguientes valores NO están en los PDFs de AFIP y deben ingresarse manualmente:
- `topesMoPre` — Tope base imponible previsional (MoPRe/RIPTE, lo fija ANSES mensualmente)
- `porcentajes.jubilacion` — 11% (Ley 24241, no varía salvo reforma)
- `porcentajes.obraSocial` — 3% (Ley 23.660)
- `porcentajes.inssjp` — 3% (Ley 19.032)
- `topeRetencion` — 35% (RG 4003)

Al confirmar, se guarda el documento completo en Firestore bajo `tax_parameters/{año}`.

---

### 6. Motor de Parseo de PDFs

#### [NUEVO] `src/engine/pdfParser.js`
Extrae texto de archivos PDF usando `pdfjs-dist` en el navegador. 

**Implementación clave:** agrupa los items de texto por posición Y (coordenada PDF) para reconstruir la estructura de líneas original. Sin esto, todos los items de una página quedaban en una sola línea larga y el parser de tablas fallaba.

#### [NUEVO] `src/engine/pdfExtractionLogic.js`
Aplica regex sobre el texto extraído para obtener los valores numéricos.

**`parseDeducciones(text)`**
- Extrae el primer valor de cada fila de la tabla acumulada (el acumulado de ENERO = mensual de sem1, el de JULIO = mensual de sem2)
- Campos extraídos: `gananciaNoImponible`, `conyuge`, `hijo`, `hijoIncapacitado`, `deduccionEspecialGeneral`, `deduccionEspecialProfesionales`
- Fallback heurístico: si los regex fallan, estima por proporciones conocidas de AFIP

**`parseEscalas(text, startMonth)`**
- Parsea los tramos progresivos Art. 94 para el mes inicial indicado (`'ENERO'` para sem1, `'JULIO'` para sem2)
- Detecta el mes buscando el patrón `JULIO0,00` (el nombre mes va pegado al primer número en el texto del PDF)

---

### 7. Autenticación de Administrador

#### [NUEVO] `src/components/AdminLogin.jsx`
Formulario de login con Firebase Authentication (email/contraseña). Muestra mensajes de error en español según el código de error de Firebase.

#### [MODIFICADO] `src/App.jsx`
- Usa `onAuthStateChanged` para detectar la sesión de Firebase y persistirla entre recargas
- La vista `admin` muestra `<AdminLogin>` si no hay sesión, o `<AdminUploadParams>` con indicador de sesión activa y botón de logout si hay sesión

---

## Parámetros que se obtienen de los PDFs vs. manuales

| Parámetro | Fuente |
|---|---|
| `gananciaNoImponible` sem1/sem2 | ✅ PDF Deducciones |
| `conyuge`, `hijo`, `hijoIncapacitado` sem1/sem2 | ✅ PDF Deducciones |
| `deduccionEspecialGeneral` sem1/sem2 | ✅ PDF Deducciones |
| `deduccionEspecialProfesionales` sem1/sem2 | ✅ PDF Deducciones |
| Escalas Art. 94 (9 tramos) sem1/sem2 | ✅ PDF Escalas |
| `topesMoPre` (12 valores) | ❌ Manual — resoluciones ANSES mensuales |
| `porcentajes.jubilacion/obraSocial/inssjp` | ❌ Manual — fijado por ley, cambia muy poco |
| `topeRetencion` | ❌ Manual — RG 4003 |
