export default class Project {
    private id: string;
    private title: string;
    private description: string;
    private sourceUrl: string;
    private imageUrl: string;

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

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public getSource(): string {
        return this.sourceUrl;
    }

    public getImageUrl(): string {
        return this.imageUrl;
    }
}