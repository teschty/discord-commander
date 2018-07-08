import * as discord from "discord.js";
export declare function getLastResponsesToUser(user: discord.User): discord.Message[];
export declare function deleteLastResponsesToUser(user: discord.User, numberToDelete: number): Promise<void>;
export declare type CommandMap = Map<string, Command>;
export declare class Context {
    channel: discord.TextChannel;
    message: discord.Message;
    user: discord.User;
    guild?: discord.Guild | undefined;
    constructor(channel: discord.TextChannel, message: discord.Message, user: discord.User, guild?: discord.Guild | undefined);
    send: {
        (content?: any, options?: discord.MessageAttachment | discord.MessageEmbed | discord.MessageOptions | undefined): Promise<discord.Message | discord.Message[]>;
        (options?: discord.MessageAttachment | discord.MessageEmbed | discord.MessageOptions | undefined): Promise<discord.Message | discord.Message[]>;
    };
}
export declare class Flags {
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
