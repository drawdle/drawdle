/**
 * Clamp a value between a minimum and maximum bound.
 *
 * @param {number} x - The value to clamp.
 * @param {number} a - The minimum bound.
 * @param {number} b - The maximum bound.
 * @returns {number} - The clamped value.
 */
export const clamp = (x, a, b) => Math.max(a, Math.min(x, b));

/**
 * Calculates the mean of an array of numbers.
 *
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The mean value of the numbers in the array.
 */
export const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
