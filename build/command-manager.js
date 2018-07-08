"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("./decorators");
const decorators = __importStar(require("./decorators"));
const command_1 = require("./command");
class CommandManager {
    constructor() {
        this.commands = new Map();
    }
    addCommand(gear, methodName, cmdDec) {
        let cls = gear.constructor.prototype;
        let checkDecorators = decorators_1.getDecoratorsByType(cls, methodName, decorators.CheckDecorator);
        const restDecorators = decorators_1.getDecoratorsByType(cls, methodName, decorators.RestDecorator);
        const optionalDecorators = decorators_1.getDecoratorsByType(cls, methodName, decorators.OptionalDecorator);
        const paramTypes = Reflect.getMetadata("design:paramtypes", cls, methodName);
        const params = paramTypes.map((type, i) => ({
            type,
            rest: restDecorators.some(dec => dec.index === i),
            optional: optionalDecorators.some(dec => dec.index === i)
        }));
        this.commands.set(cmdDec.options.name, new command_1.Command(cmdDec.options.name, cls[methodName], params, gear, checkDecorators));
    }
    getRootCommand(name) {
        return this.commands.get(name);
    }
    async addGear(gear) {
        if (!gear.constructor || !gear.constructor.prototype) {
            throw "Gear is not an instance of a class!";
        }
        let cls = gear.constructor.prototype;
        let properties = Object.getOwnPropertyNames(cls);
        for (let prop of properties) {
            let cmdDecorators = decorators_1.getDecoratorsByType(cls, prop, decorators_1.CommandDecorator);
            if (cmdDecorators.length === 0)
                continue;
            for (let cmdDec of cmdDecorators) {
                this.addCommand(gear, prop, cmdDec);
            }
        }
        if (gear.init instanceof Function) {
            // don't want to crash if init isn't async
            let result = gear.init();
            // so check if we're dealing with a promise
            if (result instanceof Promise) {
                await result;
            }
        }
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=command-manager.js.map