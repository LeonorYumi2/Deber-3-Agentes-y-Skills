---
name: rn-conventions
description: Convenciones de React Native/Expo del proyecto. Úsala al escribir código de pantallas, hooks o componentes.
---
# Convenciones React Native
- TypeScript estricto, sin `any`.
- Pantallas en src/app/ (Expo Router). El archivo de la pantalla principal es index.tsx.
- La lógica de negocio va en src/domain y no importa React ni librerías de Expo.
- Las funciones de dominio reciben `ahora` (timestamp) como parámetro; nunca llaman a Date.now() dentro.
- Persistencia solo a través de src/storage (AsyncStorage envuelto en funciones).
- Notificaciones solo a través de src/notifications.
- Colores solo desde src/theme/colors.ts, nunca hardcodeados en pantallas.
- Estilos con StyleSheet.
- Limpiar intervalos y listeners en el cleanup de useEffect.
- Sin librerías de anuncios, analytics ni backend.
- Solo Android: no agregar código ni configuración específicos de iOS.
- Crear carpetas nuevas (por ejemplo src/components) solo cuando una tarea las necesite.