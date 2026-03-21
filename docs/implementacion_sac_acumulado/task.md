# Tareas: Corrección del SAC Acumulado por Semestres (AFIP)

- [x] Crear plan de implementación para independizar el SAC por semestres (Paso 4 y deducciones).
- [x] Modificar `src/engine/calculationEngine.js` para aplicar el salto a `sacRealAcum` al cierre del primer semestre sin recalcular 1/12 retrospectivo.
- [x] Extraer `deduccionesSobreSAC` de la acumulación genérica y atarla al `sacComputableAcum * 0.17`, garantizando auto-ajuste de la retención.
- [x] Ejecutar `npm run build` para validar que no haya errores de dependencias (se instaló `firebase`).
- [x] Completar instalación e informar al usuario de la finalización de los arreglos.
