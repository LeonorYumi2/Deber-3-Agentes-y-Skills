# Spec 001 — Iniciar y controlar una sesión de estudio

Estado: aprobada
HU de origen: docs/historias/HU-001.md

## Contexto y objetivo

El estudiante necesita concentrarse durante un tiempo definido mediante un temporizador de estudio que pueda iniciar, pausar y reiniciar. Es la funcionalidad base de la aplicación Pomodoro Cotopaxi y debe funcionar desde la primera apertura, sin registro ni configuración previa.

## Usuarios

Estudiante de la Academia Cotopaxi que usa la aplicación para sesiones de estudio y descanso.

## Historias de usuario

- HU-001: Iniciar y controlar una sesión de estudio (docs/historias/HU-001.md).

## Definiciones

- **Tiempo de estudio configurado:** duración asignada a la fase de estudio. Por defecto son 25 minutos (decisión P5).
- **Tiempo inicial de la fase:** duración con la que empezó la fase actualmente en curso (decisión P2). Se conserva aunque cambie la configuración en ajustes mientras la fase está activa.
- **Sesión:** estado del temporizador (detenido, corriendo, pausado o terminado), fase actual y tiempo restante.
- **Detenido:** el temporizador está en el tiempo inicial de la fase y no se ha iniciado; no hay cuenta regresiva en curso.
- **Terminado:** el tiempo restante llegó a 00:00 y el temporizador se detuvo; la fase concluyó.

## Requisitos funcionales

- RF-1: CUANDO el usuario presiona iniciar en la pantalla principal y no hay sesión activa, EL SISTEMA empieza la cuenta regresiva inmediatamente con el tiempo de estudio configurado y muestra los minutos y segundos que faltan. Origen: HU-001, escenario "Iniciar el temporizador"; decisión P3 (inicio inmediato), P5 (valores por defecto al instalar).
- RF-2: MIENTRAS el temporizador esté corriendo, CUANDO el usuario lo pausa, EL SISTEMA congela el tiempo restante y muestra el tiempo congelado junto con la opción para reanudar. Origen: HU-001, escenario "Pausar y continuar"; decisión P7 (tiempo congelado en pausa), P4 (botón principal cambia a Reanudar).
- RF-3: CUANDO el usuario reanuda un temporizador pausado, EL SISTEMA reanuda la cuenta desde el tiempo en que se pausó. Origen: HU-001, escenario "Pausar y continuar".
- RF-4: CUANDO el usuario decide reiniciar el temporizador y lo confirma, EL SISTEMA vuelve el temporizador al tiempo inicial de la fase en curso (la duración con la que empezó esa fase) y lo deja detenido esperando a que el usuario presione iniciar. Origen: HU-001, escenario "Reiniciar el temporizador"; decisiones P2 (duración con la que empezó la fase), P6 (confirmación antes de reiniciar), P8 (queda detenido esperando iniciar).
- RF-5: CUANDO el usuario decide reiniciar el temporizador y cancela la confirmación, EL SISTEMA conserva el tiempo que llevaba el temporizador sin cambios. Origen: HU-001, escenario "Cambiar de opinión al reiniciar".
- RF-6: CUANDO cambia el estado de la sesión (iniciar, pausar, reanudar o reiniciar), EL SISTEMA guarda la sesión de forma local para que se pueda recuperar ante cierre abrupto de la aplicación. Origen: decisión P1 (persistencia al cambiar el estado).
- RF-7: CUANDO se abre la aplicación por primera vez tras instalarla, EL SISTEMA muestra el temporizador con el tiempo de estudio por defecto sin requerir configuración previa. Origen: decisión P5 (primera vez con valores por defecto).
- RF-8: CUANDO el temporizador está detenido (en el tiempo inicial, sin haber iniciado), EL SISTEMA deja deshabilitado el botón Reiniciar. Origen: decisiones P4 (fila "Detenido") y P8.
- RF-9: MIENTRAS haya una sesión activa (el temporizador esté corriendo o pausado), EL SISTEMA no habilita la acción Iniciar; el botón principal muestra "Pausar" (corriendo) o "Reanudar" (pausado), nunca "Iniciar". Origen: decisión P4 (filas "Corriendo" y "Pausado").
- RF-10: CUANDO el temporizador está terminado (llegó a 00:00), EL SISTEMA deja deshabilitado el botón principal y deja habilitado el botón Reiniciar (con la confirmación de decisión P6). Origen: Aclaraciones de decisiones.md y P6 (confirmación antes de reiniciar).

## Requisitos no funcionales

- Sin cuentas, sin backend, sin internet ni publicidad (constitución).
- El tiempo restante se calcula a partir de la hora de fin, nunca restando segundos, para que sea correcto con el celular bloqueado o la app cerrada (constitución).
- Los datos del usuario son locales y se conservan ante cambios de código (constitución).

## Casos límite

- Reiniciar cuando el temporizador está corriendo: se pide confirmación y, al confirmar, vuelve al tiempo inicial de la fase en curso.
- Reiniciar cuando el temporizador está pausado: se pide confirmación y, al confirmar, vuelve al tiempo inicial de la fase en curso y queda detenido.
- Cambiar de opinión al reiniciar (cancelar): se conserva el tiempo que llevaba, corriendo o pausado.
- Pausar y reanudar varias veces: el tiempo restante debe seguir siendo correcto tras cada ciclo.
- Primera vez sin configurar nada: se muestra el tiempo de estudio por defecto (25 minutos).

## Fuera de alcance

- Alternancia automática entre estudio y descanso (pertenece a HU-002).
- Avisos de fin de fase o alarma (pertenece a HU-004).
- Ajuste de duraciones y restablecimiento de valores por defecto desde ajustes (pertenece a HU-005).
- Recuperación de sesión tras cierre de la aplicación o celular bloqueado (pertenece a HU-003; RF-6 solo cubre guardar la sesión al cambiar estado).

## Criterios de finalización

- Cada escenario de HU-001 está cubierto por al menos un requisito funcional verificable.
- La lógica del temporizador se prueba y las pruebas están en verde.
- No se implementa nada que no esté en esta spec.

## Dudas abiertas

Ninguna.
