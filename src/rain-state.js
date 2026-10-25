// Manager fallback: local model omitted this module in its revision.
export function respawnRain(state, random = Math.random, initial = false) {
  state.x = Math.max(-2.35, Math.min(2.35, (Math.floor(random() * 20) - 9.5) * .26));
  state.z = Math.max(-1.6, Math.min(1.6, (Math.floor(random() * 20) - 9.5) * .17 - .3));
  state.y = initial ? -1.8 + random() * 6.23 : 4.43;
  state.velocity = 0;
  state.wait = random() * 2.8;
  state.size = .38 + random() * .3;
  return state;
}
export function createRainState(random = Math.random) {
  return respawnRain({}, random, true);
}
export function stepRain(state, dt, level, onImpact, random = Math.random) {
  dt = Math.max(0, Math.min(dt, 1 / 30));
  if (state.wait > 0) {
    state.wait = Math.max(0, state.wait - dt);
    return false;
  }
  state.velocity += 5.8 * dt;
  state.y -= state.velocity * dt;
  if (state.y <= level) {
    onImpact(state.x, state.z);
    respawnRain(state, random);
    return false;
  }
  return true;
}
