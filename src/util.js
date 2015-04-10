export function partial(f, ...args) {
    return (...rest) => f(...args, ...rest);
}


export function compose(...fs) {
    return fs.reduce((f, g) => (x) => f(g(x)));
}


/** Get an attribute from an object specified later. */
export function attrgetter(attr) {
    return v => (v !== null && v !== undefined) ? v[attr] : undefined;
}
