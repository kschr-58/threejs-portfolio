export default class ContactMessage {
    public name: string;
    public email: string;
    public message: string;

    constructor(
        name: string,
        email: string,
        message: string,
    ) {
        this.name = name;
        this.email = email;
        this.message = message;
    }
}