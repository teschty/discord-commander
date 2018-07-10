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
    constructor(target, key, check, failureMessage) {
        super(target, key);
        this.check = check;
        this.failureMessage = failureMessage;
    }
    performCheck(bot, ctx) {
        if (this.check.type === "owner") {
            return bot.options.owners.includes(ctx.user.id);
        }
        else {
            return this.check.checkFn(ctx);
        }
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
    function isOwner(failureMessage) {
        return (target, key) => {
            failureMessage = failureMessage || "Only a bot owner may perform that action.";
            addDecorator(new CheckDecorator(target, key, { type: "owner" }, failureMessage));
        };
    }
    checks.isOwner = isOwner;
    function check(checkFn, failureMessage) {
        return (target, key) => {
            failureMessage = failureMessage || "You lack sufficient permissions to perform that action.";
            let checkDef = { type: "custom", checkFn };
            addDecorator(new CheckDecorator(target, key, checkDef, failureMessage));
        };
    }
    checks.check = check;
})(checks = exports.checks || (exports.checks = {}));
//# sourceMappingURL=decorators.js.map