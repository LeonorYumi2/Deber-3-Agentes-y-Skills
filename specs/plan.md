# Plan técnico: Pomodoro Cotopaxi

## 1. Arquitectura por capas

| Capa | Responsabilidad | Tecnología |
|------|-----------------|------------|
| `src/domain` | Lógica pura del temporizador: fases, ciclo Pomodoro, cálculo de tiempo restante por `endTime`, sin React ni Expo | TypeScript puro |
| `src/storage` | Persistencia local de ajustes y estado de sesión | AsyncStorage |
| `src/notifications` | Permisos, programar y cancelar alarmas (notificaciones locales) | expo-notifications |
| `src/theme` | Paleta oficial de la Academia Cotopaxi | `src/theme/colors.ts` |
| `src/app` | Pantallas y navegación (Expo Router) | React Native + expo-router |

## 2. Modelo de tiempo (constitución, regla 4)

El temporizador **no cuenta segundos con `setInterval`**. En su lugar:

- Al iniciar una fase se graba `endTime = ahora + duracionFase` y se guarda en almacenamiento.
- El tiempo restante se calcula siempre como `max(0, endTime - ahora)`.
- Al recuperar la sesión (app cerrada/bloqueada) se vuelve a calcular desde `endTime`, por lo que el conteo es correcto aunque el celular haya estado bloqueado o la app cerrada.

## 3. Dominio (`src/domain`)

### `types.ts`
- `Fase = 'estudio' | 'descanso-corto' | 'descanso-largo'`
- `Configuracion`: estudioMinutos, descansoCortoMinutos, descansoLargoMinutos, pomodorosPorCiclo (default 4).
- `Sesion`: faseActual, pomodorosCompletados, endTime, enPausa, tiempoRestanteEnPausa, terminado.

### `timer.ts`
- `iniciar(fase, duracionSegundos)`: fija endTime y marca sesión activa.
- `pausar()`: guarda `tiempoRestanteEnPausa = endTime - ahora`, marca enPausa.
- `reanudar()`: recalcula endTime = ahora + tiempoRestanteEnPausa.
- `reiniciar()`: vuelve al tiempo inicial de la fase actual.
- `restante()`: `max(0, endTime - ahora)` o `tiempoRestanteEnPausa` si está en pausa.

### `ciclo.ts`
- Al terminar un tiempo de estudio: si pomodorosCompletados < pomodorosPorCiclo → próximo es descanso corto; si llegó al límite → descanso largo y reinicia contador de pomodoros a cero.
- Al terminar un descanso: próximo es estudio.
- Devuelve la siguiente fase y el pomodoro actual del ciclo.

## 4. Almacenamiento (`src/storage`)

Guardar en AsyncStorage:
- `configuracion`: ajustes del usuario (valores por defecto si no existe).
- `sesion`: estado actual de la fase, pomodoros, endTime, pausa.
Leer al montar la app para recuperar la sesión tras cierre o bloqueo.

## 5. Notificaciones (`src/notifications`)

- Solicitar permiso al iniciar el primer temporizador (explicando para qué).
- Programar notificación local para el momento en que termine la fase (usando `endTime`).
- La notificación debe sonar aunque el celular esté en silencio (canal de alarma en Android, sonido crítico en iOS según soporte del módulo).
- Al tocar la notificación o botón detener: silenciar alarma y abrir app mostrando la siguiente fase.
- Cancelar notificación al pausar o reiniciar.

**Nota de riesgo:** expo-notifications es un módulo nativo; no está incluido en Expo Go. HU-003 y HU-004 requieren probar en build de desarrollo (EAS o `expo run:android|ios`), no solo en Expo Go.

## 6. Pantallas (`src/app`)

- `(index)` — pantalla principal del temporizador: fase actual, pomodoros del ciclo, temporizador grande (mm:ss), botones iniciar / pausar / reiniciar (con confirmación antes de reiniciar).
- `ajustes` — campos de estudio, descanso corto, descanso largo, pomodoros por ciclo; validar campos no vacíos, mayor que cero y dentro del rango; botón guardar y restablecer a valores por defecto (25/5/15/4 con confirmación).
- Navegación con expo-router, sin header (Stack con `headerShown: false`).

## 7. Idioma y marca

- Todos los textos de la interfaz en español.
- Colores únicamente desde `src/theme/colors.ts` (navy, indigo, gold, sand, mist, white).
- Estudio: fondo navy, texto mist, botón gold. Descanso: fondo gold, texto navy, botón navy. Ajustes: fondo mist, títulos navy, tarjetas sand.
- Botones de al menos 48 px de alto. Temporizador grande y legible (mm:ss). Siempre visible: fase actual y pomodoros del ciclo.

## 8. Riesgos abiertos

- HU-003 y HU-004 (alto riesgo): comportamiento con app cerrada y celular bloqueado depende de notificaciones nativas y del SO; validar en build real.
