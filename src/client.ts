import * as discord from "discord.js";
import { CommandDispatcher } from "./dispatcher";
import { GearManager } from "./gear-manager";

export interface ClientOptions extends discord.ClientOptions {
    /** Character or string that prefaces each command */
    commandPrefix?: string;
    /** Whether the bot should respond to an unknown command */
    unknownCommandResponse?: boolean;
    /** The owner(s) of the bot */
    owner?: string | string[] | Set<string>;
}

export class CommandClient extends discord.Client {
    dispatcher: CommandDispatcher;
    gearManager: GearManager;
    
    constructor(options: ClientOptions = {}) {
        if (options.commandPrefix === undefined) { options.commandPrefix = "!"; }
        if (options.unknownCommandResponse === undefined) { options.unknownCommandResponse = false; }

        super(options);

        this.gearManager = new GearManager();
        this.dispatcher = new CommandDispatcher(this.gearManager);

        this.on("message", msg => this.dispatcher.handleMessage(this, msg));
    }

    addGear(gear: any) {
        this.gearManager.addGear(gear);
    }
}
