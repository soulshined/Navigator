
export function clamp(val: number, min: number = 0, max: number = Infinity) {
    if (val < min) return min;
    if (val > max) return max;

    return val;
}

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isInteger(value: any) {
    if (typeof value === 'number' && Number.isInteger(value)) return true;
    if (typeof value === 'string' && value.match(/^\-?\d+$/)) return true;

    return false;
}

export function isObject(value: any) {
    return value !== null && typeof value === 'object';
}

export function regexEscape(value: string) {
    return value.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}