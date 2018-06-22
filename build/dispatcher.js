"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord = __importStar(require("discord.js"));
const command_1 = require("./command");
class InvalidArgumentException {
    constructor(arg, type) {
        this.arg = arg;
        this.type = type;
        this.arg = arg;
        this.type = type;
    }
}
/** Splits a string on spaces while preserving quoted text */
function parseCommand(cmd) {
    const splitRegex = /[^\s"]+|"([^"]*)"/gi;
    const result = [];
    let match;
    do {
        match = splitRegex.exec(cmd);
        if (match) {
            result.push({ text: match[1] ? match[1] : match[0], index: match.index, length: match.length });
        }
    } while (match != null);
    return result;
}
class InvalidTypeException {
    constructor(expectedType, provided) {
        this.expectedType = expectedType;
        this.provided = provided;
    }
}
/** Attempts to convert string values to specified type */
async function convertToType(client, guild, item, type) {
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
                return client.fetchUser(item);
            case discord.GuildMember:
                // if mention, message will be <@id>
                if (item.startsWith("<")) {
                    item = item.substring(2, item.length - 1);
                }
                return guild.fetchMember(item);
            case Object:
            case String:
                return item;
            default:
                // if nothing else, try calling the constructor with the string
                // TODO: this could cause an exception
                return new type(item);
        }
    }
    catch (ex) {
        if (type.name) {
            throw new InvalidTypeException(type.name, item);
        }
        else {
            throw new InvalidTypeException(type.toString(), item);
        }
    }
}
class TooFewArgumentsException {
}
class CommandDispatcher {
    constructor(commandManager) {
        this.commandManager = commandManager;
    }
    async handleMessage(client, msg) {
        if (!msg.content.startsWith(client.options.commandPrefix)) {
            return;
        }
        let content = msg.content.substring(client.options.commandPrefix.length);
        const parts = parseCommand(content);
        const commandName = parts[0];
        const rootCommand = this.commandManager.getRootCommand(commandName.text);
        if (rootCommand === undefined) {
            if (client.options.unknownCommandResponse) {
                await msg.reply(`unknown command '${commandName}'`);
            }
            return;
        }
        let argIdx = 1;
        if (rootCommand instanceof command_1.Command) {
            let params = rootCommand.params;
            // only want to convert parameters up to the @rest param
            // which is only allowed to be of type string
            let restIndex = rootCommand.params.findIndex(p => p.rest);
            if (restIndex !== -1) {
                params = params.slice(0, restIndex);
            }
            let typedArgs = await Promise.all(params.map(async (param) => {
                if (param.type === command_1.Context) {
                    return new command_1.Context(msg.channel, msg, msg.author);
                }
                // if we're out of text, and this is optional - return nothing
                if (argIdx >= parts.length) {
                    if (param.optional) {
                        return undefined;
                    }
                    throw new TooFewArgumentsException();
                }
                return await convertToType(client, msg.guild, parts[argIdx++].text, param.type);
            })).catch((err) => {
                return err;
            });
            if (typedArgs instanceof InvalidTypeException) {
                await msg.channel.send(`Invalid argument '${typedArgs.provided}', expected argument of type '${typedArgs.expectedType}'`);
                return;
            }
            else if (typedArgs instanceof TooFewArgumentsException) {
                let expectedNumArgs = params.length - params.filter(p => p.optional).length;
                await msg.channel.send(`Expected ${expectedNumArgs} argument(s), but got ${parts.length} argument(s)`);
                return;
            }
            if (restIndex !== -1) {
                let lastPart = parts[restIndex - 1];
                typedArgs.push(content.substring(lastPart.index + lastPart.text.length + 1));
            }
            rootCommand.method.call(rootCommand.gear, ...typedArgs);
        }
        else {
            // TODO: handle command groups
        }
    }
}
exports.CommandDispatcher = CommandDispatcher;
//# sourceMappingURL=dispatcher.js.map