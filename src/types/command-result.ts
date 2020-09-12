export default class CommandResult {
    private _isError: boolean;
    private _message: string;

    constructor(msg: string, isError: boolean = false) {
        this._isError = isError;
        this._message = msg;
    }

    public get message(): string {
        return this._message;
    }

    public get isError(): boolean {
        return this._isError;
    }

}