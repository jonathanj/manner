export function i18nMessage(category, name, values) {
    if (values === undefined) {
        values = (args, rest) => ({'value': args[0]});
    }
    return (i18n, args, rest) => {
        let f = i18n[category][name];
        if (!(f instanceof Function)) {
            throw new Error(
                `Expected function for validator message "${name}" but got ${f}`);
        }
        return f(values(args, rest));
    };
}
