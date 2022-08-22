export function round(x: number, places: number = 1) {
  const multiplier = Math.pow(10, places);
  return Math.round(x * multiplier) / multiplier;
}