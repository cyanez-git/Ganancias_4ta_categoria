# Calculadora Ganancias 4ta Categoría

Aplicación web moderna para calcular retenciones del **Impuesto a las Ganancias (4ta Categoría)** basada en la planilla Excel oficial conforme al **Mapeo V3 de ARCA** (15 pasos).

## ✨ Características

- 💰 **Liquidación Mensual** — Ingreso de datos mes a mes con cálculos automáticos
- 📊 **Dashboard** — KPIs, gráficos interactivos y tabla resumen Mapeo V3
- 👤 **Configuración Personal** — Cónyuge, hijos, tipo de deducción especial
- ⚙️ **Parámetros Anuales** — Escalas, deducciones y topes MoPRe editables
- 💾 **Persistencia** — Auto-save en localStorage + Export/Import JSON

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

Se abre en [http://localhost:5173](http://localhost:5173)

## 🛠️ Stack

- **Vite** + **React** (vanilla JS)
- **Chart.js** para gráficos
- **Dark theme** premium con glassmorphism
- **100% client-side** (sin backend)

## 📖 Documentación

Toda la documentación del proyecto está en la carpeta [`docs/`](./docs/):

- [Arquitectura y Diseño](./docs/arquitectura.md)
- [Guía de Uso](./docs/guia_de_uso.md)
- Planilla Excel original de referencia
- Guía PDF original

## 📋 Cálculos implementados

Replica exacta de las fórmulas del Excel (15 pasos ARCA Mapeo V3):

- Jubilación 11%, Obra Social 3%, INSSJP 3% con **tope MoPRe**
- SAC Proporcional + Ajuste Semestral
- Alquiler 40% + 10% (Ley 27.737) con tope MNI
- Deducción Especial + **Incremento 22%** (Ley 27.743)
- **Escalas progresivas Art. 94** (9 tramos × 2 semestres)
- **Tope 35%** retención sobre sueldo neto
- Pluriempleo (múltiples empleadores)

## 📄 Licencia

Uso interno.
