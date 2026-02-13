# Guía de Uso

## Requisitos

- **Node.js** v18 o superior
- **npm** v9 o superior

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La app se abre en [http://localhost:5173](http://localhost:5173)

### Build de producción

```bash
npm run build
```

Los archivos se generan en la carpeta `dist/`.

---

## Módulos funcionales

### 💰 Liquidación Mensual

- Tabs para navegar entre los 12 meses (Ene-Dic)
- Secciones colapsables para cada grupo de datos
- Celdas amarillas = entrada manual (igual que Excel)
- Celdas gris = calculado automáticamente
- Vista anual: tabla de 12 columnas con todos los conceptos

### 📊 Dashboard

- 4 KPIs: Total retenido, Neto promedio, Alícuota efectiva, Bruto anual
- 3 gráficos: Retención mensual (barras), Bruto vs Neto (línea), Composición (stacked)
- Tabla resumen conforme Mapeo V3 ARCA

### 👤 Configuración Personal

- Toggle cónyuge a cargo
- Cantidad de hijos / hijos incapacitados
- Tipo de deducción especial (General / Profesionales / Zona Desfavorable)

### ⚙️ Parámetros Anuales

- Selector semestre (Ene-Jun / Jul-Dic)
- Tablas editables: Deducciones personales, Escalas progresivas Art. 94, Topes MoPRe
- Botón "Restaurar 2025" para volver a defaults

### 💾 Persistencia

- Auto-save a localStorage
- Export/Import JSON desde sidebar
- Reset completo

---

## Cálculos implementados

Replica exacta de las fórmulas del Excel en `src/engine/calculationEngine.js`:

- Base descuentos con **tope MoPRe** mensual
- Jubilación 11%, Obra Social 3%, INSSJP 3%
- SAC Proporcional (Acum/12) + Ajuste Semestral
- Alquiler 40% + 10% (Ley 27.737) con tope MNI
- Medicina Prepaga, Donaciones, Seguro de Vida con tope 5% GNSI
- Deducción Especial + **Incremento 22%** (Ley 27.743)
- **Escalas progresivas Art. 94** (9 tramos × 2 semestres)
- **Tope 35%** retención sobre sueldo neto
- Pluriempleo (múltiples empleadores)

---

## Verificación de cálculos

Para verificar que los cálculos son correctos, comparar con la planilla Excel (`docs/Calculadora_Ganancias_2025_FINAL_V3_CORREGIDA.xlsx`):

| Concepto a verificar | Fila Excel |
|----------------------|------------|
| Total Ingresos del Mes | Fila 13 |
| Base para Descuentos con tope MoPRe | Fila 20 |
| Ganancia Bruta del Mes | Fila 28 |
| Impuesto Determinado | Fila 73 |
| Retención Efectiva | Fila 79 |

### Tests sugeridos

1. **Contraste con Excel**: Ingresar los mismos datos y comparar resultados
2. **Test de tope 35%**: Ingresar sueldo alto que genere retención superior al 35% del neto
3. **Test pluriempleo**: Ingresar datos de segundo empleo y verificar acumulación
4. **Test deducciones**: Ingresar alquiler y verificar 40% + 10% con tope MNI

---

## Build de producción (verificado)

| Check | Resultado |
|-------|-----------|
| Build de producción | ✅ 39 módulos, 0 errores |
| Dev server | ✅ Corriendo en localhost:5173 |
| Bundle size | 360KB (119KB gzip) |
