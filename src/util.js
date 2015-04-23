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


export class StatusBase {
    constructor(type, message=null) {
        this.type = type;
        if (message === null) {
            message = () => null;
        } else if (!(message instanceof Function)) {
            let msg = message;
            message = () => msg;
        }
        this.message = message;
    }

    static is(status, type) {
        return (status instanceof StatusBase) && status.type === type;
    }

    static combineWithPriority(priority, initial, ...statuses) {
        let lastStatus = initial;
        for (let status of statuses) {
            if (status.type === priority[0]) {
                return status;
            } else if (priority.indexOf(status.type) < priority.indexOf(lastStatus.type)) {
                lastStatus = status;
            }
        }
        return lastStatus;
    }
};
