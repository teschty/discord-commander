import * as decorators from "./decorators";

export class GearManager {
    addGear(gear: any) {
        if (!gear.constructor || !gear.constructor.prototype) {
            throw "Gear is not an instance of a class!";
        }

        let cls = gear.constructor.prototype;
        let properties = Object.getOwnPropertyNames(cls);

        for (let prop of properties) {
            let propDecorators = decorators.get(cls, prop);
            if (!propDecorators) continue;

            for (let decorator of propDecorators) {
                if (decorator.kind === "command") {
                }
            }

            console.log(propDecorators);
        }
    }
}

class MyClass {
    @decorators.command()
    func() {

    }

    @decorators.command("myCommand")
    @decorators.checks.owner
    myCommand(x: number, @decorators.rest @decorators.optional str: string) {

    }
}

let gm = new GearManager();

gm.addGear(new MyClass());

