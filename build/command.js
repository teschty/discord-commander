"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Has to be class, otherwise reflection can't see it
class Context {
    constructor(channel, message, user) {
        this.channel = channel;
        this.message = message;
        this.user = user;
    }
    send(text) {
        return this.channel.send(text);
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