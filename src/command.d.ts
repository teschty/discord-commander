type CommandMap = Map<string, Command>;

interface Gear {
    
}

interface CommandOptions {
    /** Name of command - defaults to function name */
    name?: string;
    /** If set, command is not invokable */
    disabled?: boolean;
}

interface CommandParameter {
    /** Type of parameter, string, number, etc... */
    type: any;
    /** If set, remainder of given arguments are joined into a single string */
    remainder: boolean;
    /** If set, parameter is not required */
    optional: boolean;
}

interface CommandGroup {
    kind: "group";
    /** Name of command */
    name: string;
    /** If set, command is not invokable */
    disabled: boolean;

    className: string;
    subCommands: CommandMap;
}

interface Command {
    kind: "command";
    name: string;
    disabled: boolean;
    className: string;
    params: CommandParameter[];
}
