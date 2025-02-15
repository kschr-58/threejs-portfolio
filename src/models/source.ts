export default class Source {
    public name: string;
    public type: string;
    public paths?: string[];
    public path?: string;

    constructor(name: string, type: string, path?: string, paths?: string[]) {
        this.name = name;
        this.type = type;
        this.path = path;
        this.paths = paths;
    }
}