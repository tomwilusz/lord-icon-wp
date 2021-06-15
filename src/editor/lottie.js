export function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function isObjectLike(value) {
    return value !== null && typeof value === "object";
}

export function has(object, path) {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let current = object;

    for (const key of newPath) {
        if (!isObjectLike(current)) {
            return false;
        }

        if (!(key in current)) {
            return false;
        }

        current = (current)[key];
    }

    return true;
}

export function get(object, path, defaultValue) {
    const newPath = Array.isArray(path) ? path : path.split(".");
    let current = object;

    for (const key of newPath) {
        if (!isObjectLike(current)) {
            return defaultValue;
        }

        if (!(key in current)) {
            return defaultValue;
        }

        current = (current)[key];
    }

    return current === undefined ? defaultValue : current;
}

export function set(object, path, value) {
    let current = object;
    
    const newPath = Array.isArray(path) ? path : path.split(".");

    for (let i = 0; i < newPath.length; ++i) {
        if (i === newPath.length - 1) {
            current[newPath[i]] = value;
        } else {
            current = current[newPath[i]];
        }
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(value) {
    return (
        '#' +
        componentToHex(value.r) +
        componentToHex(value.g) +
        componentToHex(value.b)
    );
}

export function hexToRgb(hex) {
    let data = parseInt(hex[0] != '#' ? hex : hex.substring(1), 16);
    return {
        r: (data >> 16) & 255,
        g: (data >> 8) & 255,
        b: data & 255,
    };
}

export function toUnitVector(n) {
    return Math.round((n / 255) * 1000) / 1000;
}

export function fromUnitVector(n) {
    return Math.round(n * 255);
}

export function hexToLottieColor(hex) {
    const {
        r,
        g,
        b
    } = hexToRgb(hex);
    return [toUnitVector(r), toUnitVector(g), toUnitVector(b)];
}

export function allFields(
    data,
) {
    const result = [];

    if (!data || !data.layers) {
        return result;
    }

    for (const [layerIndex, layer] of Object.entries(data.layers)) {
        if (!layer.nm) {
            continue;
        }

        if (!layer.nm.toLowerCase().includes('change')) {
            continue;
        }

        if (!layer.ef) {
            continue;
        }

        for (const [fieldIndex, field] of Object.entries(layer.ef)) {
            const subpath = 'ef.0.v.k';
            const path = `layers.${layerIndex}.ef.${fieldIndex}.${subpath}`;

            const hasValue = has(field, subpath);
            if (!hasValue) {
                continue;
            }

            let type = 'unkown';

            if (field.mn === 'ADBE Color Control') {
                type = 'color';
            } else if (field.mn === 'ADBE Slider Control') {
                type = 'slider';
            } else if (field.mn === 'ADBE Point Control') {
                type = 'point';
            } else if (field.mn === 'ADBE Checkbox Control') {
                type = 'checkbox';
            }

            if (type === 'unkown') {
                continue;
            }

            const name = field.nm;

            const value = get(field, subpath);

            result.push({
                name,
                path,
                value,
                type,
            });
        }
    }

    return result;
}

export function colors(data) {
    return allFields(data).filter(c => c.type === 'color').map(c => {
        return {
            name: c.name,
            color: rgbToHex({
                r: fromUnitVector(c.value[0]),
                g: fromUnitVector(c.value[1]),
                b: fromUnitVector(c.value[2]),
            }),
        };
    })
}
