import * as vscode from 'vscode';

export class EditorUtil {

    public static hasActiveEditor() {
        return vscode.window.activeTextEditor !== undefined;
    }

    public static get activeEditor(): vscode.TextEditor | undefined {
        return vscode.window.activeTextEditor;
    }

    public static getCurrentPosition(): vscode.Position | undefined {
        if (!this.activeEditor) return;

        return this.activeEditor.selection.active;
    }

    public static getCurrentPositionOffset(): number | undefined {
        if (!this.getCurrentPosition()) return;

        return this.activeEditor!.document.offsetAt(this.getCurrentPosition()!);
    }

    public static getLineAt(line: number): vscode.TextLine | undefined {
        if (!this.activeEditor) return;

        return this.activeEditor.document.lineAt(line);
    }

    public static getLineText(line: number, position: number = 0): String {
        if (this.getLineAt(line))
            return this.getLineAt(line)!.text.substring(position);

        return "";
    }

    public static getText(range: vscode.Range): string {
        if (this.activeEditor)
            return this.activeEditor.document.getText(range);

        return "";
    }

    public static getRangeToEndOfDocumentFromCurrentPosition(): vscode.Range | undefined {
        if (!this.activeEditor || !this.getCurrentPosition()) return;

        const lineCount = this.activeEditor.document.lineCount;

        return new vscode.Range(this.getCurrentPosition()!, new vscode.Position(lineCount, this.getLineAt(lineCount - 1)!.text.length));
    }

    public static getRangeToStartOfDocumentFromCurrentPosition(): vscode.Range | undefined {
        if (!this.activeEditor || !this.getCurrentPosition()) return;

        return new vscode.Range(new vscode.Position(0, 0), this.getCurrentPosition()!);
    }

    public static setSelection(position: vscode.Position, select: boolean = false) {
        if (!this.activeEditor) return;

        let anchor = position;
        if (select) anchor = this.getCurrentPosition()!;
        this.activeEditor.selection = new vscode.Selection(anchor, position);
    }

    public static async setSelectionAndRevealCenter(position: vscode.Position, select: boolean = false) {
        this.setSelection(position, select);
        await this.revealLineAtCenter(position.line);
    }

    public static async revealLineAtCenter(line: number) {
        await vscode.commands.executeCommand("revealLine", {
            lineNumber: line,
            at: 'center'
        });
    }

}