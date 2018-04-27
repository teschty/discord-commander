import { CommandClient } from "./client";
import { Message } from "discord.js";
import { GearManager } from "./gear-manager";

export class CommandDispatcher {
    constructor(private gearManager: GearManager) { }

    handleMessage(client: CommandClient, msg: Message) {
    }
}
