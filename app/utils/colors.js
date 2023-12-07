/**
 * Convert HSL color to HSV color.
 *
 * @param {number} h - The hue value (0-360).
 * @param {number} s - The saturation value (0-1).
 * @param {number} l - The lightness value (0-1).
 * @returns {[number, number, number]} The HSV color as an array of [h, s, v].
 */
export function hsl2hsv(h, s, l) {
  const v = s * Math.min(l, 1 - l) + l;
  return [h, v ? 2 - (2 * l) / v : 0, v];
}

/**
 * Convert HSV color representation to HSL color representation.
 *
 * @param {number} h - The hue value (0-360).
 * @param {number} s - The saturation value (0-1).
 * @param {number} v - The value value (0-1).
 * @returns {[number, number, number]} - The HSL color representation.
 */
export function hsv2hsl(h, s, v) {
  const l = v - (v * s) / 2;
  const m = Math.min(l, 1 - l);

  return [h, m ? (v - l) / m : 0, l];
}

/**
 * Converts HSV color values to RGB color values.
 *
 * @param {number} h - The hue value.
 * @param {number} s - The saturation value.
 * @param {number} v - The value value.
 * @return {[number, number, number]} The RGB color values.
 */
export function hsv2rgb(h, s, v) {
  let f = (n, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}

/**
 * Converts RGB color values to HSV color values.
 *
 * @param {number} r - The red color value (0-255).
 * @param {number} g - The green color value (0-255).
 * @param {number} b - The blue color value (0-255).
 * @return {[number, number, number]} An array containing the hue, saturation, and value of the color.
 */
export function rgb2hsv(r, g, b) {
  let v = Math.max(r, g, b),
    c = v - Math.min(r, g, b);
  let h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

/**
 * Converts a color from HSL (Hue, Saturation, Lightness) to RGB (Red, Green, Blue) format.
 *
 * @param {number} h - The hue value of the color (0-360).
 * @param {number} s - The saturation value of the color (0-1).
 * @param {number} l - The lightness value of the color (0-1).
 * @return {[number, number, number]} An array representing the RGB values of the converted color.
 */
export function hsl2rgb(h, s, l) {
  let a = s * Math.min(l, 1 - l);
  let f = (n, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}

/**
 * Converts RGB color values to HSL color values.
 *
 * @param {number} r - The red color value (0-255).
 * @param {number} g - The green color value (0-255).
 * @param {number} b - The blue color value (0-255).
 * @return {[number, number, number]} An array containing the HSL color values.
 */
export function rgb2hsl(r, g, b) {
  let v = Math.max(r, g, b),
    c = v - Math.min(r, g, b),
    f = 1 - Math.abs(v + v - c - 1);
  let h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
}

/**
 * Calculates the luminosity estimation based on the given hue value.
 *
 * @param {number} hue - The hue value.
 * @return {number} The calculated luminosity estimation.
 */
function hueToRelativeLuminosityEstimation(hue) {
  const p = 0.7495,
    e1 = 1.4,
    m1 = 90,
    d1 = -0.8166,
    s1 = 2000,
    e2 = 2.1,
    m2 = 250,
    d2 = 0.8166,
    s2 = 1200;

  function bellCurve(x, d, p, e, s, m) {
    return (
      (1 / (d * Math.sqrt(2 * p))) *
      Math.pow(e, (-1 / s) * Math.pow((x - m) / d, 2))
    );
  }

  return (
    bellCurve(hue, d1, p, e1, s1, m1) +
    bellCurve(hue, d2, p, e2, s2, m2) +
    bellCurve(hue, d1, p, e1, s1, m1 + 360)
  );
}
export function checkHlLuminosityCurve(cursorPosition, width, height, hue) {
  function calculateCurve(x, curveFactor) {
    return ((curveFactor + 1) * Math.pow(x, 2)) / 4 + 0.5;
  }
  const x = cursorPosition.x / width,
    y = (height - cursorPosition.y) / height;
  const curvePoint = calculateCurve(x, hueToRelativeLuminosityEstimation(hue));
  console.log(curvePoint);
  return y < curvePoint;
}
