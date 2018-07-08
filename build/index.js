"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var client_1 = require("./client");
exports.Client = client_1.CommandClient;
var decorators_1 = require("./decorators");
exports.command = decorators_1.command;
exports.rest = decorators_1.rest;
exports.optional = decorators_1.optional;
exports.checks = decorators_1.checks;
var command_1 = require("./command");
exports.Context = command_1.Context;
exports.Flags = command_1.Flags;
__export(require("discord.js"));
//# sourceMappingURL=index.js.map