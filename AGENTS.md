# AGENTS.md — Pomodoro Cotopaxi

App móvil Pomodoro para estudiantes de la Academia Cotopaxi: temporizador de
estudio y descanso que sigue contando con el celular bloqueado, avisa con
alarma al terminar, y funciona sin cuenta, sin internet y sin publicidad.
Proyecto didáctico, solo Android.

## Stack y estructura
- Expo (plantilla create-expo-app), TypeScript estricto y Expo Router.
- Persistencia local con @react-native-async-storage/async-storage. Sin
  backend ni cuentas.
- Notificaciones locales con expo-notifications (requiere development build;
  no funciona completo en Expo Go).
- src/domain/: lógica pura (sin React ni AsyncStorage). src/storage/:
  persistencia. src/notifications/: alarmas. src/theme/: colores.
  src/app/: pantallas. Pruebas junto a cada módulo, en __tests__/.

## Comandos
- Ejecutar: npx expo start
- Pruebas: npx jest
- Tipos: npx tsc --noEmit

## Convenciones
- Código y nombres en inglés; textos de interfaz y comentarios en español.
- Reglas del temporizador: skill background-timer. Colores y contraste: skill
  cotopaxi-brand. Trampas de interfaz: rn-conventions.
- Las decisiones de diseño se toman en la spec de cada historia
  (specs/NNN-*/decisiones.md), no se improvisan.

## Forma de trabajar
- Lee docs/constitution.md y la spec activa (specs/NNN-*/) antes de tocar código.
- Antes de escribir código muestra el plan. Una tarea por vez.
- Si tienes dudas, pregunta antes de asumir.

## Límites
- Siempre: pruebas primero en la lógica, textos en español, actualizar
  MEMORY.md al terminar cada tarea.
- Pregunta antes: instalar dependencias, crear archivos fuera del plan,
  cambiar el formato de los datos guardados.
- Nunca: reemplazar archivos existentes sin que la tarea lo pida, agregar
  publicidad, analytics o backend.

## Memoria
- Al empezar lee MEMORY.md; al terminar actualízalo (máximo ~50 líneas).

## Verificación
- Lógica: npx jest en verde. Interfaz y alarmas: la lista manual de la tarea,
  probada en el celular.