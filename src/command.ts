import * as discord from "discord.js";

export type CommandMap = Map<string, Command>;

// Has to be class, otherwise reflection can't see it
export class Context {
    constructor(public channel: discord.TextChannel, 
                public message: discord.Message, 
                public user: discord.User) { }

    send(text: string) {
        return (this.channel as discord.TextChannel).send(text);
    }
}

export interface CommandOptions {
    /** Name of command - defaults to function name */
    name: string;
    /** If set, command is not invokable */
    disabled?: boolean;
}

export interface CommandParameter {
    /** Type of parameter, string, number, etc... */
    type: any;
    /** If set, remainder of given arguments are joined into a single string */
    rest: boolean;
    /** If set, parameter is not required */
    optional: boolean;
}

export class Command {
    constructor(public name: string, 
                public method: Function,
                public params: CommandParameter[],
                public gear: any) { }
}

export class CommandGroup {
    constructor(public name: string,
                public subCommands: CommandMap,
                public gear: any) { }
}
