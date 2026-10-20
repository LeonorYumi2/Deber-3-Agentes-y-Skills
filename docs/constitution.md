# Constitución — Pomodoro Cotopaxi

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. Simplicidad primero: solo las dependencias que AGENTS.md autoriza. Sin
   cuentas, backend, publicidad ni analytics.
2. La spec manda: nada se implementa si no está en la spec activa. Si falta
   una decisión, se para y se pregunta.
3. Lógica separada de interfaz: las reglas del temporizador viven en
   funciones puras de src/domain, sin React ni almacenamiento.
4. Pruebas como puerta: la lógica se prueba con Jest. Prohibido avanzar con
   pruebas en rojo. La interfaz y las alarmas se verifican con la lista
   manual de la tarea.
5. El tiempo no se cuenta, se calcula: el tiempo restante sale de la hora de
   fin, nunca de restar segundos, para que sea correcto con el celular
   bloqueado o la app cerrada.
6. Los datos del usuario son locales y sagrados: nada sale del celular y
   lo guardado se conserva ante cambios de código.
7. HU-001 a HU-006 son la línea base: se puede añadir, no quitar.