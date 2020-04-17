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

class TooFewArgumentsException { }

class UnknownFlagException { 
    constructor(public name: string) { }
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

            case Boolean:
                switch (item.toLowerCase()) {
                    case "y":
                    case "t":
                    case "yes":
                    case "true":
                        return true;

                    case "n":
                    case "f":
                    case "no":
                    case "false":
                        return false;

                    default:
                        throw new InvalidArgumentException(item, "boolean");
                }

            case discord.Channel:
            case discord.TextChannel:
            case discord.GuildChannel:
            case discord.VoiceChannel:
                return await client.channels.fetch(item);
            
            case discord.Guild:
                return client.guilds.resolve(item);

            case discord.User:
                // if mention, message will be <@id>
                if (item.startsWith("<")) {
                    item = item.substring(2, item.length - 1);
                }

                return client.users.fetch(item).catch(err => {
                    console.log("Couldn't resolve " + item + " to user. Error: " + err);
                });

            case discord.GuildMember:
                // if mention, message will be <@id>
                if (item.startsWith("<")) {
                    item = item.substring(2, item.length - 1);
                }

                return guild.members.fetch(item).catch(err => {
                    console.log("Couldn't resolve " + item + " to user. Error: " + err);
                });

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

export class CommandDispatcher {
    constructor(private commandManager: CommandManager) { }

    // TODO: break this up
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
                if (text.includes("=")) {
                    let flagParts = text.split("=");
                    flags[flagParts[0].substring(2)] = flagParts[1];
                } else {
                    flags[text.substring(2)] = "true";
                }

                parts.splice(i, 1);
                i -= 1;
            }
        }

        let argIdx = 1;
        if (rootCommand instanceof Command) {
            let ctx = new Context(msg.channel as discord.TextChannel, msg, msg.author, msg.guild!);

            let checkResult = rootCommand.performChecks(client, ctx);
            if (checkResult instanceof Error) {
                return await msg.channel.send(checkResult.message);
            }

            let params = rootCommand.params;

            // only want to convert parameters up to the @rest param
            // which is only allowed to be of type string
            let restIndex = rootCommand.params.findIndex(p => p.rest);
            if (restIndex !== -1) {
                params = params.slice(0, restIndex);
            }

            let typedArgs = await Promise.all(params.map(async param => {
                if (param.type === Context) {
                    return ctx;
                } else if (param.type.prototype instanceof Flags) {
                    let flagObject = new param.type();

                    for (let key of Object.keys(flags)) {
                        let type = Reflect.getMetadata("design:type", param.type.prototype, key);
                        if (type === undefined) {
                            throw new UnknownFlagException(key);
                        }

                        flagObject[key] = await convertToType(client, msg.guild!, flags[key], type);
                    }

                    return flagObject;
                }

                // if we're out of text, and this is optional - return nothing
                if (argIdx >= parts.length) {
                    if (param.optional) { return undefined; }
                    throw new TooFewArgumentsException();
                }

                return await convertToType(client, msg.guild!, parts[argIdx++].text, param.type)
            })).catch((err: TooFewArgumentsException | InvalidTypeException | UnknownFlagException) => {
                return err;
            });

            if (typedArgs instanceof InvalidTypeException) {
                return await msg.channel.send(`Invalid argument '${typedArgs.provided}', expected argument of type '${typedArgs.expectedType}'`);
            } else if (typedArgs instanceof TooFewArgumentsException) {
                let expectedNumArgs = params.length - params.filter(p => p.optional).length;
                await msg.channel.send(`Expected ${expectedNumArgs} argument(s), but got ${parts.length} argument(s)`);
                return;
            } else if (typedArgs instanceof UnknownFlagException) {
                return await msg.channel.send(`Command "${commandName.text}" has no flag "${typedArgs.name}"`);
            }

            if (restIndex !== -1) {
                let lastPart = parts[restIndex - 1];
                typedArgs.push(content.substring(lastPart.index + lastPart.text.length + 1));
            }

            let result = rootCommand.method.call(rootCommand.gear, ...typedArgs as any[]);
            
            // may not return a promise if command isn't async
            if (result instanceof Promise) {
                result.catch(async err => {
                    await msg.channel.send("An error occurred while executing command: " + err);
                });
            }
        } else {
            // TODO: handle command groups
        }
    }
}
