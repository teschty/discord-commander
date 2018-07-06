import * as discord from "discord.js";
import { Message } from "discord.js";
export declare function getLastResponsesToUser(user: discord.User): Message[];
export declare function deleteLastResponsesToUser(user: discord.User, numberToDelete: number): Promise<void>;
export declare type CommandMap = Map<string, Command>;
export declare class Context {
    channel: discord.TextChannel;
    message: discord.Message;
    user: discord.User;
    constructor(channel: discord.TextChannel, message: discord.Message, user: discord.User);
    send: {
        (content?: any, options?: discord.Attachment | discord.RichEmbed | discord.MessageOptions | undefined): Promise<discord.Message | discord.Message[]>;
        (options?: discord.Attachment | discord.RichEmbed | discord.MessageOptions | undefined): Promise<discord.Message | discord.Message[]>;
    };
    sendCode: (lang: string, content: any, options?: discord.MessageOptions | undefined) => Promise<discord.Message | discord.Message[]>;
    sendEmbed: {
        (embed: discord.RichEmbed | discord.RichEmbedOptions, content?: string | undefined, options?: discord.MessageOptions | undefined): Promise<discord.Message>;
        (embed: discord.RichEmbed | discord.RichEmbedOptions, options?: discord.MessageOptions | undefined): Promise<discord.Message>;
    };
    sendFile: (attachment: discord.BufferResolvable, name?: string | undefined, content?: any, options?: discord.MessageOptions | undefined) => Promise<discord.Message>;
    sendMessage: {
        (content?: string | undefined, options?: discord.MessageOptions | undefined): Promise<discord.Message | discord.Message[]>;
        (options?: discord.MessageOptions | undefined): Promise<discord.Message | discord.Message[]>;
    };
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
export declare class Command {
    name: string;
    method: Function;
    params: CommandParameter[];
    gear: any;
    constructor(name: string, method: Function, params: CommandParameter[], gear: any);
}
export declare class CommandGroup {
    name: string;
    subCommands: CommandMap;
    gear: any;
    constructor(name: string, subCommands: CommandMap, gear: any);
}
