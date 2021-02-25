const methodsArray = () => {
    Array.prototype.clear = function () { this.length = 0; }
    Array.prototype.move = function (from, to) {
        const lastIndex = this.length - 1;
        const parametersIsInvalid = [isNaN(from), isNaN(to), from === to, from < 0,
        from > lastIndex, to < 0, to > lastIndex].includes(true);
        if (parametersIsInvalid) { return; }
        this.splice(to, 0, this.splice(from, 1)[0]);
    }
    Object.defineProperty(Array.prototype, "first", {
        get: function () {
            return this[0];
        },
        set: function (value) {
            this[0] = value;
        }
    });
    Object.defineProperty(Array.prototype, "last", {
        get: function () {
            return this[this.length - 1];
        },
        set: function (value) {
            this[this.length - 1] = value;
        }
    });
    Object.defineProperty(Array.prototype, "lastIndex", {
        get: function () {
            return (this.length - 1);
        }
    });
}

export const addMethodsArray = methodsArray;
export const addMethodsGlobalObjects = () => {
    methodsArray();
}