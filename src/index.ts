import "reflect-metadata";

export { CommandClient as Client } from "./client";
export { command, rest, optional, checks, flag } from "./decorators";
export { Context, Flags } from "./command";
export * from "discord.js";
