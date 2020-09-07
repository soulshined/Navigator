import * as vscode from "vscode";


export class StatusBar {
    private _text: string = "";
    private _component: vscode.StatusBarItem;

    constructor(alignment: vscode.StatusBarAlignment = vscode.StatusBarAlignment.Left) {
        this._component = vscode.window.createStatusBarItem(alignment);
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