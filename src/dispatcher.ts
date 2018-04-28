import { CommandClient } from "./client";
import { Message } from "discord.js";
import { CommandManager } from "./command-manager";
import * as discord from "discord.js";

class InvalidArgumentException {
    constructor(public arg: string, public type: string) {
        this.arg = arg;
        this.type = type;
    }
}

/** Splits a string on spaces while preserving quoted text */
function parseCommand(cmd: string) {
    const splitRegex = /[^\s"]+|"([^"]*)"/gi;
    const result: string[] = [];

    let match: any;
    do {
        match = splitRegex.exec(cmd);

        if (match) {
            result.push(match[1] ? match[1] : match[0]);
        }
    } while (match != null);

    return result;
}

/** Attemtps to convert string values to specified type */
async function convertToType(client: CommandClient, item: string, type: any) {
    switch (type) {
        case Number:
            const result = parseFloat(item);
            if (isNaN(result) && item !== "NaN") {
                throw new InvalidArgumentException(item, "number");
            }

            return result;
        
        case discord.User:
            // if mention, message will be <@id>
            if (item.startsWith("<")) {
                item = item.substring(2, item.length - 1);
            }

            return client.fetchUser(item);

        case Object:
        case String:
            return item;
        
        default:
            // if nothing else, try calling the constructor with the string
            // TODO: this could cause an exception
            return new type(item);
    }
}

export class CommandDispatcher {
    constructor(private commandManager: CommandManager) { }

    async handleMessage(client: CommandClient, msg: Message) {
        const content = msg.content;
        if (!content.startsWith(client.options.commandPrefix)) { return; }

        const parts = parseCommand(content);
        const commandName = parts[0];

        const rootCommand = this.commandManager.getRootCommand(commandName);
        if (rootCommand === undefined) {
            if (client.options)
        }
    }
}
