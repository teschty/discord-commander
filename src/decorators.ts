import * as discord from "discord.js";
import { CommandOptions, Context } from "./command";
import { CommandClient } from "./client";
import { fail } from "assert";

/** Maps from target (class) to key (method) to decorator */
type DecoratorMap = Map<any, Map<string, Decorator[]>>
const decoratorMap: DecoratorMap = new Map();

export class Decorator {
    constructor(public target: any, public key: string) { }
}

export class CommandDecorator extends Decorator {
    constructor(target: any, key: string, public options: CommandOptions) {
        super(target, key);
    }
}

export type CheckType = { type: "owner" } | {
    type: "custom",
    checkFn: (user: Context) => boolean;
};

export class CheckDecorator extends Decorator {
    constructor(target: any, key: string, public check: CheckType, public failureMessage: string) {
        super(target, key);
    }

    performCheck(bot: CommandClient, ctx: Context) {
        if (this.check.type === "owner") {
            return bot.options.owners.includes(ctx.user.id);
        } else {
            return this.check.checkFn(ctx);
        }
    }
}

export class RestDecorator extends Decorator {
    constructor(target: any, key: string, public index: number) {
        super(target, key);
    }
}

export class OptionalDecorator extends Decorator {
    constructor(target: any, key: string, public index: number) {
        super(target, key);
    }
}

export class FlagDecorator extends Decorator {
    constructor(target: any, key: string) {
        super(target, key);
    }   
}

/**
 * Adds a decorator to the decorator map. 
 * @param decorator Decorator to add.
 */
function addDecorator(decorator: Decorator) {
    if (!decoratorMap.has(decorator.target)) {
        decoratorMap.set(decorator.target, new Map());
    }

    let keyMap = decoratorMap.get(decorator.target)!;
    if (!keyMap.has(decorator.key)) {
        keyMap.set(decorator.key, []);
    }

    keyMap.get(decorator.key)!.push(decorator);
}

/**
 * Retrieves array of decorators for given `target` and `key`.
 * @param target Generally a class.
 * @param key Key in target that is decorated.
 */
export function getDecorators(target: any, key: string) {
    let keyMap = decoratorMap.get(target);
    if (keyMap === undefined) { return []; }

    let results = keyMap.get(key);
    return results || [];
}

export function getDecoratorsByType<T extends Decorator>(target: any, key: string, type: { new(...args: any[]): T }) {
    let keyMap = decoratorMap.get(target);
    if (keyMap === undefined) { return []; }

    return (keyMap.get(key) || []).filter((decorator): decorator is T => decorator instanceof type);
}

export function getDecoratorMapForClass(target: any) {
    return decoratorMap.get(target);
}

export function command(options?: CommandOptions | string) {
    return (target: any, key: string) => {
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

export function flag(target: any, key: string) {
    addDecorator(new FlagDecorator(target, key));
}

export function rest(target: any, key: string, index: number) {
    addDecorator(new RestDecorator(target, key, index));
}

export function optional(target: any, key: string, index: number) {
    addDecorator(new OptionalDecorator(target, key, index));
}

export namespace checks {
    export function isOwner(failureMessage?: string) {
        return (target: any, key: string) => {
            failureMessage = failureMessage || "Only a bot owner may perform that action.";
            addDecorator(new CheckDecorator(target, key, { type: "owner" }, failureMessage));
        };
    }

    export function check(checkFn: (ctx: Context) => boolean, failureMessage?: string) {
        return (target: any, key: string) => {
            failureMessage = failureMessage || "You lack sufficient permissions to perform that action.";

            let checkDef: CheckType = { type: "custom", checkFn };
            addDecorator(new CheckDecorator(target, key, checkDef, failureMessage));
        };
    }
}
