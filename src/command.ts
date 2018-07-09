import * as discord from "discord.js";
import { CheckDecorator, getDecoratorsByType } from "./decorators";
import { CommandClient } from "./client";

let lastResponsesByUser: { [id: string]: discord.Message[] } = {};

function saveMessageProxy<T>(channel: discord.TextChannel, user: discord.User, func: T) {
    return ((...args: any[]) => {
        return (((func as any).bind(channel))(...args) as Promise<discord.Message>).then(msg => {
            let lastResponses = lastResponsesByUser[user.id] || [];

            lastResponses.push(msg);

            if (lastResponses.length > 5) {
                lastResponses = lastResponses.slice(lastResponses.length - 5);
            }

            lastResponsesByUser[user.id] = lastResponses;

            return msg;
        });
    }) as any as T;
}

export function getLastResponsesToUser(user: discord.User): discord.Message[] {
    return lastResponsesByUser[user.id] || [];
}

export async function deleteLastResponsesToUser(user: discord.User, numberToDelete: number) {
    let lastResponses = (lastResponsesByUser[user.id] || []).reverse();

    numberToDelete = Math.min(numberToDelete, lastResponses.length);
    for (let i = 0; i < numberToDelete; i++) {
        await lastResponses[i].delete();
    }

    lastResponses = lastResponses.splice(0, lastResponses.length - numberToDelete);
    lastResponsesByUser[user.id] = lastResponses.reverse();
}

export type CommandMap = Map<string, Command>;

// Has to be class, otherwise reflection can't see it
export class Context {
    constructor(public channel: discord.TextChannel,
        public message: discord.Message,
        public user: discord.User,
        public guild?: discord.Guild) { }

    send = saveMessageProxy(this.channel, this.user, this.channel.send);
}

export class Flags { }

export interface CommandOptions {
    /** Name of command - defaults to function name */
    name: string;
    /** If set, command is not invokable */
    disabled?: boolean;
}

export interface CommandParameter {
    /** Type of parameter, string, number, etc... */
    type: any;
    /** Name of parameter */
    name: string;
    /** If set, remainder of given arguments are joined into a single string */
    rest: boolean;
    /** If set, parameter is not required */
    optional: boolean;
}

export class Command {
    constructor(public name: string,
        public method: Function,
        public params: CommandParameter[],
        public gear: any,
        public checks: CheckDecorator[]
    ) { }

    performChecks(bot: CommandClient, user: discord.User) {
        for (let check of this.checks) {
            if (!check.performCheck(bot, user)) {
                return new Error(check.failureMessage);
            }
        }
    }

    public getHelpText() {
        let flagsClass: any;

        let text = this.method.name + this.params.map(param => {
            if (param.type === Context) {
                return "";
            } else if (param.type.prototype instanceof Flags) {
                flagsClass = param.type;
                return "";
            }

            if (param.optional) {
                return `[${param.name}]: ${param.type.toString()}`;
            } else if (param.rest) {
                return `${param.name}: ${param.type}...`;
            } else {
                return `${param.name}: ${param.type}`;
            }
        })
        .filter(t => t)
        .join(", ");

        return text;
    }
}

export class CommandGroup {
    constructor(public name: string,
        public subCommands: CommandMap,
        public gear: any) { }
}
