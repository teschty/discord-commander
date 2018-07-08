import "reflect-metadata";
export { CommandClient as Client } from "./client";
export { command, rest, optional, checks } from "./decorators";
export { Context, Flags } from "./command";
export * from "discord.js";
