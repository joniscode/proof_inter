function getSimulationSession(): string {
  const key = 'punto-simulation-session';
  try {
    const stored = sessionStorage.getItem(key);
    if (stored && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)) {
      return stored;
    }
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
    return sessionId;
  } catch {
    return crypto.randomUUID();
  }
}

export const simulationSession = getSimulationSession();
