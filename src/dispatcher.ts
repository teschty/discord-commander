import { CommandClient } from "./client";
import { Message } from "discord.js";
import { CommandManager } from "./command-manager";
import * as discord from "discord.js";
import { Context, Command, Flags } from "./command";

class InvalidArgumentException {
    constructor(public arg: string, public type: string) {
        this.arg = arg;
        this.type = type;
    }
}

/** Splits a string on spaces while preserving quoted text */
function parseCommand(cmd: string) {
    const splitRegex = /[^\s"]+|"([^"]*)"/gi;
    const result: { text: string; index: number; length: number }[] = [];

    let match: any;
    do {
        match = splitRegex.exec(cmd);

        if (match) {
            result.push({ text: match[1] ? match[1] : match[0], index: match.index, length: match.length });
        }
    } while (match != null);

    return result;
}

class InvalidTypeException {
    constructor(public expectedType: string, public provided: string) { }
}

/** Attempts to convert string values to specified type */
async function convertToType(client: CommandClient, guild: discord.Guild, item: string, type: any) {
    try {
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

                return client.users.fetch(item);

            case discord.GuildMember:
                // if mention, message will be <@id>
                if (item.startsWith("<")) {
                    item = item.substring(2, item.length - 1);
                }

                return guild.members.fetch(item);

            case Object:
            case String:
                return item;
            
            default:
                // if nothing else, try calling the constructor with the string
                // TODO: this could cause an exception
                return new type(item);
        }
    } catch (ex) {
        if (type.name) {
            throw new InvalidTypeException(type.name, item);
        } else {
            throw new InvalidTypeException(type.toString(), item);
        }
    }
}

class TooFewArgumentsException { }

export class CommandDispatcher {
    constructor(private commandManager: CommandManager) { }

    async handleMessage(client: CommandClient, msg: Message) {
        if (!msg.content.startsWith(client.options.commandPrefix)) { return; }
        let content = msg.content.substring(client.options.commandPrefix.length);

        let parts = parseCommand(content);
        let commandName = parts[0];

        const rootCommand = this.commandManager.getRootCommand(commandName.text);
        if (rootCommand === undefined) {
            if (client.options.unknownCommandResponse) {
                await msg.reply(`unknown command '${commandName}'`);
            }

            return;
        }

        // strip flags
        let flags: { [index: string]: any } = {};

        for (let i = 0; i < parts.length; i++) {
            let text = parts[i].text;

            if (text.startsWith("--")) {
                flags[text.substring(2)] = parts[i + 1].text;
                parts = parts.slice(0, i).concat(parts.slice(i + 2));
                i -= 1;
            }
        }

        let argIdx = 1;
        if (rootCommand instanceof Command) {
            let params = rootCommand.params;

            // only want to convert parameters up to the @rest param
            // which is only allowed to be of type string
            let restIndex = rootCommand.params.findIndex(p => p.rest);
            if (restIndex !== -1) {
                params = params.slice(0, restIndex);
            }

            let typedArgs = await Promise.all(params.map(async param => {
                if (param.type === Context) {
                    return new Context(msg.channel as discord.TextChannel, msg, msg.author, msg.guild);
                } else if (param.type === Flags) {
                    return new Flags(flags);
                }

                // if we're out of text, and this is optional - return nothing
                if (argIdx >= parts.length) {
                    if (param.optional) { return undefined; }
                    throw new TooFewArgumentsException();
                }

                return await convertToType(client, msg.guild, parts[argIdx++].text, param.type)
            })).catch((err: TooFewArgumentsException | InvalidTypeException) => {
                return err;
            });

            if (typedArgs instanceof InvalidTypeException) {
                await msg.channel.send(`Invalid argument '${typedArgs.provided}', expected argument of type '${typedArgs.expectedType}'`);
                return;
            } else if (typedArgs instanceof TooFewArgumentsException) {
                let expectedNumArgs = params.length - params.filter(p => p.optional).length;
                await msg.channel.send(`Expected ${expectedNumArgs} argument(s), but got ${parts.length} argument(s)`);
                return;
            }

            if (restIndex !== -1) {
                let lastPart = parts[restIndex - 1];
                typedArgs.push(content.substring(lastPart.index + lastPart.text.length + 1));
            }

            rootCommand.method.call(rootCommand.gear, ...typedArgs as any[]);
        } else {
            // TODO: handle command groups
        }
    }
}
