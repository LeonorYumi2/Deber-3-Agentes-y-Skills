/// <reference types="jest" />
import {
  createInitialSession,
  start,
  pause,
  resume,
  remainingTime,
  statusAt,
  reset,
  buttonConfig,
  Session,
} from '../session';

describe('src/domain/session - T2: Dominio parte a', () => {
  const STUDY_DURATION = 25 * 60 * 1000; // 25 min en ms (1,500,000 ms)

  describe('createInitialSession', () => {
    it('crea una sesión nueva en estado idle con la duración de estudio configurada (RF-1, RF-7)', () => {
      const ahora = 1000000;
      const session = createInitialSession(ahora, STUDY_DURATION);

      expect(session).toEqual({
        status: 'idle',
        phaseDuration: STUDY_DURATION,
        endTime: undefined,
        pausedRemaining: undefined,
      });
    });
  });

  describe('start', () => {
    it('inicia el temporizador desde idle pasando a running con endTime calculado (RF-1)', () => {
      const ahora = 1000000;
      const initial = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      const started = start(initial, ahora);

      expect(started).toEqual({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + STUDY_DURATION,
        pausedRemaining: undefined,
      });
    });

    it('devuelve la sesión sin cambios si ya está running, paused o finished (RF-9)', () => {
      const ahora = 1000000;
      const runningSession: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + STUDY_DURATION,
      });
      const pausedSession: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining: 50000,
      });
      const finishedSession: Session = Object.freeze({
        status: 'finished',
        phaseDuration: STUDY_DURATION,
      });

      expect(start(runningSession, ahora)).toBe(runningSession);
      expect(start(pausedSession, ahora)).toBe(pausedSession);
      expect(start(finishedSession, ahora)).toBe(finishedSession);
    });

    it('no muta la sesión original recibida (inmutabilidad con Object.freeze y comparación con copia)', () => {
      const ahora = 1000000;
      const initial = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      const copia = { ...initial };
      const started = start(initial, ahora);

      expect(initial).toEqual(copia);
      expect(started).not.toBe(initial);
    });
  });

  describe('pause', () => {
    it('pausa una sesión running congelando el tiempo restante (RF-2)', () => {
      const ahoraInicio = 1000000;
      const initial = Object.freeze(createInitialSession(ahoraInicio, STUDY_DURATION));
      const running = Object.freeze(start(initial, ahoraInicio));

      const tiempoTranscurrido = 5 * 60 * 1000; // 5 minutos después
      const ahoraPausa = ahoraInicio + tiempoTranscurrido;
      const paused = pause(running, ahoraPausa);

      expect(paused).toEqual({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        endTime: undefined,
        pausedRemaining: STUDY_DURATION - tiempoTranscurrido,
      });
    });

    it('pausar justo después de iniciar deja el tiempo completo', () => {
      const ahora = 1000000;
      const initial = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      const running = Object.freeze(start(initial, ahora));
      const paused = pause(running, ahora);

      expect(paused.status).toBe('paused');
      expect(paused.pausedRemaining).toBe(STUDY_DURATION);
    });

    it('pause con ahora === endTime devuelve la sesión sin cambios', () => {
      const ahoraInicio = 1000000;
      const endTime = ahoraInicio + STUDY_DURATION;
      const runningSession: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime,
      });

      const resultado = pause(runningSession, endTime);
      expect(resultado).toBe(runningSession);
    });

    it('devuelve la sesión sin cambios si la sesión ya está terminada (statusAt === finished o status === finished)', () => {
      const ahoraInicio = 1000000;
      const runningExpirado: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahoraInicio + STUDY_DURATION,
      });
      // El tiempo actual es posterior al endTime -> statusAt(session, ahora) da 'finished'
      const ahoraDespuesDeFin = ahoraInicio + STUDY_DURATION + 1000;
      expect(pause(runningExpirado, ahoraDespuesDeFin)).toBe(runningExpirado);

      const finishedSession: Session = Object.freeze({
        status: 'finished',
        phaseDuration: STUDY_DURATION,
      });
      expect(pause(finishedSession, ahoraDespuesDeFin)).toBe(finishedSession);
    });

    it('devuelve la sesión sin cambios si no está running (idle o paused)', () => {
      const ahora = 1000000;
      const idleSession = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      const pausedSession: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining: 60000,
      });

      expect(pause(idleSession, ahora)).toBe(idleSession);
      expect(pause(pausedSession, ahora)).toBe(pausedSession);
    });

    it('no muta la sesión original recibida (inmutabilidad con Object.freeze y comparación con copia)', () => {
      const ahora = 1000000;
      const running: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + 60000,
      });
      const copia = { ...running };
      const paused = pause(running, ahora + 10000);

      expect(running).toEqual(copia);
      expect(paused).not.toBe(running);
    });
  });

  describe('resume', () => {
    it('reanuda una sesión pausada con endTime recalculado según pausedRemaining (RF-3)', () => {
      const pausedRemaining = 10 * 60 * 1000; // 10 min
      const paused: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining,
      });

      const ahoraReanudar = 2000000;
      const resumed = resume(paused, ahoraReanudar);

      expect(resumed).toEqual({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahoraReanudar + pausedRemaining,
        pausedRemaining: undefined,
      });
    });

    it('devuelve la sesión sin cambios si no está pausada (idle, running, finished)', () => {
      const ahora = 1000000;
      const idleSession = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      const runningSession: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + STUDY_DURATION,
      });
      const finishedSession: Session = Object.freeze({
        status: 'finished',
        phaseDuration: STUDY_DURATION,
      });

      expect(resume(idleSession, ahora)).toBe(idleSession);
      expect(resume(runningSession, ahora)).toBe(runningSession);
      expect(resume(finishedSession, ahora)).toBe(finishedSession);
    });

    it('no muta la sesión original recibida (inmutabilidad con Object.freeze y comparación con copia)', () => {
      const paused: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining: 50000,
      });
      const copia = { ...paused };
      const resumed = resume(paused, 1000000);

      expect(paused).toEqual(copia);
      expect(resumed).not.toBe(paused);
    });
  });

  describe('pausar y reanudar repetidamente', () => {
    it('pausar y reanudar varias veces conserva el tiempo restante correcto', () => {
      let ahora = 1000000;
      let session: Session = Object.freeze(createInitialSession(ahora, STUDY_DURATION));

      // Iniciar
      session = Object.freeze(start(session, ahora));
      expect(remainingTime(session, ahora)).toBe(STUDY_DURATION);

      // Pasan 3 minutos y se pausa
      ahora += 3 * 60 * 1000;
      session = Object.freeze(pause(session, ahora));
      expect(session.status).toBe('paused');
      expect(session.pausedRemaining).toBe(22 * 60 * 1000);
      expect(remainingTime(session, ahora)).toBe(22 * 60 * 1000);

      // Pasan 10 minutos en pausa y se reanuda
      ahora += 10 * 60 * 1000;
      expect(remainingTime(session, ahora)).toBe(22 * 60 * 1000); // Sigue congelado
      session = Object.freeze(resume(session, ahora));
      expect(session.status).toBe('running');
      expect(remainingTime(session, ahora)).toBe(22 * 60 * 1000);

      // Pasan otros 2 minutos corriendo y se vuelve a pausar
      ahora += 2 * 60 * 1000;
      session = Object.freeze(pause(session, ahora));
      expect(session.status).toBe('paused');
      expect(session.pausedRemaining).toBe(20 * 60 * 1000);
      expect(remainingTime(session, ahora)).toBe(20 * 60 * 1000);

      // Se vuelve a reanudar 5 minutos después
      ahora += 5 * 60 * 1000;
      session = Object.freeze(resume(session, ahora));
      expect(session.status).toBe('running');
      expect(remainingTime(session, ahora)).toBe(20 * 60 * 1000);
    });
  });

  describe('remainingTime', () => {
    it('en idle devuelve phaseDuration', () => {
      const ahora = 1000000;
      const session = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      expect(remainingTime(session, ahora)).toBe(STUDY_DURATION);
    });

    it('en running devuelve endTime - ahora', () => {
      const ahora = 1000000;
      const session: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + 60000,
      });
      expect(remainingTime(session, ahora)).toBe(60000);
      expect(remainingTime(session, ahora + 20000)).toBe(40000);
    });

    it('en running nunca es negativo (si ahora > endTime, vale 0)', () => {
      const ahora = 1000000;
      const session: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora,
      });
      expect(remainingTime(session, ahora + 5000)).toBe(0);
      expect(remainingTime(session, ahora)).toBe(0);
    });

    it('en paused devuelve pausedRemaining sin importar el paso del tiempo', () => {
      const session: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining: 45000,
      });
      expect(remainingTime(session, 1000000)).toBe(45000);
      expect(remainingTime(session, 9999999)).toBe(45000);
    });

    it('en finished devuelve 0', () => {
      const session: Session = Object.freeze({
        status: 'finished',
        phaseDuration: STUDY_DURATION,
      });
      expect(remainingTime(session, 1000000)).toBe(0);
    });
  });

  describe('statusAt', () => {
    it('con endTime === ahora devuelve finished', () => {
      const ahora = 1000000;
      const session: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora,
      });
      expect(statusAt(session, ahora)).toBe('finished');
    });

    it('con endTime < ahora devuelve finished', () => {
      const ahora = 1000000;
      const session: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora - 100,
      });
      expect(statusAt(session, ahora)).toBe('finished');
    });

    it('con endTime > ahora en running devuelve running', () => {
      const ahora = 1000000;
      const session: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + 1000,
      });
      expect(statusAt(session, ahora)).toBe('running');
    });

    it('devuelve el status intacto para idle, paused y finished', () => {
      const ahora = 1000000;
      const idleSession = Object.freeze(createInitialSession(ahora, STUDY_DURATION));
      const pausedSession: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining: 30000,
      });
      const finishedSession: Session = Object.freeze({
        status: 'finished',
        phaseDuration: STUDY_DURATION,
      });

      expect(statusAt(idleSession, ahora)).toBe('idle');
      expect(statusAt(pausedSession, ahora)).toBe('paused');
      expect(statusAt(finishedSession, ahora)).toBe('finished');
    });
  });

  describe('T3: Dominio parte b - reset', () => {
    it('desde running, paused, finished e idle devuelve status idle, sin endTime ni pausedRemaining, y conserva phaseDuration (RF-4, decisión P2)', () => {
      const ahora = 1000000;
      const runningSession: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + STUDY_DURATION,
      });
      const pausedSession: Session = Object.freeze({
        status: 'paused',
        phaseDuration: STUDY_DURATION,
        pausedRemaining: 40000,
      });
      const finishedSession: Session = Object.freeze({
        status: 'finished',
        phaseDuration: STUDY_DURATION,
      });
      const idleSession: Session = Object.freeze(createInitialSession(ahora, STUDY_DURATION));

      const expected = {
        status: 'idle',
        phaseDuration: STUDY_DURATION,
        endTime: undefined,
        pausedRemaining: undefined,
      };

      expect(reset(runningSession)).toEqual(expected);
      expect(reset(pausedSession)).toEqual(expected);
      expect(reset(finishedSession)).toEqual(expected);
      expect(reset(idleSession)).toEqual(expected);
    });

    it('no muta la sesión recibida (Object.freeze y comparación con copia)', () => {
      const ahora = 1000000;
      const runningSession: Session = Object.freeze({
        status: 'running',
        phaseDuration: STUDY_DURATION,
        endTime: ahora + 60000,
      });
      const copia = { ...runningSession };
      const resetted = reset(runningSession);

      expect(runningSession).toEqual(copia);
      expect(resetted).not.toBe(runningSession);
    });

    it('tras reset, start vuelve a arrancar con la duración original de la fase', () => {
      const ahoraInicio = 1000000;
      let session = createInitialSession(ahoraInicio, STUDY_DURATION);
      session = start(session, ahoraInicio);

      // Pasa algo de tiempo
      session = reset(session);
      expect(session.status).toBe('idle');

      // Vuelve a arrancar en un momento posterior
      const nuevoAhora = 3000000;
      session = start(session, nuevoAhora);
      expect(session.status).toBe('running');
      expect(session.endTime).toBe(nuevoAhora + STUDY_DURATION);
      expect(session.phaseDuration).toBe(STUDY_DURATION);
    });
  });

  describe('T3: Dominio parte b - buttonConfig', () => {
    it('idle: principal Iniciar habilitado; Reiniciar deshabilitado (RF-8)', () => {
      const config = buttonConfig('idle');
      expect(config).toEqual({
        principal: { label: 'Iniciar', enabled: true },
        reiniciar: { enabled: false },
      });
    });

    it('running: principal Pausar habilitado; Reiniciar habilitado (RF-9, RF-4)', () => {
      const config = buttonConfig('running');
      expect(config).toEqual({
        principal: { label: 'Pausar', enabled: true },
        reiniciar: { enabled: true },
      });
    });

    it('paused: principal Reanudar habilitado; Reiniciar habilitado (RF-3, RF-4)', () => {
      const config = buttonConfig('paused');
      expect(config).toEqual({
        principal: { label: 'Reanudar', enabled: true },
        reiniciar: { enabled: true },
      });
    });

    it('finished: principal deshabilitado; Reiniciar habilitado (RF-10)', () => {
      const config = buttonConfig('finished');
      expect(config).toEqual({
        principal: { label: 'Reanudar', enabled: false },
        reiniciar: { enabled: true },
      });
    });
  });

  describe('T3: Integración de dominio (statusAt y buttonConfig)', () => {
    it('una sesión running cuyo endTime ya pasó, evaluada con statusAt, produce finished, y buttonConfig de ese estado deja el principal deshabilitado', () => {
      const ahoraInicio = 1000000;
      const session = start(createInitialSession(ahoraInicio, STUDY_DURATION), ahoraInicio);

      const ahoraDespuesDeFin = ahoraInicio + STUDY_DURATION + 5000;
      const estadoActual = statusAt(session, ahoraDespuesDeFin);
      expect(estadoActual).toBe('finished');

      const config = buttonConfig(estadoActual);
      expect(config.principal.enabled).toBe(false);
      expect(config.reiniciar.enabled).toBe(true);
    });
  });
});
