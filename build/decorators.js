"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoratorMap = new Map();
class Decorator {
    constructor(target, key) {
        this.target = target;
        this.key = key;
    }
}
exports.Decorator = Decorator;
class CommandDecorator extends Decorator {
    constructor(target, key, options) {
        super(target, key);
        this.options = options;
    }
}
exports.CommandDecorator = CommandDecorator;
class CheckDecorator extends Decorator {
    constructor(target, key, check) {
        super(target, key);
        this.check = check;
    }
}
exports.CheckDecorator = CheckDecorator;
class RestDecorator extends Decorator {
    constructor(target, key, index) {
        super(target, key);
        this.index = index;
    }
}
exports.RestDecorator = RestDecorator;
class OptionalDecorator extends Decorator {
    constructor(target, key, index) {
        super(target, key);
        this.index = index;
    }
}
exports.OptionalDecorator = OptionalDecorator;
class FlagDecorator extends Decorator {
    constructor(target, key) {
        super(target, key);
    }
}
exports.FlagDecorator = FlagDecorator;
/**
 * Adds a decorator to the decorator map.
 * @param decorator Decorator to add.
 */
function addDecorator(decorator) {
    if (!decoratorMap.has(decorator.target)) {
        decoratorMap.set(decorator.target, new Map());
    }
    let keyMap = decoratorMap.get(decorator.target);
    if (!keyMap.has(decorator.key)) {
        keyMap.set(decorator.key, []);
    }
    keyMap.get(decorator.key).push(decorator);
}
/**
 * Retrieves array of decorators for given `target` and `key`.
 * @param target Generally a class.
 * @param key Key in target that is decorated.
 */
function getDecorators(target, key) {
    let keyMap = decoratorMap.get(target);
    if (keyMap === undefined) {
        return [];
    }
    let results = keyMap.get(key);
    return results || [];
}
exports.getDecorators = getDecorators;
function getDecoratorsByType(target, key, type) {
    let keyMap = decoratorMap.get(target);
    if (keyMap === undefined) {
        return [];
    }
    return (keyMap.get(key) || []).filter((decorator) => decorator instanceof type);
}
exports.getDecoratorsByType = getDecoratorsByType;
function getDecoratorMapForClass(target) {
    return decoratorMap.get(target);
}
exports.getDecoratorMapForClass = getDecoratorMapForClass;
function command(options) {
    return (target, key) => {
        // if options not supplied
        // name is defaulted to method name
        if (options === undefined) {
            options = { name: target[key].name };
        }
        // if simply supplying name, wrap in options object
        if (typeof options === "string") {
            options = { name: options };
        }
        addDecorator(new CommandDecorator(target, key, options));
    };
}
exports.command = command;
function flag(target, key) {
    addDecorator(new FlagDecorator(target, key));
}
exports.flag = flag;
function rest(target, key, index) {
    addDecorator(new RestDecorator(target, key, index));
}
exports.rest = rest;
function optional(target, key, index) {
    addDecorator(new OptionalDecorator(target, key, index));
}
exports.optional = optional;
var checks;
(function (checks) {
    function owner(target, key) {
        addDecorator(new CheckDecorator(target, key, { type: "owner" }));
    }
    checks.owner = owner;
    function check(checkFn) {
        return function (target, key) {
            addDecorator(new CheckDecorator(target, key, {
                type: "custom",
                checkFn
            }));
        };
    }
    checks.check = check;
})(checks = exports.checks || (exports.checks = {}));
//# sourceMappingURL=decorators.js.map