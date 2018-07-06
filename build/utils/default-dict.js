"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultDict {
    constructor(defaultValue) {
        return new Proxy({}, {
            get: (target, name) => name in target ? target[name] : defaultValue()
        });
    }
}
exports.DefaultDict = DefaultDict;
let x = new DefaultDict(() => [1, 2]);
console.log(x.asd);
let y = x.sdf;
y.push(3);
x.sdf = y;
console.log(x.sdf);
//# sourceMappingURL=default-dict.js.map