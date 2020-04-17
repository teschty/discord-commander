import * as discord from "discord.js";
import { CheckDecorator } from "./decorators";
import { CommandClient } from "./client";
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
        (options: discord.APIMessage | discord.MessageOptions | discord.MessageEmbed | discord.MessageAttachment | (discord.MessageEmbed | discord.MessageAttachment)[] | (discord.MessageOptions & {
            split?: false | undefined;
        })): Promise<discord.Message>;
        (options: discord.APIMessage | (discord.MessageOptions & {
            split: true | discord.SplitOptions;
            content: any;
        })): Promise<discord.Message[]>;
        (content: any, options?: discord.MessageOptions | discord.MessageEmbed | discord.MessageAttachment | (discord.MessageEmbed | discord.MessageAttachment)[] | (discord.MessageOptions & {
            split?: false | undefined;
        }) | undefined): Promise<discord.Message>;
        (content: any, options?: (discord.MessageOptions & {
            split: true | discord.SplitOptions;
        }) | undefined): Promise<discord.Message[]>;
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
    /** Name of parameter */
    name: string;
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
    checks: CheckDecorator[];
    constructor(name: string, method: Function, params: CommandParameter[], gear: any, checks: CheckDecorator[]);
    performChecks(bot: CommandClient, ctx: Context): Error | undefined;
    getTypeName(type: any): any;
    getHelpText(): string;
}
export declare class CommandGroup {
    name: string;
    subCommands: CommandMap;
    gear: any;
    constructor(name: string, subCommands: CommandMap, gear: any);
}
