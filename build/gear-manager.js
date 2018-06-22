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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("./decorators");
const decorators = __importStar(require("./decorators"));
class GearManager {
    constructor() {
        this.commands = new Map();
    }
    addGear(gear) {
        if (!gear.constructor || !gear.constructor.prototype) {
            throw "Gear is not an instance of a class!";
        }
        let cls = gear.constructor.prototype;
        let properties = Object.getOwnPropertyNames(cls);
        for (let prop of properties) {
            let cmdDecorators = decorators_1.getDecoratorsByType(cls, prop, decorators_1.CommandDecorator);
            if (cmdDecorators.length === 0)
                continue;
            for (let cmdDec of cmdDecorators) {
                console.log(cmdDec.options.name);
            }
        }
    }
}
exports.GearManager = GearManager;
class MyClass {
    func() {
    }
    myCommand(x, str) {
    }
}
__decorate([
    decorators.command(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MyClass.prototype, "func", null);
__decorate([
    decorators.command("myCommand"),
    decorators.checks.owner,
    __param(1, decorators.rest), __param(1, decorators.optional),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], MyClass.prototype, "myCommand", null);
let gm = new GearManager();
gm.addGear(new MyClass());
