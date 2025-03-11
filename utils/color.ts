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

export const calculateLuminance = ([r, g, b]: [
	number,
	number,
	number
]): boolean => {
	const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
	return luminance < 128;
};
