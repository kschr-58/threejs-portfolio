export default class Project {
    public id: string;
    public title: string;
    public description: string;
    public sourceUrl: string;
    public imageUrl: string;

    constructor(
        id: string,
        title: string,
        description: string,
        sourceUrl: string,
        imageUrl: string
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.sourceUrl = sourceUrl;
        this.imageUrl = imageUrl;
    }
}