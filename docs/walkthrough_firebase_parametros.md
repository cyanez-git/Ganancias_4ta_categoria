# Walkthrough: Firebase para Parámetros Fiscales Dinámicos

## Estado: ✅ Implementado — ⏳ En verificación en Vercel

## Commits realizados

| Commit | Descripción |
|---|---|
| `d895c69` | feat: integrar Firebase para parámetros fiscales dinámicos AFIP |
| `b085460` | feat: agregar login con Firebase Authentication para panel admin |

---

## Flujo del Administrador (carga de un nuevo año)

```
[Admin navega a "Admin (Cargar Año)"]
         ↓
[Login con email/contraseña Firebase]
         ↓
[Wizard Paso 1: subir 4 PDFs de AFIP]
  - Deducciones sem1 (ene-jun)
  - Deducciones sem2 (jul-dic)
  - Escalas Art.94 sem1
  - Escalas Art.94 sem2
         ↓
[pdfParser.js extrae texto preservando líneas (por posición Y)]
         ↓
[pdfExtractionLogic.js aplica regex → JSON de parámetros]
         ↓
[Wizard Paso 2: confirmar/editar valores manuales]
  - Topes MoPRe (12 meses)
  - % Jubilación, Obra Social, INSSJP
         ↓
[Guardar en Firestore bajo tax_parameters/{año}]
```

## Flujo del Usuario (selección de año)

```
[App carga → ConfigParametros consulta Firestore]
         ↓
[Lista de años disponibles en dropdown]
         ↓
[Usuario selecciona año → app descarga params de Firestore]
         ↓
[Banner superior actualiza: "TRABAJANDO CON PERIODO FISCAL XXXX"]
         ↓
[Motor de cálculo usa los nuevos params automáticamente]
```

---

## Verificación realizada

### Parser de PDFs — valores esperados

**Sem1 (ENERO 2025):**
| Campo | Valor esperado |
|---|---|
| `gananciaNoImponible` | `326.355,70` |
| `conyuge` | `307.361,61` |
| `hijo` | `155.003,58` |
| `hijoIncapacitado` | `310.007,16` |
| `deduccionEspecialGeneral` | `1.142.244,94` |
| `deduccionEspecialProfesionales` | `1.305.422,79` |
| Escalas: tramo 0 hasta | `126.697,64` |
| Escalas: tramo 0 porcentaje | `5%` |

**Sem2 (JULIO 2025):**
| Campo | Valor esperado |
|---|---|
| `gananciaNoImponible` | `~333.394` |
| Escalas: tramo 0 hasta | `906.010,96` |
| Escalas: tramo 0 porcentaje | `5%` |

> **Nota:** Los logs de debug del parser se pueden ver en DevTools → Console al procesar los PDFs (prefijo `[parseDeducciones]` y `[parseEscalas]`).

---

## Configuración Firebase

- **Proyecto:** `ganancias-4ta-cat`
- **Firestore:** base de datos en región `us-east1`
- **Authentication:** Email/Password habilitado
- **Reglas Firestore:** lectura pública, escritura solo autenticados
