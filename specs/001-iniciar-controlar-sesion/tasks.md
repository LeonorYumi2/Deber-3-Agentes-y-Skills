# Tasks — Spec 001: Iniciar y controlar una sesión de estudio

Estado: aprobada
HU de origen: docs/historias/HU-001.md
RF cubiertos: RF-1 a RF-10

Formato: una tarea por vez. Las pruebas van DENTRO de cada tarea (primero en rojo, luego código, `npx jest` en verde antes de terminar la tarea — constitución, principio 4; ninguna tarea termina con pruebas en rojo). Las tareas de interfaz incluyen su lista manual de verificación y se marcan hechas solo cuando tú confirmes la prueba en el celular. Son 7 tareas de 20-30 min en orden de dependencia (no es necesario dividir la spec).

- [x] **T1. Instalar y configurar Jest y verificar async-storage.** (transversal, configuración)
  - Hecho cuando: se instalaron `jest`, `jest-expo` y `@types/jest`, se verificó que `@react-native-async-storage/async-storage` está disponible, `npx jest` corre con una prueba trivial en verde y `npx tsc --noEmit` no da errores.

- [x] **T2. Dominio (a): createInitialSession, start, pause, resume, remainingTime, statusAt.** RF-1, RF-2, RF-3, RF-7
  - Hecho cuando: las pruebas unitarias se escribieron primero en rojo (`src/domain/__tests__/session.test.ts`), luego se implementaron las funciones puras en `src/domain/session.ts` recibiendo `ahora` como parámetro (sin `Date.now()` ni `setInterval`), y `npx jest` está en verde para estas funciones.

- [x] **T3. Dominio (b): reset y buttonConfig.** RF-4, RF-8, RF-9, RF-10
  - Hecho cuando: las pruebas unitarias se escribieron primero en rojo, luego se implementaron `reset` y `buttonConfig` en `src/domain/session.ts`, y `npx jest` está en verde (incluye `finished` con `endTime <= ahora` y Reiniciar deshabilitado en `idle`).

- [ ] **T4. Persistencia: saveSession y loadSession.** RF-6, RF-7
  - Hecho cuando: las pruebas de persistencia se escribieron primero en rojo (`src/storage/__tests__/session.test.ts` con AsyncStorage mockeado), luego se implementaron `saveSession` y `loadSession` en `src/storage/session.ts`, y `npx jest` está en verde (guardar/leer sesión y `undefined` cuando no hay sesión previa).

- [ ] **T5. Pantalla (a): estructura y cronómetro MM:SS con sesión nueva en idle.** RF-1, RF-7
  - Hecho cuando: `src/app/index.tsx` muestra un cronómetro `MM:SS` del `remainingTime` con sesión nueva en `idle` (25 min) al abrir, ignorando la sesión guardada (restauración es HU-003); se crea `src/theme/colors.ts` si falta y se usan sus colores (`navy`, `mist`, `gold`) sin hardcodear; se entrega la lista manual de verificación de la pantalla. Marcar hecha solo cuando confirmes la prueba en el celular.
  - Lista manual de verificación (celular): al abrir la app se ve el cronómetro en `MM:SS` con 25:00 y colores de la fase estudio; no hay pantallas de registro ni inicio de sesión.

- [ ] **T6. Pantalla (b): botón principal, Reiniciar con Alert nativo y guardado en cada cambio.** RF-2, RF-3, RF-4, RF-5, RF-8, RF-9, RF-10
  - Hecho cuando: el botón principal cambia su etiqueta y habilitado según `buttonConfig` (Iniciar/Pausar/Reanudar; deshabilitado en `finished`); el botón Reiniciar usa un Alert nativo de RN (Sí/Cancelar) y al confirmar restaura `phaseDuration` en `idle`, al cancelar conserva el tiempo; `saveSession` se invoca al iniciar, pausar, reanudar y reiniciar; la pantalla refresca el cronómetro cada segundo con un intervalo que se limpia al salir de la pantalla, y al llegar a 00:00 muestra el estado terminado (RF-10); se entrega la lista manual de verificación. Marcar hecha solo cuando confirmes la prueba en el celular.
  - Lista manual de verificación (celular): iniciar → cuenta corre; pausar → tiempo se congela y botón es Reanudar; reanudar → continúa desde el tiempo de pausa; reiniciar (confirmar) → vuelve a 25:00 detenido; reiniciar (cancelar) → conserva el tiempo. El guardado no es observable en pantalla porque HU-001 ignora la sesión guardada; se verifica leyendo el código en /sdd-validate y con las pruebas de T4.

- [ ] **T7. Validación final.** RF-1 a RF-10
  - Hecho cuando: `npx jest` está en verde, `npx tsc --noEmit` está limpio y se ejecutó `/sdd-validate 001`.
