import Promise from "bluebird";


/** Create a Promise resolved with a value. */
export function succeed(value) {
    return Promise.resolve(value);
}


/**
 * Create a Promise by calling a function, regardless of whether the function
 * produces a Promise.
 */
export function maybe(f, ...args) {
    return Promise.try(f, args);
}


/**
 * Create a Promise that is resolved after a delay.
 */
export function delay(ms) {
    let timeoutID;
    return new Promise((resolve, reject) => {
        timeoutID = setTimeout(() => resolve(null), ms);
    }).cancellable().catch(Promise.CancellationError, e => {
        if (timeoutID !== undefined) {
            clearTimeout(timeoutID);
        }
        throw e;
    });
}
