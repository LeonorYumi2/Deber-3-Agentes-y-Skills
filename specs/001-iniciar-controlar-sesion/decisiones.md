# Decisiones de diseño — HU-001 (Iniciar y controlar una sesión de estudio)

Fuentes consultadas: docs/constitution.md, docs/historias/HU-001.md.
Máximo 8 preguntas del grilling. Todas respondidas.

---

## P1 — Persistencia de la sesión

**Pregunta:** ¿Cuándo se guarda la sesión (estado, fase, tiempo restante) de forma local al cambiar el estado?

**Opciones:**
- Al iniciar, pausar, reanudar y reiniciar
- Solo al cerrar la app
- Al iniciar y al pausar, no al reanudar ni al reiniciar

**Decisión:** Al iniciar, pausar, reanudar y reiniciar.

**Motivo:** Garantiza que, si el SO mata el proceso o el usuario cierra la app de forma abrupta, la sesión recuperable sea siempre la más reciente. Es coherente con la constitución (cálculo del tiempo restante sin contar segundos) y con HU-003 (recuperar sesión al volver a abrir).

---

## P2 — Fuente del tiempo al reiniciar

**Pregunta:** ¿Qué tiempo usa el botón reiniciar para volver al inicio de la fase actual?

**Opciones:**
- La configuración actual (valor de ajustes guardado en ese momento)
- La duración con la que empezó la fase
- Por defecto 25 min

**Decisión:** La duración con la que empezó la fase.

**Motivo:** Reiniciar con la configuración vigente contradice dos fuentes:
  - HU-001: "el temporizador vuelve al **tiempo inicial de la fase** en la que estoy".
  - HU-005: "la fase actual termina con el **tiempo con el que empezó**".
  
  Si el usuario cambia el tiempo en ajustes mientras una fase está en curso y luego pulsa reiniciar, usar la configuración vigente le haría perder el tiempo con el que empezó la fase. Por eso se guarda la duración con la que empezó cada fase y reiniciar restaura ese valor, no el de ajustes actual. Los cambios de configuración siguen aplicándose solo a la siguiente fase, como exige HU-005.

---

## P3 — Inicio del temporizador

**Pregunta:** ¿Empieza el temporizador inmediatamente al tocar iniciar?

**Opciones:**
- Sí, al instante
- No, aviso de 3 s ("prepárate")

**Decisión:** Sí, al instante.

**Motivo:** Mantiene la UI simple y directa. HU-001 no requiere cuenta regresiva previa; agregar un aviso de preparación añade pantallas y estados que no están en los criterios de aceptación.

---

## P4 — Diseño de botones

**Pregunta:** ¿Dos botones (uno principal que cambia entre Iniciar/Pausar/Reanudar, más Reiniciar aparte) o botones separados (Iniciar, Pausar, Reanudar, Reiniciar)? ¿Qué queda habilitado en cada estado?

**Opciones:**
- Dos botones
- Botones separados

**Decisión:** Dos botones. Uno principal que cambia su etiqueta según el estado (Iniciar → Pausar → Reanudar), más un botón Reiniciar aparte.

**Motivo:** Menos botones en pantalla y menos re-layout. Coherente con P7 (tiempo congelado visible en pausa).

**Habilitado por estado:**
- Detenido: principal (Iniciar) habilitado; Reiniciar deshabilitado (no hay sesión que reiniciar).
- Corriendo: principal (Pausar) habilitado; Reiniciar habilitado (con confirmación).
- Pausado: principal (Reanudar) habilitado; Reiniciar habilitado (con confirmación).

---

## P5 — Primera vez sin configurar

**Pregunta:** ¿Al instalar, el temporizador arranca con 25 min sin configurar nada?

**Opciones:**
- Sí, valores por defecto inmediatamente
- No, obliga a pasar por ajustes primero

**Decisión:** Sí, valores por defecto inmediatamente.

**Motivo:** HU-006 exige llegar directo al temporizador al abrir por primera vez, sin trámites. Los valores por defecto son estudio 25 min, descanso corto 5 min, descanso largo 15 min, 4 pomodoros (HU-005).

---

## P6 — Confirmación de reinicio

**Pregunta:** ¿Cómo se confirma el reinicio del temporizador?

**Opciones:**
- Alert nativo de React Native
- Modal/pantalla personalizada

**Decisión:** Alert nativo de RN.

**Motivo:** Rapidez y bajo costo de implementación para HU-001 (riesgo bajo). No requiere pantallas nuevas ni navegación adicional. Se revisará si HU-005 (restablecer por defecto) justifica un modal propio.

---

## P7 — Visualización en pausa

**Pregunta:** ¿Qué se ve en pantalla cuando el temporizador está pausado?

**Opciones:**
- Tiempo congelado (se ve el tiempo restante y botón reanudar)
- Solo botón reanudar (se oculta el tiempo)

**Decisión:** Tiempo congelado.

**Motivo:** HU-001 requiere que el usuario vea "el tiempo en que se pausó". Ocultar el tiempo rompería el criterio de aceptación de pausa/continuar. El botón reanudar aparece junto al tiempo congelado.

## P8 — Estado tras reiniciar

**Pregunta:** Tras reiniciar, ¿el temporizador queda detenido en el tiempo inicial esperando Iniciar, o sigue en el mismo estado (corriendo/pausado)?

**Opciones:**
- Detenido esperando Iniciar
- Mismo estado

**Decisión:** Detenido esperando Iniciar.

**Motivo:** HU-001 dice que reiniciar "vuelve al tiempo inicial de la fase". Quedar detenido es lo más predecible: el temporizador no empieza a correr sin que el usuario lo pida explícitamente. Si el usuario quiere continuar, pulsa Iniciar.

---

Esperando tu aprobación antes de escribir la spec ni código.
