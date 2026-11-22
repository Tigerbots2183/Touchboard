export const MathUtils = {

    _getFactor(n1, n2) {
        const s1 = n1.toString();
        const s2 = n2.toString();

        const d1 = (s1.split('.')[1] || '').length;
        const d2 = (s2.split('.')[1] || '').length;

        return Math.pow(10, Math.max(d1, d2));
    },

    add(n1, n2) {
        const factor = this._getFactor(n1, n2);
        return (Math.round(n1 * factor) + Math.round(n2 * factor)) / factor;
    },

    subtract(n1, n2) {
        const factor = this._getFactor(n1, n2);
        return (Math.round(n1 * factor) - Math.round(n2 * factor)) / factor;
    }
};

export function roundToNearestX(number, x) {

    if (x === 0) return 0;
    return Math.round(number / x) * x;
}

export function vh(percent) {
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}

export function objectIncludes(stateObj, criteria) {
    // We only care about the keys present in the criteria object
    return Object.keys(criteria).every(key => {
        return stateObj[key] === criteria[key];
    });
}

export function compareFloat(val1, val2) {
    return Math.abs(val1 - val2) < 0.00000001;
}


export function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}