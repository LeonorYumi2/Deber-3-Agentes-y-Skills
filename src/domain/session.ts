/**
 * Modelo y funciones puras para el control de la sesión del temporizador.
 * Cumple con las reglas de dominio de HU-001 (RF-1, RF-2, RF-3, RF-4, RF-7, RF-8, RF-9, RF-10).
 */

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface Session {
  readonly status: SessionStatus;
  readonly phaseDuration: number;
  readonly endTime?: number;
  readonly pausedRemaining?: number;
}

export interface ButtonConfig {
  readonly principal: {
    readonly label: 'Iniciar' | 'Pausar' | 'Reanudar';
    readonly enabled: boolean;
  };
  readonly reiniciar: {
    readonly enabled: boolean;
  };
}

/**
 * Crea una sesión inicial en estado 'idle' con la duración indicada.
 */
export function createInitialSession(ahora: number, duracionEstudio: number): Session {
  return {
    status: 'idle',
    phaseDuration: duracionEstudio,
    endTime: undefined,
    pausedRemaining: undefined,
  };
}

/**
 * Deriva el estado actual según la hora de fin y la marca de tiempo recibida.
 */
export function statusAt(session: Session, ahora: number): SessionStatus {
  if (session.status === 'running' && session.endTime !== undefined && session.endTime <= ahora) {
    return 'finished';
  }
  return session.status;
}

/**
 * Inicia el temporizador desde el estado 'idle'.
 * Si el estado no es 'idle', devuelve la sesión sin cambios.
 */
export function start(session: Session, ahora: number): Session {
  if (session.status !== 'idle') {
    return session;
  }
  return {
    ...session,
    status: 'running',
    endTime: ahora + session.phaseDuration,
    pausedRemaining: undefined,
  };
}

/**
 * Pausa la cuenta regresiva congelando el tiempo restante.
 * Si no está 'running' o la fase ya terminó, devuelve la sesión sin cambios.
 */
export function pause(session: Session, ahora: number): Session {
  const currentStatus = statusAt(session, ahora);
  if (currentStatus !== 'running' || session.endTime === undefined) {
    return session;
  }
  const restante = Math.max(0, session.endTime - ahora);
  return {
    ...session,
    status: 'paused',
    endTime: undefined,
    pausedRemaining: restante,
  };
}

/**
 * Reanuda la cuenta regresiva desde el tiempo en pausa.
 * Si el estado no es 'paused', devuelve la sesión sin cambios.
 */
export function resume(session: Session, ahora: number): Session {
  if (session.status !== 'paused' || session.pausedRemaining === undefined) {
    return session;
  }
  return {
    ...session,
    status: 'running',
    endTime: ahora + session.pausedRemaining,
    pausedRemaining: undefined,
  };
}

/**
 * Calcula el tiempo restante en milisegundos según el estado y la hora actual.
 */
export function remainingTime(session: Session, ahora: number): number {
  switch (session.status) {
    case 'running': {
      if (session.endTime === undefined) return 0;
      const resto = session.endTime - ahora;
      return resto <= 0 ? 0 : resto;
    }
    case 'paused':
      return session.pausedRemaining ?? 0;
    case 'idle':
      return session.phaseDuration;
    case 'finished':
      return 0;
  }
}

/**
 * Reinicia la sesión conservando la duración inicial de la fase (phaseDuration)
 * y dejándola en estado 'idle' sin endTime ni pausedRemaining.
 * No muta el objeto original (RF-4, decisión P2).
 */
export function reset(session: Session): Session {
  return {
    ...session,
    status: 'idle',
    endTime: undefined,
    pausedRemaining: undefined,
  };
}

/**
 * Devuelve la configuración de los botones (etiqueta y habilitación) según el
 * estado actual derivado (SessionStatus).
 * Cumple con RF-8, RF-9 y RF-10.
 */
export function buttonConfig(status: SessionStatus): ButtonConfig {
  switch (status) {
    case 'idle':
      return {
        principal: { label: 'Iniciar', enabled: true },
        reiniciar: { enabled: false },
      };
    case 'running':
      return {
        principal: { label: 'Pausar', enabled: true },
        reiniciar: { enabled: true },
      };
    case 'paused':
      return {
        principal: { label: 'Reanudar', enabled: true },
        reiniciar: { enabled: true },
      };
    case 'finished':
      return {
        principal: { label: 'Reanudar', enabled: false },
        reiniciar: { enabled: true },
      };
  }
}

/**
 * Devuelve la configuración de los botones (etiqueta y habilitación) según el
 * estado actual derivado (SessionStatus).
 * Cumple con RF-8, RF-9 y RF-10.
 */
export function buttonConfig(status: SessionStatus): ButtonConfig {
  switch (status) {
    case 'idle':
      return {
        principal: { label: 'Iniciar', enabled: true },
        reiniciar: { enabled: false },
      };
    case 'running':
      return {
        principal: { label: 'Pausar', enabled: true },
        reiniciar: { enabled: true },
      };
    case 'paused':
      return {
        principal: { label: 'Reanudar', enabled: true },
        reiniciar: { enabled: true },
      };
    case 'finished':
      return {
        principal: { label: 'Reanudar', enabled: false },
        reiniciar: { enabled: true },
      };
  }
}

