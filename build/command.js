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
    constructor(obj) {
        this.flag = Object.assign({}, obj);
    }
}
exports.Flags = Flags;
class Command {
    constructor(name, method, params, gear) {
        this.name = name;
        this.method = method;
        this.params = params;
        this.gear = gear;
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