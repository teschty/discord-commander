import * as discord from "discord.js";

type Decorator = CommandDecorator | CheckDecorator | RestDecorator | OptionalDecorator;

/** Maps from target (class) to key (method) to decorator */
type DecoratorMap = Map<any, Map<string, Decorator[]>>
const decoratorMap: DecoratorMap = new Map();

interface CommandDecorator {
    kind: "command";
    options: CommandOptions;

    target: any;
    key: string;
}

interface CheckDecorator {
    kind: "check";

    check: { type: "owner" } | {
        type: "custom",
        checkFn: (user: discord.User) => boolean;
    };

    target: any;
    key: string;
}

interface RestDecorator {
    kind: "rest";
    index: number;

    target: any;
    key: string;
}

interface OptionalDecorator {
    kind: "optional";
    index: number;

    target: any;
    key: string;
}

/**
 * Adds a decorator to the decorator map. 
 * @param decorator Decorator to add.
 */
function add(decorator: Decorator) {
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
export function get(target: any, key: string) {
    let keyMap = decoratorMap.get(target);
    if (keyMap === undefined) { return undefined; }

    return keyMap.get(key);
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

        add(<CommandDecorator>{ 
            kind: "command",
            target, key, options
        });
    };
}

export function rest(target: any, key: string, index: number) {
    add(<RestDecorator>{
        kind: "rest",
        target, key, index 
    });
}

export function optional(target: any, key: string, index: number) {
    add(<OptionalDecorator>{
        kind: "optional",
        target, key, index 
    });
}

export namespace checks {
    export function owner(target: any, key: string) {
        add(<CheckDecorator>{
            kind: "check",
            check: { type: "owner" },
            target, key
        });
    }

    export function check(checkFn: (user: discord.User) => boolean) {
        return function(target: any, key: string) {
            add(<CheckDecorator>{
                kind: "check",
                check: {
                    type: "custom",
                    checkFn,
                },
                target, key
            });
        }
    }
}
