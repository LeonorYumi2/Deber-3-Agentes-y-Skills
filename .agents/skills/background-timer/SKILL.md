---
name: background-timer
description: Regla de dominio para el conteo con celular bloqueado o app cerrada y para las alarmas. Úsala al tocar el temporizador, la sesión persistida o las notificaciones.
---
# Temporizador en segundo plano

## Principio
Nunca contar segundos con setInterval ni restar 1 por tick.
El tiempo restante siempre se calcula: restante = max(0, endTime - ahora).
El intervalo solo refresca la pantalla; no es la fuente del tiempo.

## Modelo de sesión
- estado: 'detenido' | 'corriendo' | 'pausado' | 'terminado' (un solo campo, sin banderas booleanas)
- fase: 'estudio' | 'descanso-corto' | 'descanso-largo'
- duracionFase: duración con la que EMPEZÓ la fase (sirve para reiniciar y para
  que un cambio de ajustes no afecte la fase en curso)
- endTime: solo si está corriendo
- tiempoRestanteEnPausa: solo si está pausado
- pomodorosCompletados

## Reglas
- Las funciones de dominio reciben `ahora` como parámetro (son puras y probables).
- Al abrir la app: leer la sesión guardada y recalcular. Si endTime ya pasó,
  la fase aparece como terminada. Si estaba pausada, sigue pausada sin aviso.
- Al iniciar o reanudar: programar una notificación local para endTime.
- Al pausar o reiniciar: cancelar la notificación programada.
- Pedir el permiso de notificaciones explicando el motivo la primera vez que se inicia.
- Solo Android. El comportamiento de la alarma en modo silencio se define en
  specs/plan.md; no suponerlo.

## Prohibido
- Restar 1 segundo por tick.
- Llamar a Date.now() dentro de src/domain.
- Dejar una notificación programada después de pausar o reiniciar.