// Decorator to inject a value from the current URL query string
export function fromQuery(paramName: string) {
    return function (target: any, propertyKey: string) {
        const getter = function () {
            const params = new URLSearchParams(window.location.search);
            return params.get(paramName);
        };
        Object.defineProperty(target, propertyKey, {
            get: getter,
            enumerable: true,
            configurable: true
        });
    };
}
