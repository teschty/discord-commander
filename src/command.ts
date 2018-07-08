import * as discord from "discord.js";

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

export class Flags<T> {
    flag: { [P in keyof T]?: T[P] };

    constructor(obj: Partial<T>) {
        this.flag = Object.assign({}, obj);
    }
}

export interface CommandOptions {
    /** Name of command - defaults to function name */
    name: string;
    /** If set, command is not invokable */
    disabled?: boolean;
}

export interface CommandParameter {
    /** Type of parameter, string, number, etc... */
    type: any;
    /** If set, remainder of given arguments are joined into a single string */
    rest: boolean;
    /** If set, parameter is not required */
    optional: boolean;
}

export class Command {
    constructor(public name: string, 
                public method: Function,
                public params: CommandParameter[],
                public gear: any) { }
}

export class CommandGroup {
    constructor(public name: string,
                public subCommands: CommandMap,
                public gear: any) { }
}
