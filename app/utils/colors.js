/**
 * Converts HSV color values to RGB color values.
 *
 * @param {number} h - The hue value (0-360).
 * @param {number} s - The saturation value (0-100).
 * @param {number} v - The value value (0-100).
 * @return {[number, number, number]} The RGB color values (0-255).
 */
export function hsv2rgb(h, s, v) {
  s /= 100;
  v /= 100;
  let f = (n, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}

/**
 * Converts RGB color values to HSV color values.
 *
 * @param {number} r - The red color value (0-255).
 * @param {number} g - The green color value (0-255).
 * @param {number} b - The blue color value (0-255).
 * @return {[number, number, number]} An array containing the hue, saturation, and value of the color (0-360, 0-100, 0-100).
 */
export function rgb2hsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let v = Math.max(r, g, b),
    c = v - Math.min(r, g, b);
  let h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && (c / v) * 100, v * 100];
}

/**
 * Converts a hexadecimal color code to RGB format.
 *
 * @param {string} hex - The hexadecimal color code to convert.
 * @return {[number, number, number]}
 */
export function hex2rgb(hex) {
  hex = hex.padEnd(6, "0").slice(0, 6);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Converts an RGB color value to a hexadecimal color code.
 *
 * @param {number} r - The red component of the RGB color value (0-255).
 * @param {number} g - The green component of the RGB color value (0-255).
 * @param {number} b - The blue component of the RGB color value (0-255).
 * @return {string} The hexadecimal color code.
 */
export function rgb2hex(r, g, b) {
  return (
    (1 << 24) +
    (Math.round(r) << 16) +
    (Math.round(g) << 8) +
    Math.round(b)
  )
    .toString(16)
    .slice(1);
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
/**
 * Checks the luminosity curve for a given cursor position on the screen.
 *
 * @param {Object} cursorPosition - The position of the cursor on the color picker.
 * @param {number} cursorPosition.x - The x-coordinate of the cursor.
 * @param {number} cursorPosition.y - The y-coordinate of the cursor.
 * @param {number} width - The width of the screen.
 * @param {number} height - The height of the screen.
 * @param {number} hue - The hue value.
 * @returns {boolean} Whether the y-coordinate is below the calculated curve point.
 */
export function checkHlLuminosityCurve(cursorPosition, width, height, hue) {
  function calculateCurve(x, curveFactor) {
    return ((curveFactor + 1) * Math.pow(x, 2)) / 4 + 0.5;
  }
  const x = cursorPosition.x / width,
    y = (height - cursorPosition.y) / height;
  const curvePoint = calculateCurve(x, hueToRelativeLuminosityEstimation(hue));
  return y < curvePoint;
}
