import { getDecoratorsByType, CommandDecorator } from "./decorators";
import * as decorators from "./decorators";

export class CommandManager {
    commands: Map<string, Command | CommandGroup> = new Map();

    private addCommand(gear: any, methodName: string, cmdDec: CommandDecorator) {
        let cls = gear.constructor.prototype;
        let checkDecorators = getDecoratorsByType(cls, methodName, decorators.CheckDecorator);

        this.commands.set(cmdDec.options.name, {
            kind: "command",
            name: cmdDec.options.name,
            disabled: cmdDec.options.disabled || false,
            params: [],
            gear
        });
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

class MyClass {
    @decorators.command()
    func() {

    }

    @decorators.command("myCommand")
    @decorators.checks.owner
    myCommand(x: number, @decorators.rest @decorators.optional str: string) {

    }
}

let gm = new CommandManager();

gm.addGear(new MyClass());

