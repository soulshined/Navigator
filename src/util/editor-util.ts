import { window, TextEditor, Position, TextLine, Range, Selection, commands } from "vscode";

export default class EditorUtil {

    public static hasActiveEditor() {
        return window.activeTextEditor !== undefined;
    }

    public static get activeEditor(): TextEditor | undefined {
        return window.activeTextEditor;
    }

    public static getCurrentPosition(): Position | undefined {
        if (!this.activeEditor) return;

        return this.activeEditor.selection.active;
    }

    public static getCurrentPositionOffset(): number | undefined {
        if (!this.getCurrentPosition()) return;

        return this.activeEditor!.document.offsetAt(this.getCurrentPosition()!);
    }

    public static getLineAt(line: number): TextLine | undefined {
        if (!this.activeEditor) return;

        return this.activeEditor.document.lineAt(line);
    }

    public static getLineText(line: number, position: number = 0): String {
        if (this.getLineAt(line))
            return this.getLineAt(line)!.text.substring(position);

        return "";
    }

    public static getText(range: Range): string {
        if (this.activeEditor)
            return this.activeEditor.document.getText(range);

        return "";
    }

    public static getRangeToEndOfDocumentFromCurrentPosition(): Range | undefined {
        if (!this.activeEditor || !this.getCurrentPosition()) return;

        const lineCount = this.activeEditor.document.lineCount;

        return new Range(this.getCurrentPosition()!, new Position(lineCount, this.getLineAt(lineCount - 1)!.text.length));
    }

    public static getRangeToStartOfDocumentFromCurrentPosition(): Range | undefined {
        if (!this.activeEditor || !this.getCurrentPosition()) return;

        return new Range(new Position(0, 0), this.getCurrentPosition()!);
    }

    public static setSelection(position: Position, select: boolean = false) {
        if (!this.activeEditor) return;

        let anchor = position;
        if (select) anchor = this.getCurrentPosition()!;
        this.activeEditor.selection = new Selection(anchor, position);
    }

    public static async setSelectionAndRevealCenter(position: Position, select: boolean = false) {
        this.setSelection(position, select);
        await this.revealLineAtCenter(position.line);
    }

    public static async revealLineAtCenter(line: number) {
        await commands.executeCommand("revealLine", {
            lineNumber: line,
            at: 'center'
        });
    }

}