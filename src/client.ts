import * as discord from "discord.js";
import { CommandDispatcher } from "./dispatcher";
import { CommandManager } from "./command-manager";
import * as command from "./command";

export interface ClientOptions {
    /** Character or string that prefaces each command */
    commandPrefix?: string;
    /** Whether the bot should respond to an unknown command */
    unknownCommandResponse?: boolean;
    /** The owner(s) of the bot */
    owners?: string[];
}

export class CommandClient extends discord.Client {
    dispatcher: CommandDispatcher;
    commandManager: CommandManager;
    options!: Required<ClientOptions> & discord.ClientOptions;

    constructor(options: ClientOptions & discord.ClientOptions = {}) {
        if (options.commandPrefix === undefined) { options.commandPrefix = "!"; }
        if (options.unknownCommandResponse === undefined) { options.unknownCommandResponse = false; }
        if (options.owners === undefined) { options.owners = []; }
        
        super(options);

        this.commandManager = new CommandManager();
        this.dispatcher = new CommandDispatcher(this.commandManager);

        this.on("message", msg => this.dispatcher.handleMessage(this, msg));
    }

    getLastResponsesToUser(user: discord.User) {
        return command.getLastResponsesToUser(user);
    }

    deleteLastResponsesToUser(user: discord.User, numberToDelete: number) {
        return command.deleteLastResponsesToUser(user, numberToDelete);
    }

    getHelpText(commandName: string) {
        let cmd = this.commandManager.getRootCommand(commandName);

        if (cmd instanceof command.Command) {
            return cmd.getHelpText();
        }

        return "";
    }

    addGear(gear: any) {
        this.commandManager.addGear(gear);
    }
}
