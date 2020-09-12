import { commands } from "vscode";

export default class ContextItem {
    private _identifier: string;
    private _lastValue: boolean;

    constructor(name: string) {
        this._identifier = name;
        this._lastValue = false;
    }

    public set(value: boolean): void {
        if (this._lastValue === value) {
            return;
        }
        this._lastValue = value;
        commands.executeCommand('setContext', this._identifier, this._lastValue);
    }

}