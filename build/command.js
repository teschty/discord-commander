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
    lastResponsesByUser[user.id] = lastResponses;
}
exports.deleteLastResponsesToUser = deleteLastResponsesToUser;
// Has to be class, otherwise reflection can't see it
class Context {
    constructor(channel, message, user) {
        this.channel = channel;
        this.message = message;
        this.user = user;
        this.send = saveMessageProxy(this.channel, this.user, this.channel.send);
        this.sendCode = saveMessageProxy(this.channel, this.user, this.channel.sendCode);
        this.sendEmbed = saveMessageProxy(this.channel, this.user, this.channel.sendEmbed);
        this.sendFile = saveMessageProxy(this.channel, this.user, this.channel.sendFile);
        this.sendMessage = saveMessageProxy(this.channel, this.user, this.channel.sendMessage);
    }
}
exports.Context = Context;
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