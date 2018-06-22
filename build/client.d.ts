import * as discord from "discord.js";
import { CommandDispatcher } from "./dispatcher";
import { CommandManager } from "./command-manager";
export interface ClientOptions {
    /** Character or string that prefaces each command */
    commandPrefix?: string;
    /** Whether the bot should respond to an unknown command */
    unknownCommandResponse?: boolean;
    /** The owner(s) of the bot */
    owner?: string | string[] | Set<string>;
}
export declare class CommandClient extends discord.Client {
    dispatcher: CommandDispatcher;
    commandManager: CommandManager;
    options: Required<ClientOptions> & discord.ClientOptions;
    constructor(options?: ClientOptions & discord.ClientOptions);
    addGear(gear: any): void;
}
