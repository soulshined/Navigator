import { StatusBarItem, StatusBarAlignment, window } from "vscode";

export default class StatusBar {
    private _text: string = "";
    private _component: StatusBarItem;

    constructor(alignment: StatusBarAlignment = StatusBarAlignment.Left) {
        this._component = window.createStatusBarItem(alignment);
        this._component.show();
    }

    public getText(): string {
        return this._text;
    }

    public setText(value: string) {
        this._text = value;
        this._component.text = value;
    }

    public getStatusBarItem() {
        return this._component;
    }

}