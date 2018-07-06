export declare class DefaultDict<T> {
    [key: string]: T;
    constructor(defaultValue: () => T);
}
