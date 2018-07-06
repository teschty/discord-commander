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
const dispatcher_1 = require("./dispatcher");
const command_manager_1 = require("./command-manager");
const command = __importStar(require("./command"));
class CommandClient extends discord.Client {
    constructor(options = {}) {
        if (options.commandPrefix === undefined) {
            options.commandPrefix = "!";
        }
        if (options.unknownCommandResponse === undefined) {
            options.unknownCommandResponse = false;
        }
        if (options.owner === undefined) {
            options.owner = "";
        }
        super(options);
        this.options = options;
        this.commandManager = new command_manager_1.CommandManager();
        this.dispatcher = new dispatcher_1.CommandDispatcher(this.commandManager);
        this.on("message", msg => this.dispatcher.handleMessage(this, msg));
    }
    getLastResponsesToUser(user) {
        return command.getLastResponsesToUser(user);
    }
    addGear(gear) {
        this.commandManager.addGear(gear);
    }
}
exports.CommandClient = CommandClient;
//# sourceMappingURL=client.js.map