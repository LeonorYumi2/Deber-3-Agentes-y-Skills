# Tareas de implementación: Pomodoro Cotopaxi

Regla: una tarea a la vez. Al terminar cada tarea, registrar la decisión en `MEMORY.md`.
No se escribe código sin la spec aprobada (`specs/spec.md`).

## Tarea 1 — Dominio: tipos y temporizador base (endTime)
**Objetivo:** lógica pura para iniciar, pausar, reanudar y reiniciar una fase usando `endTime`.
**Entregables:**
- `src/domain/types.ts`: `Fase`, `Configuracion`, `Sesion`.
- `src/domain/timer.ts`: `iniciar`, `pausar`, `reanudar`, `reiniciar`, `restante`.
**Verificación:** pruebas unitarias del dominio sin celular (cálculo correcto de `restante` al simular paso de tiempo; pausa conserva tiempo; reinicio vuelve al inicial).
**Criterios de aceptación:** HU-001 (iniciar, pausar/continuar, reiniciar, cancelar reinicio).

## Tarea 2 — Dominio: ciclo Pomodoro
**Objetivo:** determinar la siguiente fase y el contador de pomodoros.
**Entregables:**
- `src/domain/ciclo.ts`: lógica de transición estudio → descanso corto/largo → estudio; reinicio del contador al llegar a `pomodorosPorCiclo`.
**Verificación:** pruebas unitarias del ciclo (descanso corto tras estudio, descanso largo tras el 4.º pomodoro, contador a cero).
**Criterios de aceptación:** HU-002 (terminar pomodoro, descanso largo, terminar descanso, ver avance).

## Tarea 3 — Almacenamiento local
**Objetivo:** persistir configuración y sesión en AsyncStorage.
**Entregables:**
- `src/storage/config.ts`: leer/guardar `Configuracion` (valores por defecto 25/5/15/4).
- `src/storage/sesion.ts`: leer/guardar `Sesion` para recuperar tras cierre o bloqueo.
**Verificación:** los valores se mantienen tras cerrar la app; se recupera la sesión al abrir.
**Criterios de aceptación:** HU-005 (cambiar y guardar persiste), HU-003 (cerrar y recuperar sesión).

## Tarea 4 — Notificaciones y alarmas
**Objetivo:** permisos, programar y cancelar avisos de fin de fase.
**Entregables:**
- `src/notifications/index.ts`: solicitar permiso, programar notificación para `endTime`, cancelar, manejar presión de notificación.
- Instalar `expo-notifications` (`npx expo install expo-notifications`).
**Verificación:** notificación suena y vibra al llegar a cero; con celular en silencio se comporta como alarma; tocar notificación abre la siguiente fase.
**Nota:** probar en build real, no solo Expo Go (módulo nativo).
**Criterios de aceptación:** HU-004 (aviso con sonido, con silencio, detener, permiso primera vez).

## Tarea 5 — Pantalla principal del temporizador
**Objetivo:** UI de HU-001 y HU-002.
**Entregables:**
- `src/app/index.tsx`: fase actual, pomodoros del ciclo, temporizador grande (mm:ss), botones iniciar/pausar/reiniciar.
- Uso de `src/theme/colors.ts` y `phaseTheme` (estudio/descanso).
**Verificación:** cuenta regresiva correcta, pausa/reanuda, reinicio con confirmación, fase y pomodoros siempre visibles.
**Criterios de aceptación:** HU-001, HU-002.

## Tarea 6 — Pantalla de ajustes
**Objetivo:** UI de HU-005.
**Entregables:**
- `src/app/ajustes.tsx`: campos de estudio, descanso corto, descanso largo, pomodoros por ciclo; validación (no vacío, mayor que cero, dentro de rango); guardar y restablecer por defecto con confirmación.
**Verificación:** valores inválidos no se guardan y se muestra mensaje; restablecer vuelve a 25/5/15/4.
**Criterios de aceptación:** HU-005 (cambiar un tiempo, valor no válido, volver a por defecto, cambio con fase en curso aplica a la siguiente).

## Tarea 7 — Recuperación de sesión y alarmas al abrir
**Objetivo:** HU-003 y HU-004 con app cerrada/bloqueada.
**Entregables:**
- Al montar la app, leer sesión de almacenamiento y recalcular `restante` desde `endTime`.
- Si la fase terminó mientras la app estaba cerrada, mostrar aviso de fin y siguiente fase.
- Si estaba pausada, seguir pausada sin aviso.
**Verificación:** bloquear/desbloquear y cerrar/abrir muestra tiempo correcto; fase terminada muestra aviso.
**Criterios de aceptación:** HU-003, HU-004.

## Tarea 8 — Validación final
**Objetivo:** verificar que todo cumple la spec y la constitución.
**Entregables:**
- `npx tsc --noEmit` sin errores (TypeScript estricto).
- `npx expo lint` sin errores.
- Revisar cada criterio de aceptación de HU-001 a HU-006 contra la implementación.
- Confirmar: sin cuenta, sin internet, sin anuncios, datos locales, marca Cotopaxi.
**Criterios de aceptación:** todas las HU.
