import * as discord from "discord.js";
import { RichEmbed, RichEmbedOptions, MessageOptions, StringResolvable, Attachment, Message, BufferResolvable } from "discord.js";

let lastResponsesByUser: { [id: string]: Message[] } = {};

function saveMessageProxy<T>(channel: discord.TextChannel, user: discord.User, func: T) {
    return ((...args: any[]) => {
        return (((func as any).bind(channel))(...args) as Promise<Message>).then(msg => {
            let lastResponses = lastResponsesByUser[user.id] || [] as Message[];

            lastResponses.push(msg);

            if (lastResponses.length > 5) {
                lastResponses = lastResponses.slice(lastResponses.length - 5);
                lastResponsesByUser[user.id] = lastResponses;
            }

            return msg;
        });
    }) as any as T;
}

export function getLastResponsesToUser(user: discord.User): Message[] {
    return lastResponsesByUser[user.id] || [];
}

export type CommandMap = Map<string, Command>;

// Has to be class, otherwise reflection can't see it
export class Context {
    constructor(public channel: discord.TextChannel, 
                public message: discord.Message, 
                public user: discord.User) { }

    send = saveMessageProxy(this.channel, this.user, this.channel.send);
    sendCode = saveMessageProxy(this.channel, this.user, this.channel.sendCode);
    sendEmbed = saveMessageProxy(this.channel, this.user, this.channel.sendEmbed);
    sendFile = saveMessageProxy(this.channel, this.user, this.channel.sendFile);
    sendMessage = saveMessageProxy(this.channel, this.user, this.channel.sendMessage);
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
