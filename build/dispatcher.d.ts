import { CommandClient } from "./client";
import { Message } from "discord.js";
import { CommandManager } from "./command-manager";
export declare class CommandDispatcher {
    private commandManager;
    constructor(commandManager: CommandManager);
    handleMessage(client: CommandClient, msg: Message): Promise<Message | undefined>;
}
