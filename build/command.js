"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            if (param.optional) {
                return `[${param.name}: ${param.type.name}]`;
            }
            else if (param.rest) {
                return `${param.name}: ${param.type.name}...`;
            }
            else {
                return `${param.name}: ${param.type.name}`;
            }
        })
            .filter(t => t)
            .join(", ");
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