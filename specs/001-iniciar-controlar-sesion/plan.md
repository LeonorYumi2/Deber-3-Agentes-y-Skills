# Plan — Spec 001: Iniciar y controlar una sesión de estudio

Estado: aprobada
HU de origen: docs/historias/HU-001.md
RF cubiertos: RF-1 a RF-10.

Este plan define el QUÉ (archivos, responsabilidades, funciones puras, persistencia,
algoritmo, interfaz, decisiones y pruebas) sin mezclar stack de implementación salvo
las rutas de archivo exigidas por rn-conventions. Nada se implementa si no está en
la spec (constitución, principio 2).

---

## 1. Dependencias

- `jest` — pruebas unitarias de la lógica pura y persistencia.
- `jest-expo` — entorno de pruebas para Expo / React Native.
- `@types/jest` — tipos de TypeScript para Jest.
- `@react-native-async-storage/async-storage` — persistencia local de la sesión.

Nota: esta sección solo declara las dependencias necesarias; no se instalan en este plan.

---

## 2. Tabla de equivalencias de términos

Los nombres de archivo, funciones, campos y estados del código están en inglés, según
rn-conventions y AGENTS.md. Los textos de pantalla se mantienen en español.

| Término de la spec (español) | Término en código (inglés) | Significado |
|---|---|---|
| detenido | `idle` | Estado inicial, sin iniciar; no hay cuenta regresiva. |
| corriendo | `running` | Cuenta regresiva en curso (tiene `endTime`). |
| pausado | `paused` | Cuenta congelada por el usuario (tiene `pausedRemaining`). |
| terminado | `finished` | Llegó a `00:00`; la fase concluyó. |
| (función) iniciar | `createInitialSession` | Crea una sesión nueva en `idle` con `phaseDuration`. |
| (función) iniciar temporizador | `start` | Transición de `idle` a `running` fijando `endTime`. |
| (función) pausar | `pause` | Congela el tiempo restante en `pausedRemaining`. |
| (función) reanudar | `resume` | Reanuda la cuenta desde `pausedRemaining`. |
| (función) reiniciar | `reset` | Vuelve a `idle` conservando `phaseDuration`. |
| (función) tiempo restante | `remainingTime` | Calcula `max(0, endTime - ahora)` según el `status`. |
| (función) estado con ahora | `statusAt` | Deriva `finished` si `endTime <= ahora`; sino devuelve `status`. |
| (función) configuración de botones | `buttonConfig` | Devuelve etiqueta y `enabled` del principal y de Reiniciar. |
| (función) guardar sesión | `saveSession` | Serializa y guarda en AsyncStorage. |
| (función) leer sesión | `loadSession` | Lee la sesión guardada o devuelve `undefined`. |
| (campo) estado | `status` | Un solo campo: `idle` | `running` | `paused` | `finished`. |
| (campo) duración inicial de fase | `phaseDuration` | ms con la que empezó la fase en curso; se conserva al reiniciar. |
| (campo) hora de fin | `endTime` | Solo si `status == 'running'`. |
| (campo) tiempo restante en pausa | `pausedRemaining` | Solo si `status == 'paused'`. |

---

## 3. Archivos y responsabilidades

| Archivo | Responsabilidad | RF cubre |
|---|---|---|
| `src/domain/session.ts` | Lógica pura del temporizador: modelo de sesión, transiciones (start, pause, resume, reset) y cálculo de tiempo restante. Sin React, sin AsyncStorage, sin `Date.now()`. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-8, RF-9, RF-10 |
| `src/domain/__tests__/session.test.ts` | Pruebas unitarias Jest deterministas (reciben `ahora` como parámetro). | RF-1, RF-2, RF-3, RF-4, RF-8, RF-9, RF-10 |
| `src/storage/session.ts` | Persistencia de la sesión con AsyncStorage envuelto: `saveSession` y `loadSession`. `saveSession` se invoca al iniciar, pausar, reanudar y reiniciar (P1). `loadSession` solo para detectar la primera vez. | RF-6, RF-7 |
| `src/storage/__tests__/session.test.ts` | Pruebas de persistencia con AsyncStorage mockeado (guardar/leer/ausente al instalar). | RF-6, RF-7 |
| `src/app/index.tsx` | Pantalla principal (Expo Router): cronómetro `MM:SS`, botón principal (Iniciar/Pausar/Reanudar) y botón Reiniciar con Alert de confirmación. Si `loadSession` devuelve una sesión, HU-001 la ignora y muestra una sesión nueva en `idle`; la restauración es de HU-003. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-7, RF-8, RF-9, RF-10 |
| `src/theme/colors.ts` | Colores de la Academia Cotopaxi (ya existe). Fondo de fase estudio: `colors.navy`. No hardcodear colores en pantallas. | (transversal, apoya UI) |

Fuera de alcance de este plan (per spec 001, sección Fuera de alcance): notificaciones/alarma (HU-004), alternancia estudio/descanso (HU-002), ajuste de duraciones (HU-005), recuperación de sesión al abrir tras cierre o celular bloqueado (HU-003; RF-6 solo cubre guardar al cambiar el estado).

---

## 4. Funciones puras (src/domain/session.ts)

Todas reciben `ahora` (timestamp) como parámetro; ninguna llama a `Date.now()` ni usa
`setInterval` como fuente del tiempo. El tiempo restante siempre se calcula como
`max(0, endTime - ahora)` (background-timer).

### Modelo de sesión

```
Session = {
  status: 'idle' | 'running' | 'paused' | 'finished', // un solo campo, sin banderas booleanas
  phaseDuration: number,                              // ms con la que empezó la fase en curso
  endTime: number | undefined,                       // solo si status == 'running'
  pausedRemaining: number | undefined,               // solo si status == 'paused'
}
```

### Funciones

- `createInitialSession(ahora, duracionEstudio: number): Session`
  - Devuelve sesión `idle`, `phaseDuration = duracionEstudio`, sin `endTime` ni `pausedRemaining`.
  - Cubre: RF-1 (inicio con tiempo configurado), RF-7 (primera vez con valor por defecto 25 min).

- `start(session: Session, ahora: number): Session`
  - Si `status != 'idle'`: devuelve `session` sin cambios. Eso incluye `finished`: desde terminado no se inicia de nuevo al tocar Iniciar (RF-9: no se habilita Iniciar mientras no esté `idle`).
  - Si `status == 'idle'`: devuelve `{ ...session, status: 'running', endTime: ahora + session.phaseDuration, pausedRemaining: undefined }`.
  - Cubre: RF-1, RF-9.

- `pause(session: Session, ahora: number): Session`
  - Calcula `statusActual = statusAt(session, ahora)`. Si `statusActual != 'running'`, devuelve `session` sin cambios (no hace nada si la fase ya terminó).
  - Si `statusActual == 'running'`: `restante = max(0, session.endTime - ahora)`; devuelve `{ ...session, status: 'paused', endTime: undefined, pausedRemaining: restante }`.
  - Cubre: RF-2 (tiempo congelado).

- `resume(session: Session, ahora: number): Session`
  - Si `status != 'paused'`: devuelve `session` sin cambios.
  - Si `status == 'paused'`: devuelve `{ ...session, status: 'running', endTime: ahora + session.pausedRemaining, pausedRemaining: undefined }`.
  - Cubre: RF-3 (continúa desde el tiempo de pausa).

- `reset(session: Session): Session`
  - Devuelve `{ ...session, status: 'idle', endTime: undefined, pausedRemaining: undefined }`. `phaseDuration` se conserva (vuelve al tiempo inicial de la fase en curso). Queda `idle` esperando Iniciar.
  - Cubre: RF-4, RF-8.

- `remainingTime(session: Session, ahora: number): number`
  - `running`: `resto = session.endTime - ahora`; si `resto <= 0` retorna `0` (el UI usa `statusAt` para marcar `finished`); si no, retorna `resto`.
  - `paused`: retorna `session.pausedRemaining`.
  - `idle`: retorna `session.phaseDuration`.
  - `finished`: retorna `0`.
  - Cubre: RF-1, RF-2, RF-3 (muestra minutos y segundos que faltan).

- `statusAt(session: Session, ahora: number): 'idle' | 'running' | 'paused' | 'finished'`
  - Si `status == 'running'` y `session.endTime <= ahora`: retorna `'finished'`.
  - En otro caso: retorna `session.status`.
  - Cubre: RF-10 (al llegar a 00:00 la fase concluye).

### Configuración de botones (una sola función)

- `buttonConfig(status): { principal: { label: 'Iniciar' | 'Pausar' | 'Reanudar'; enabled: boolean }; reiniciar: { enabled: boolean } }`
  - `idle`: principal `{ label: 'Iniciar', enabled: true }`; reiniciar `{ enabled: false }` (RF-8: no hay sesión que reiniciar).
  - `running`: principal `{ label: 'Pausar', enabled: true }`; reiniciar `{ enabled: true }` (RF-9, RF-4).
  - `paused`: principal `{ label: 'Reanudar', enabled: true }`; reiniciar `{ enabled: true }` (RF-3, RF-4).
  - `finished`: principal `{ label: 'Reanudar', enabled: false }`; reiniciar `{ enabled: true }` (RF-10: principal deshabilitado, Reiniciar habilitado con confirmación de P6).
  - Cubre: RF-8, RF-9, RF-10.

---

## 5. Persistencia (src/storage/session.ts)

Clave fija en AsyncStorage, p. ej. `@pomodoro_cotopaxi:sesion`. Formato JSON del modelo de sesión.

- `saveSession(session: Session): Promise<void>` — serializa y guarda. Invocado al iniciar, pausar, reanudar y reiniciar (decisión P1). Cubre RF-6 (solo cubre guardar, no restaurar).
- `loadSession(): Promise<Session | undefined>` — lee y devuelve la sesión o `undefined` si no hay. Solo se usa para detectar la primera vez (RF-7). Si devuelve una sesión guardada, HU-001 la ignora y muestra una sesión nueva en `idle`; la restauración de una sesión en curso al abrir pertenece a HU-003.

---

## 6. Algoritmo en pseudocódigo

```
FUNCION start(sesion, ahora):
  SI sesion.status != 'idle':
    RETORNAR sesion  // RF-9: desde running/paused/finished no se inicia de nuevo
  RETORNAR copiar(sesion) con:
    status = 'running'
    endTime = ahora + sesion.phaseDuration
    pausedRemaining = undefined

FUNCION pause(sesion, ahora):
  statusActual = statusAt(sesion, ahora)
  SI statusActual != 'running':
    RETORNAR sesion  // no hace nada si la fase ya terminó
  restante = max(0, sesion.endTime - ahora)
  RETORNAR copiar(sesion) con:
    status = 'paused'
    endTime = undefined
    pausedRemaining = restante

FUNCION resume(sesion, ahora):
  SI sesion.status != 'paused':
    RETORNAR sesion
  RETORNAR copiar(sesion) con:
    status = 'running'
    endTime = ahora + sesion.pausedRemaining
    pausedRemaining = undefined

FUNCION reset(sesion):
  // RF-4: vuelve al tiempo inicial de la fase en curso; RF-8: queda idle
  RETORNAR copiar(sesion) con:
    status = 'idle'
    endTime = undefined
    pausedRemaining = undefined
  // phaseDuration se conserva

FUNCION remainingTime(sesion, ahora):
  SEGUN sesion.status:
    'running':
      resto = sesion.endTime - ahora
      SI resto <= 0: RETORNAR 0
      RETORNAR resto
    'paused': RETORNAR sesion.pausedRemaining
    'idle': RETORNAR sesion.phaseDuration
    'finished': RETORNAR 0

FUNCION statusAt(sesion, ahora):
  SI sesion.status == 'running' Y sesion.endTime <= ahora:
    RETORNAR 'finished'
  RETORNAR sesion.status
```

Nota: nunca se resta 1 segundo por tick. El intervalo de la UI solo refresca la pantalla llamando a `remainingTime(sesion, ahora)` cada tick.

---

## 7. Interfaz (src/app/index.tsx)

Convenciones rn-conventions: pantalla en `src/app/` (archivo `index.tsx` de Expo Router), StyleSheet para estilos, colores solo desde `src/theme/colors.ts`, limpiar intervalos/listeners en el cleanup de `useEffect`, solo Android.

Elementos de pantalla:
- Cronómetro grande con `MM:SS` del `remainingTime(session, ahora)`. Textos de interfaz en español (AGENTS.md).
- Botón principal (una sola pieza, decisión P4), etiqueta y habilitado según `buttonConfig(status)`:
  - `idle`: "Iniciar", habilitado. Al tocar → `start`, guardar sesión. (RF-1, RF-7)
  - `running`: "Pausar", habilitado. Al tocar → `pause`, guardar sesión. (RF-2)
  - `paused`: "Reanudar", habilitado. Al tocar → `resume`, guardar sesión. (RF-3)
  - `finished`: deshabilitado. (RF-10)
- Botón "Reiniciar" aparte: habilitado según `buttonConfig(status).reiniciar.enabled`. Al tocar → Alert nativo de RN (decisión P6) con "Sí" / "Cancelar". Al confirmar → `reset`, guardar sesión, queda `idle`. Al cancelar → sin cambios. (RF-4, RF-5, RF-10)
- Al abrir la app: llamar `loadSession`. Si devuelve una sesión, HU-001 la ignora y muestra una sesión nueva en `idle` con `phaseDuration = 25 min` (RF-7). La restauración de una sesión en curso pertenece a HU-003. (RF-6, RF-7)
- Colores: fase estudio usa `colors.navy` de fondo, `colors.mist` de texto, `colors.gold` de botón (theme ya existente; no hardcodear).
- Notificaciones: NO se programan en esta spec (alarma es HU-004, fuera de alcance). Véase decisión D9 abajo.

---

## 8. Decisiones justificadas con alternativa descartada

Todas las decisiones de diseño están en `specs/001-iniciar-controlar-sesion/decisiones.md` (P1–P8) y se respetan tal cual (constitución, principio 2). Se enumeran aquí con la alternativa descartada y el RF que refuerzan. Se añaden las tres decisiones técnicas requeridas.

| ID | Decisión | Alternativa descartada | Motivo | RF |
|---|---|---|---|---|
| D1 | Guardar sesión al iniciar, pausar, reanudar y reiniciar (P1). | Solo al cerrar la app. | Si el SO mata el proceso o hay cierre abrupto, se pierde la sesión más reciente; incoherente con cálculo sin contar segundos y con HU-003. | RF-6 |
| D2 | Reiniciar restaura `phaseDuration` (tiempo con el que empezó la fase), no la configuración de ajustes vigente (P2). | Usar la configuración actual de ajustes. | Si el usuario cambia la duración en ajustes mientras la fase está activa, reiniciar con el valor vigente haría perder el tiempo inicial de la fase (contradice HU-001 y HU-005). | RF-4, RF-8 |
| D3 | Inicio inmediato al tocar Iniciar (P3). | Aviso de 3 s ("prepárate") antes de iniciar. | Añade pantallas y estados no requeridos por los criterios de aceptación de HU-001. | RF-1 |
| D4 | Dos botones: uno principal (Iniciar → Pausar → Reanudar) + Reiniciar aparte (P4). | Botones separados Iniciar/Pausar/Reanudar/Reiniciar. | Más re-layout y más botones en pantalla; menos simple. | RF-8, RF-9, RF-10 |
| D5 | Primera vez: valores por defecto inmediatamente (estudio 25 min) (P5). | Obligar a pasar por ajustes primero. | HU-006 exige llegar directo al temporizador al abrir por primera vez, sin trámites. | RF-7 |
| D6 | Confirmación de reinicio con Alert nativo de RN (P6). | Modal/pantalla personalizada. | Bajo costo de implementación para HU-001, sin pantallas nuevas ni navegación. | RF-4, RF-5, RF-10 |
| D7 | En pausa se muestra el tiempo congelado junto con el botón Reanudar (P7). | Ocultar el tiempo, mostrar solo Reanudar. | HU-001 requiere ver "el tiempo en que se pausó"; ocultarlo rompería el criterio de aceptación. | RF-2 |
| D8 | Tras reiniciar, el temporizador queda `idle` esperando Iniciar (P8). | Queda en el mismo estado (running/paused). | Más predecible: no empieza a correr sin que el usuario lo pida explícitamente. | RF-4, RF-8 |
| D9 | No se programa notificación local al iniciar/reanudar en esta spec (diferida a HU-004). | Programar notificación al iniciar (regla general de background-timer). | Spec 001 declara avisos de fin de fase/alarma fuera de alcance (pertenecen a HU-004). La constitution (principio 2) manda no implementar lo que no está en la spec activa. | — (transversal) |
| T-A | Guardar la hora de fin (`endTime`) en lugar de restar segundos por tick. | Restar 1 segundo por tick con `setInterval`. | Con `endTime` el cálculo es correcto con el celular bloqueado o la app cerrada (constitución, principio 5). | RF-1, RF-2, RF-3, RF-10 |
| T-B | Pasar `ahora` como parámetro a las funciones de dominio. | Llamar a `Date.now()` dentro de las funciones. | Hace las funciones puras y deterministas, probables con Jest sin depender del reloj real (background-timer). | RF-1…RF-10 |
| T-C | Derivar `finished` al leer comparando `endTime` con `ahora` (`statusAt`). | Guardar `finished` con un temporizador separado. | No depende de un temporizador que pueda fallar si el SO mata el proceso; `finished` se calcula siempre al comparar. | RF-10 |

---

## 9. Estrategia de pruebas con Jest

`npx jest` debe estar en verde antes de pasar a la siguiente tarea (constitución, principio 4). No se avanza con pruebas en rojo.

### Pruebas unitarias de dominio (`src/domain/__tests__/session.test.ts`)

Todas las funciones reciben `ahora` como parámetro, por lo que son deterministas y no dependen del reloj real.

- **RF-1**: `start` desde `idle` produce `status == 'running'` y `endTime == ahora + phaseDuration`; `remainingTime` devuelve `phaseDuration` al instante.
- **RF-2**: `pause` desde `running` congela `pausedRemaining = endTime - ahora` y `status == 'paused'`; `remainingTime` devuelve ese valor congelado aunque pase `ahora`.
- **RF-3**: `resume` desde `paused` produce `status == 'running'` y `endTime == ahora + pausedRemaining`; la cuenta continúa desde el tiempo de pausa.
- **RF-4**: `reset` desde `running` o `paused` produce `status == 'idle'`, `endTime == undefined`, `pausedRemaining == undefined`, y `phaseDuration` se conserva.
- **RF-8**: `buttonConfig('idle').reiniciar.enabled == false`; `remainingTime('idle') == phaseDuration`.
- **RF-9**: `buttonConfig` devuelve `enabled: false` para el principal en `finished`; en `running` y `paused` la etiqueta es "Pausar"/"Reanudar", nunca "Iniciar"; `start` no transiciona desde `running`/`paused`/`finished`.
- **RF-10**: `statusAt` devuelve `'finished'` cuando `endTime <= ahora`; `remainingTime` devuelve `0`; `buttonConfig('finished').principal.enabled == false` y `.reiniciar.enabled == true`.
- **RF-7**: `createInitialSession` con `duracionEstudio = 25 min` cuando no hay sesión guardada (primera vez).

Casos límite (sección Casos límite de la spec): reiniciar corriendo y pausado (ambos → `idle` en `phaseDuration`); cambiar de opinión al reiniciar (sin cambios — ver manual); pausar y reanudar varias veces (tiempo correcto tras cada ciclo); primera vez sin configurar (valor por defecto).

### Pruebas de persistencia (`src/storage/__tests__/session.test.ts`)

Con `jest.mock('@react-native-async-storage/async-storage')`:
- Guardar y leer devuelve la misma sesión (serialización/deserialización).
- Leer sin sesión previa devuelve `undefined` (primera vez, RF-7).

### Qué NO se prueba con Jest (pasa a la lista manual de verificación de la interfaz)

- **RF-5** (cambiar de opinión al reiniciar: cancelar el Alert y conservar la sesión) — depende de la interacción con el Alert nativo de RN en la pantalla.
- "saveSession se invoca tras iniciar, pausar, reanudar y reiniciar" — depende de la integración entre la UI y el storage; se verifica en la lista manual de la tarea probada en el celular.

### Alcance de interfaz y alarmas

La interfaz y las notificaciones se verifican con la lista manual de verificación de la tarea, probada en el celular (no con Jest). Las pruebas Jest cubren solo la lógica pura y la persistencia como funciones aisladas.

---

## 10. Criterios de finalización de este plan

- Cada escenario de HU-001 (Iniciar, Pausar y continuar, Reiniciar, Cambiar de opinión al reiniciar) está cubierto por al menos un RF verificable (RF-1 a RF-10).
- Las funciones puras tienen pruebas Jest en verde.
- Nada se implementa fuera de esta spec (notificaciones, alternancia de fases y ajustes quedan para HU-002/HU-004/HU-005).
- El plan está **aprobado**.
