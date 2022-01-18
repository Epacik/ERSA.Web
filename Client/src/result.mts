export class Result {
    success: boolean;
    message: string | null;

    constructor(success: boolean);
    constructor(success: boolean, message: string | null);
    constructor(){
        this.success = arguments[0];
        this.message = arguments.length == 1 ? null : arguments[1];
    }
}