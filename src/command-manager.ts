import { getDecoratorsByType, CommandDecorator } from "./decorators";
import * as decorators from "./decorators";
import { Command, CommandGroup } from "./command";

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func: Function) {  
    return (func + '')
      .replace(/[/][/].*$/mg,'') // strip single-line comments
      .replace(/\s+/g, '') // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
      .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
      .replace(/=[^,]+/g, '') // strip any ES6 defaults  
      .split(',').filter(Boolean); // split & filter [""]
}  

export class CommandManager {
    commands: Map<string, Command | CommandGroup> = new Map();

    private addCommand(gear: any, methodName: string, cmdDec: CommandDecorator) {
        let cls = gear.constructor.prototype;
        let checkDecorators = getDecoratorsByType(cls, methodName, decorators.CheckDecorator);

        const restDecorators = getDecoratorsByType(cls, methodName, decorators.RestDecorator);
        const optionalDecorators = getDecoratorsByType(cls, methodName, decorators.OptionalDecorator);

        const paramNames = getParamNames(cls[methodName]);
        const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", cls, methodName);

        const params = paramTypes.map((type, i) => ({
            type,
            name: paramNames[i],
            rest: restDecorators.some(dec => dec.index === i),
            optional: optionalDecorators.some(dec => dec.index === i)
        }));

        this.commands.set(cmdDec.options.name, 
            new Command(cmdDec.options.name, cls[methodName], params, gear, checkDecorators));
    }

    getRootCommand(name: string) {
        return this.commands.get(name);
    }

    async addGear(gear: any) {
        if (!gear.constructor || !gear.constructor.prototype) {
            throw "Gear is not an instance of a class!";
        }

        let cls = gear.constructor.prototype;
        let properties = Object.getOwnPropertyNames(cls);

        for (let prop of properties) {
            let cmdDecorators = getDecoratorsByType(cls, prop, CommandDecorator);
            if (cmdDecorators.length === 0) continue;

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
