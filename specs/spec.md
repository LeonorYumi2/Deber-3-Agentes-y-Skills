# Spec: Pomodoro Cotopaxi

App móvil Pomodoro para la Academia Cotopaxi. Funciona sin cuenta,
sin internet y sin publicidad.

## 1. Referencias y fuentes de verdad

- `docs/constitution.md` — reglas que ningún agente ni desarrollador puede romper.
- `docs/historias/HU-001.md` a `HU-006.md` — historias de usuario y criterios de aceptación.
- HU-001 a HU-006 son la línea base: se puede añadir funcionalidad, no quitar.

## 2. Alcance

La aplicación debe permitir al estudiante:

1. Iniciar, pausar y reiniciar un temporizador de estudio (HU-001).
2. Alternar automáticamente entre estudio y descanso según la técnica Pomodoro (HU-002).
3. Mantener el conteo con el celular bloqueado o la app cerrada (HU-003).
4. Recibir aviso al terminar el tiempo, incluso con el celular en silencio (HU-004).
5. Ajustar los tiempos del pomodoro y restablecer valores por defecto (HU-005).
6. Usarla sin registro, sin conexión y sin publicidad (HU-006).

## 3. Requisitos funcionales (por historia)

### HU-001: Iniciar y controlar una sesión de estudio

- Desde la pantalla principal, al presionar iniciar, empieza la cuenta regresiva con el tiempo de estudio configurado y se ven los minutos y segundos que faltan.
- Al pausar y luego reanudar, la cuenta sigue desde el tiempo en que se pausó.
- Al reiniciar (con confirmación), el temporizador vuelve al tiempo inicial de la fase actual.
- Al cancelar el reinicio, el temporizador conserva el tiempo que llevaba.

### HU-002: Alternar entre estudio y descanso

- Al terminar un tiempo de estudio, si aún no se completan los pomodoros necesarios para el descanso largo, la app deja listo un descanso corto para iniciar.
- Al completar la cantidad de pomodoros configurada (cuatro por defecto), al terminar el último tiempo de estudio, la app deja listo un descanso largo y el contador de pomodoros vuelve a cero.
- Al terminar un descanso corto o largo, la app deja listo el siguiente tiempo de estudio.
- En la pantalla principal se ve si se está en estudio o en descanso y cuántos pomodoros se llevan en el ciclo actual.

### HU-003: Mantener el conteo con el celular bloqueado o la app cerrada

- Bloqueando y desbloqueando el celular, la app muestra el tiempo restante correcto, descontando lo que pasó mientras estaba bloqueado.
- Cerrando la app desde las apps recientes y volviendo a abrir, la app recupera la sesión y muestra el tiempo restante correcto.
- Si el tiempo se cumple antes de volver a abrir la app, al abrirla se recibe el aviso de fin y la fase aparece como terminada.
- Si el temporizador estaba pausado al cerrar la app, al volver a abrir sigue pausado con el mismo tiempo restante y no hay aviso.

### HU-004: Recibir aviso al terminar el tiempo

- Al llegar a cero, se recibe una notificación con sonido y vibración que indica qué fase terminó (celular con sonido).
- Con el celular en silencio o vibración, la app suena como alarma, vibra y muestra el aviso en la pantalla de bloqueo.
- Al tocar la notificación o el botón de detener, la alarma se calla y la app se abre mostrando la siguiente fase.
- Al iniciar un temporizador por primera vez sin permiso de notificaciones, la app explica para qué lo necesita y lo solicita.

### HU-005: Ajustar los tiempos del pomodoro

- Desde la pantalla de ajustes, al cambiar un tiempo y guardar, el nuevo valor se usa desde la próxima fase y se mantiene al cerrar la app.
- Al dejar un campo vacío, poner cero o un valor fuera del rango permitido, la app no guarda el cambio e indica qué valores se pueden usar.
- Al elegir restablecer (con confirmación), los tiempos vuelven a: estudio 25 min, descanso corto 5 min, descanso largo 15 min, 4 pomodoros por ciclo.
- Al cambiar la duración de una fase mientras esa fase está en curso, la fase actual termina con el tiempo con el que empezó y el cambio se aplica a la siguiente.

### HU-006: Usar la aplicación sin registro, sin internet y sin publicidad

- Al abrir por primera vez, se llega directo al temporizador, sin pantallas de registro ni de inicio de sesión.
- Sin datos móviles ni wifi, el temporizador, los avisos y los ajustes funcionan igual y los ajustes quedan guardados en el celular.
- No aparece ningún anuncio en ninguna pantalla.

## 4. Requisitos no funcionales (constitución)

1. Sin cuenta, sin backend, sin internet: todo funciona offline.
2. Sin publicidad ni telemetría: ninguna librería de anuncios o analytics.
3. Datos solo locales (AsyncStorage): nada sale del celular.
4. El tiempo se calcula con la hora de fin (`endTime`), no contando segundos, para que el conteo sea correcto con el celular bloqueado o la app cerrada.
5. La alarma debe sonar aunque el celular esté en silencio.
6. Identidad visual de la Academia Cotopaxi en todas las pantallas (paleta oficial en `src/theme/colors.ts`, nunca hardcodeada).
7. TypeScript estricto: la lógica del temporizador vive en `src/domain`, separada de la UI.
8. Todo cambio de comportamiento empieza en la spec (`/sdd-change`), nunca en el código.
9. Nada de código sin spec aprobada. Se implementa una tarea a la vez.

## 5. Interfaces y pantallas

- Pantalla principal (temporizador): fase actual, contador de pomodoros del ciclo, temporizador grande (mm:ss), botones iniciar/pausar/reiniciar.
- Pantalla de ajustes: duración de estudio, descanso corto, descanso largo, pomodoros por ciclo; botón guardar y restablecer por defecto.
- Notificación de fin de fase: indica qué fase terminó, con sonido, vibración y aviso en pantalla de bloqueo; acción para detener y ver siguiente fase.

## 6. Criterios de aceptación globales

Cada criterio de aceptación de HU-001 a HU-006 se considera un requisito verificable de esta spec. Una tarea de implementación no se da por terminada hasta que sus criterios de aceptación asociados estén cubiertos.
