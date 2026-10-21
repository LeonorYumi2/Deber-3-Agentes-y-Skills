# Memoria del proyecto

Registro de decisiones y aprendizajes. Se actualiza al terminar cada tarea.

## Decisiones
- (2026-10-20) Plan de spec 001 (HU-001) aprobado en specs/001-iniciar-controlar-sesion/plan.md. Archivos: src/domain/session.ts (lógica pura: createInitialSession, start, pause, resume, reset, remainingTime, statusAt, buttonConfig), src/storage/session.ts (AsyncStorage: saveSession, loadSession), src/app/index.tsx (pantalla). No hay notificaciones en HU-001 (alarma es HU-004, decisión D9). Si loadSession devuelve sesión, HU-001 la ignora y muestra idle nuevo; restauración es HU-003.
- (2026-10-20) tasks.md de spec 001 aprobado: 7 tareas (pruebas dentro de cada tarea; dominio dividido en 2; pantalla en 2; validación final con /sdd-validate 001). No se divide la spec (menos de 10 tareas). T1 hecha: instaladas jest, jest-expo, @types/jest; añadida configuración de Jest en package.json (preset jest-expo, transformIgnorePatterns, script "test"); verificado @react-native-async-storage/async-storage@2.2.0; npx jest en verde; npx tsc --noEmit limpio.

## Pendientes y riesgos abiertos
- HU-003 y HU-004 son de riesgo alto: probar en build real, no solo en Expo Go.
- Spec HU-001 aprobada: dudas 1/2/4 resueltas como RF-8/RF-9/RF-10 (P4/P8); duda 3 resuelta (opción a: detener en 00:00; aviso/alarma HU-004, siguiente fase HU-002). Dudas abiertas: Ninguna.

## Lecciones
- ...