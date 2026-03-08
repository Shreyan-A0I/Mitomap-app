/**
 * Format internal variant IDs to standard mitochondrial nomenclature.
 *
 * Converts: var_3733_G_A  →  m.3733G>A
 * Converts: var_13051_G_A →  m.13051G>A
 *
 * Standard format: m.[position][REF]>[ALT]
 */
export function formatVariantId(raw: string): string {
    // Match pattern: var_<pos>_<ref>_<alt>
    const match = raw.match(/^var_(\d+)_([A-Z])_([A-Z])$/);
    if (match) {
        const [, pos, ref, alt] = match;
        return `m.${pos}${ref}>${alt}`;
    }
    // Fallback: return as-is if pattern doesn't match
    return raw;
}

/**
 * Format probability with confidence ceiling.
 * Sigmoid saturation means 100.0% is misleading — cap at >99.9%.
 */
export function formatProbability(p: number): string {
    if (p > 0.999) return ">99.9%";
    return `${(p * 100).toFixed(1)}%`;
}
