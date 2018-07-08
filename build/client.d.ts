import * as discord from "discord.js";
import { CommandDispatcher } from "./dispatcher";
import { CommandManager } from "./command-manager";
export interface ClientOptions {
    /** Character or string that prefaces each command */
    commandPrefix?: string;
    /** Whether the bot should respond to an unknown command */
    unknownCommandResponse?: boolean;
    /** The owner(s) of the bot */
    owners?: string[];
}
export declare class CommandClient extends discord.Client {
    dispatcher: CommandDispatcher;
    commandManager: CommandManager;
    options: Required<ClientOptions> & discord.ClientOptions;
    constructor(options?: ClientOptions & discord.ClientOptions);
    getLastResponsesToUser(user: discord.User): discord.Message[];
    deleteLastResponsesToUser(user: discord.User, numberToDelete: number): Promise<void>;
    addGear(gear: any): void;
}
