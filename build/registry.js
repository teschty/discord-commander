"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
class CommandRegistry {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
    }
}
// command registration decorator functions
function command(options) {
    return (target, key) => {
        // if options not supplied
        // name is defaulted to method name
        if (options === undefined) {
            options = { name: target[key].name };
        }
        // if simply supplying name, wrap in options object
        if (typeof options === "string") {
            options = { name: options };
        }
        const types = Reflect.getMetadata("design:paramtypes", target, key);
        const method = target[key];
        const params = types.map(type => ({
            type,
            // TODO: Add remainder parameters
            remainder: false,
            // TODO: Add optional parameters
            optional: false
        }));
    };
}
exports.command = command;
class Sdfsdf {
    dsfSdfs(x) {
    }
}
__decorate([
    command("Sdfsd"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], Sdfsdf.prototype, "dsfSdfs", null);
