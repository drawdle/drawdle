export type RgbColor = { r: number; g: number; b: number };
export type HsvColor = { h: number; s: number; v: number };
export type HexColor = string;

/**
 * Converts HSV color values to RGB color values.
 *
 * @param h - The hue value (0-360).
 * @param s - The saturation value (0-100).
 * @param v - The value value (0-100).
 * @return The RGB color values (0-255).
 */
export const hsv2rgb = (
	h: number,
	s: number,
	v: number
): [number, number, number] => {
	const s_ = s / 100;
	const v_ = v / 100;
	const f = (n: number): number => {
		const k = (n + h / 60) % 6;
		return v_ - v_ * s_ * Math.max(Math.min(k, 4 - k, 1), 0);
	};
	return [f(5) * 255, f(3) * 255, f(1) * 255];
};

/**
 * Converts RGB color values to HSV color values.
 *
 * @param r_ - The red color value (0-255).
 * @param g_ - The green color value (0-255).
 * @param b_ - The blue color value (0-255).
 * @return The HSV color values (0-360, 0-100, 0-100).
 */
export const rgb2hsv = (
	r: number,
	g: number,
	b: number
): [number, number, number] => {
	const r_ = r / 255;
	const g_ = g / 255;
	const b_ = b / 255;
	const v = Math.max(r_, g_, b_);
	const c = v - Math.min(r_, g_, b_);
	const h =
		c &&
		(v === r_
			? (g_ - b_) / c
			: v === g_
			? 2 + (b_ - r_) / c
			: 4 + (r_ - g_) / c);
	return [60 * (h < 0 ? h + 6 : h), v && (c / v) * 100, v * 100];
};

/**
 * Converts a hexadecimal color code to RGB format.
 *
 * @param hex_ - The hexadecimal color code to convert.
 * @return The RGB color values (0-255).
 */
export const hex2rgb = (hex: string): [number, number, number] => {
	const hex_ = hex.padEnd(6, "0").slice(0, 6);
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex_);
	if (!result) {
		return [0, 0, 0];
	}
	return [result[1], result[2], result[3]].map((x) =>
		Number.parseInt(x, 16)
	) as [number, number, number];
};

/**
 * Converts an RGB color value to a hexadecimal color code.
 *
 * @param r - The red component of the RGB color value (0-255).
 * @param g - The green component of the RGB color value (0-255).
 * @param b - The blue component of the RGB color value (0-255).
 * @return The hexadecimal color code.
 */
export const rgb2hex = (r: number, g: number, b: number): string => {
	return (
		(1 << 24) +
		(Math.round(r) << 16) +
		(Math.round(g) << 8) +
		Math.round(b)
	)
		.toString(16)
		.slice(1);
};

/**
 * Calculates the luminosity estimation based on the given hue value.
 *
 * @param {number} hue - The hue value.
 * @return {number} The calculated luminosity estimation.
 */
const hueToRelativeLuminosityEstimation = (hue: number): number => {
	const p = 0.7495;
	const e1 = 1.4;
	const m1 = 90;
	const d1 = -0.8166;
	const s1 = 2000;
	const e2 = 2.1;
	const m2 = 250;
	const d2 = 0.8166;
	const s2 = 1200;

	function bellCurve(
		x: number,
		d: number,
		p: number,
		e: number,
		s: number,
		m: number
	) {
		return (1 / (d * Math.sqrt(2 * p))) * e ** ((-1 / s) * ((x - m) / d) ** 2);
	}

	return (
		bellCurve(hue, d1, p, e1, s1, m1) +
		bellCurve(hue, d2, p, e2, s2, m2) +
		bellCurve(hue, d1, p, e1, s1, m1 + 360)
	);
};
/**
 * Checks the luminosity curve for a given cursor position on the screen.
 *
 * @param cursorPosition - The position of the cursor on the color picker.
 * @param cursorPosition.x - The x-coordinate of the cursor.
 * @param cursorPosition.y - The y-coordinate of the cursor.
 * @param width - The width of the screen.
 * @param height - The height of the screen.
 * @param hue - The hue value.
 * @returns Whether the y-coordinate is below the calculated curve point.
 */
export const checkHlLuminosityCurve = (
	cursorPosition: { x: number; y: number },
	width: number,
	height: number,
	hue: number
): boolean => {
	function calculateCurve(x: number, curveFactor: number) {
		return ((curveFactor + 1) * x ** 2) / 4 + 0.5;
	}
	const x = cursorPosition.x / width;
	const y = (height - cursorPosition.y) / height;
	const curvePoint = calculateCurve(x, hueToRelativeLuminosityEstimation(hue));
	return y < curvePoint;
};
