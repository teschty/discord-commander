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
const decorators_1 = require("./decorators");
let lastResponsesByUser = {};
function saveMessageProxy(channel, user, func) {
    return ((...args) => {
        return (func.bind(channel))(...args).then(msg => {
            let lastResponses = lastResponsesByUser[user.id] || [];
            lastResponses.push(msg);
            if (lastResponses.length > 5) {
                lastResponses = lastResponses.slice(lastResponses.length - 5);
            }
            lastResponsesByUser[user.id] = lastResponses;
            return msg;
        });
    });
}
function getLastResponsesToUser(user) {
    return lastResponsesByUser[user.id] || [];
}
exports.getLastResponsesToUser = getLastResponsesToUser;
async function deleteLastResponsesToUser(user, numberToDelete) {
    let lastResponses = (lastResponsesByUser[user.id] || []).reverse();
    numberToDelete = Math.min(numberToDelete, lastResponses.length);
    for (let i = 0; i < numberToDelete; i++) {
        await lastResponses[i].delete();
    }
    lastResponses = lastResponses.splice(0, lastResponses.length - numberToDelete);
    lastResponsesByUser[user.id] = lastResponses.reverse();
}
exports.deleteLastResponsesToUser = deleteLastResponsesToUser;
// Has to be class, otherwise reflection can't see it
class Context {
    constructor(channel, message, user, guild) {
        this.channel = channel;
        this.message = message;
        this.user = user;
        this.guild = guild;
        this.send = saveMessageProxy(this.channel, this.user, this.channel.send);
    }
}
exports.Context = Context;
class Flags {
}
exports.Flags = Flags;
class Command {
    constructor(name, method, params, gear, checks) {
        this.name = name;
        this.method = method;
        this.params = params;
        this.gear = gear;
        this.checks = checks;
    }
    performChecks(bot, user) {
        for (let check of this.checks) {
            if (!check.performCheck(bot, user)) {
                return new Error(check.failureMessage);
            }
        }
    }
    getTypeName(type) {
        switch (type) {
            case String:
                return "string";
            case Number:
                return "number";
            case Boolean:
                return "bool";
            case discord.GuildMember:
            case discord.User:
                return "user";
            case discord.Guild:
                return "guild";
            default:
                return type.name;
        }
    }
    getHelpText() {
        let flagsClass;
        let text = this.name + " " + this.params.map(param => {
            if (param.type === Context) {
                return "";
            }
            else if (param.type.prototype instanceof Flags) {
                flagsClass = param.type;
                return "";
            }
            let typeName = this.getTypeName(param.type);
            if (param.optional) {
                return `[${param.name}: ${typeName}]`;
            }
            else if (param.rest) {
                return `(${param.name}: ${typeName}...)`;
            }
            else {
                return `(${param.name}: ${typeName})`;
            }
        })
            .filter(t => t)
            .join(" ");
        if (flagsClass) {
            let decorators = decorators_1.getDecoratorMapForClass(flagsClass.prototype);
            if (decorators) {
                text += " " + Array.from(decorators.entries()).map(entry => {
                    let [name] = entry;
                    let type = Reflect.getMetadata("design:type", flagsClass.prototype, name);
                    return `--${name}=${this.getTypeName(type)}`;
                }).join(" ");
            }
        }
        return text;
    }
}
exports.Command = Command;
class CommandGroup {
    constructor(name, subCommands, gear) {
        this.name = name;
        this.subCommands = subCommands;
        this.gear = gear;
    }
}
exports.CommandGroup = CommandGroup;
//# sourceMappingURL=command.js.map