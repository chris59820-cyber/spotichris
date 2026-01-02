/**
 * Utilitaires pour créer et gérer des filtres audio
 */

/**
 * Crée un filtre biquad avec les paramètres spécifiés
 */
export function createBiquadFilter(
  audioContext: AudioContext,
  type: BiquadFilterType,
  frequency: number,
  gain: number,
  q: number
): BiquadFilterNode {
  const filter = audioContext.createBiquadFilter()
  filter.type = type
  filter.frequency.value = frequency
  filter.gain.value = gain
  filter.Q.value = q
  return filter
}

/**
 * Convertit un gain en dB en valeur linéaire
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

/**
 * Convertit une valeur linéaire en gain en dB
 */
export function linearToDb(linear: number): number {
  return 20 * Math.log10(linear)
}

/**
 * Limite une valeur entre min et max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}







