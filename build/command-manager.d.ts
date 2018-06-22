import { Command, CommandGroup } from "./command";
export declare class CommandManager {
    commands: Map<string, Command | CommandGroup>;
    private addCommand;
    getRootCommand(name: string): Command | CommandGroup | undefined;
    addGear(gear: any): Promise<void>;
}
