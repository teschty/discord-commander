import * as discord from "discord.js";
import { CommandOptions } from "./command";
export declare class Decorator {
    target: any;
    key: string;
    constructor(target: any, key: string);
}
export declare class CommandDecorator extends Decorator {
    options: CommandOptions;
    constructor(target: any, key: string, options: CommandOptions);
}
export declare type CheckType = {
    type: "owner";
} | {
    type: "custom";
    checkFn: (user: discord.User) => boolean;
};
export declare class CheckDecorator extends Decorator {
    check: CheckType;
    constructor(target: any, key: string, check: CheckType);
}
export declare class RestDecorator extends Decorator {
    index: number;
    constructor(target: any, key: string, index: number);
}
export declare class OptionalDecorator extends Decorator {
    index: number;
    constructor(target: any, key: string, index: number);
}
/**
 * Retrieves array of decorators for given `target` and `key`.
 * @param target Generally a class.
 * @param key Key in target that is decorated.
 */
export declare function getDecorators(target: any, key: string): Decorator[];
export declare function getDecoratorsByType<T extends Decorator>(target: any, key: string, type: {
    new (...args: any[]): T;
}): T[];
export declare function command(options?: CommandOptions | string): (target: any, key: string) => void;
export declare function rest(target: any, key: string, index: number): void;
export declare function optional(target: any, key: string, index: number): void;
export declare namespace checks {
    function owner(target: any, key: string): void;
    function check(checkFn: (user: discord.User) => boolean): (target: any, key: string) => void;
}
