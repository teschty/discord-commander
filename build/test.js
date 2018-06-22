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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const client_1 = require("./client");
const decorators_1 = require("./decorators");
const command_1 = require("./command");
class MyClass {
    okay(ctx, value = "meme") {
        ctx.send("OK (rest = " + value + ")");
    }
    ok(ctx, x) {
        ctx.send("override " + (x + 1));
    }
}
__decorate([
    decorators_1.commands.command(),
    __param(1, decorators_1.optional),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [command_1.Context, String]),
    __metadata("design:returntype", void 0)
], MyClass.prototype, "okay", null);
__decorate([
    decorators_1.commands.command("override"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [command_1.Context, Number]),
    __metadata("design:returntype", void 0)
], MyClass.prototype, "ok", null);
let client = new client_1.CommandClient();
client.addGear(new MyClass());
client.login("MzIwMzIyMzAwODkxMzY1Mzc5.DRodYw.nEsW7hTgm47QBfijucHUL3IKQ6M");
//# sourceMappingURL=test.js.map