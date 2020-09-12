import * as vscode from "vscode";
import { clamp } from "../util/frequent";
import CommandResult from "../types/command-result";
import EditorUtil from "../util/editor-util";
import UserConfig from "../util/userconfig";

export default class NavigatorService {

    public static jumpLines(qty: number, select: boolean) {
        if (!EditorUtil.activeEditor || qty === 0) return;

        const editor = EditorUtil.activeEditor;
        const currentCharIndex = editor.selection.active.character;
        const newLine = EditorUtil.getLineAt(clamp(editor.selection.active.line + qty, 0, editor.document.lineCount - 1))!;
        const pos = new vscode.Position(newLine.lineNumber, clamp(currentCharIndex, 0, newLine.text.trimRight().length));
        EditorUtil.setSelection(pos, select);
        editor.revealRange(new vscode.Range(pos, pos));
        return new CommandResult("Success");
    }

    public static jumpToCurrentLineCharIndex(index: number, select: boolean): CommandResult | undefined {
        if (!EditorUtil.activeEditor) return;

        let updatedSelections: vscode.Selection[] = [];
        for (let i = 0; i < EditorUtil.activeEditor.selections.length; ++i) {
            const selection = EditorUtil.activeEditor.selections[i];
            const lineText = EditorUtil.getLineAt(selection.active.line);
            if (!lineText) continue;

            const firstChar = lineText.firstNonWhitespaceCharacterIndex;
            const lastChar = lineText.text.match(/\S\s*$/)?.index ?? firstChar;

            let charIndex = clamp(index - 1 + firstChar, firstChar, lastChar);
            if (index < 0) {
                charIndex = clamp(lastChar + index + 1, firstChar, lastChar);
            }

            if (charIndex < 0) {
                if (UserConfig.multicursorSupportedCommandsMustAllMatch)
                    return new CommandResult(`No match found on line ${selection.active.line + 1}`, true);

                continue;
            }
            const pos = new vscode.Position(selection.active.line, charIndex);
            let anchor = pos;
            if (select) anchor = selection.active;
            updatedSelections.push(new vscode.Selection(anchor, pos));
        }

        EditorUtil.activeEditor.selections = updatedSelections;

        return new CommandResult("Success");
    }

    public static jumpToAbsoluteIndex(index: number, select: boolean) {
        if (!EditorUtil.activeEditor) return;

        const pos = EditorUtil.activeEditor.document.positionAt(Math.max(0, index));
        const range = new vscode.Range(pos, pos);
        EditorUtil.setSelection(pos, select);
        EditorUtil.activeEditor.revealRange(range);
    }

    public static jumpToNextMatchViaPattern(pattern: string, isCaseSensitive: boolean, select: boolean) {
        const rangeToDocEnd = EditorUtil.getRangeToEndOfDocumentFromCurrentPosition();
        if (!rangeToDocEnd || EditorUtil.getCurrentPositionOffset() === undefined) return;

        const rangeText = EditorUtil.getText(rangeToDocEnd).substring(1);
        let flags: string = "";
        if (!isCaseSensitive) flags += 'i';

        try {
            const regex = new RegExp(pattern, flags);

            const match = regex.exec(rangeText);
            if (match != null) {
                this.jumpToAbsoluteIndex(EditorUtil.getCurrentPositionOffset()! + match.index + 1, select);
                return new CommandResult("Success");
            }

            return new CommandResult("Not match found", true);
        } catch (error) {
            console.error(error);

            return new CommandResult(!error.message || error.message === "" ? "Invalid regex pattern" : error.message, true);
        }
    }

    public static jumpToNextSubstring(value: string, isCaseSensitive: boolean, select: boolean) {
        const rangeToDocEnd = EditorUtil.getRangeToEndOfDocumentFromCurrentPosition();
        if (!rangeToDocEnd || EditorUtil.getCurrentPositionOffset() === undefined) return;

        let rangeText = EditorUtil.getText(rangeToDocEnd).substring(1);
        if (!isCaseSensitive) {
            rangeText = rangeText.toLowerCase();
            value = value.toLowerCase();
        }
        const matchIndex = rangeText.indexOf(value);

        if (matchIndex !== -1) {
            this.jumpToAbsoluteIndex(matchIndex + EditorUtil.getCurrentPositionOffset()! + 1, select);
            return new CommandResult("Success");
        }

        return new CommandResult("No match found", true);
    }

    public static jumpToPrevSubstring(value: string, isCaseSensitive: boolean, select: boolean) {
        const rangeFromDocStart = EditorUtil.getRangeToStartOfDocumentFromCurrentPosition();
        if (!rangeFromDocStart || EditorUtil.getCurrentPositionOffset() === undefined) return;

        let rangeText = EditorUtil.getText(rangeFromDocStart);
        if (!isCaseSensitive) {
            rangeText = rangeText.toLowerCase();
            value = value.toLowerCase();
        }
        const matchIndex = rangeText.lastIndexOf(value);

        if (matchIndex !== -1) {
            this.jumpToAbsoluteIndex(matchIndex, select);
            return new CommandResult("Success");
        }

        return new CommandResult("No previous match found", true);
    }

    public static jumpToPrevMatchViaPattern(pattern: string, isCaseSensitive: boolean, select: boolean) {
        const rangeToDocStart = EditorUtil.getRangeToStartOfDocumentFromCurrentPosition();
        if (!rangeToDocStart || EditorUtil.getCurrentPositionOffset() === undefined) return;

        const rangeText = EditorUtil.getText(rangeToDocStart);
        let flags: string = "g";
        if (!isCaseSensitive) flags += 'i';

        try {
            const regex = new RegExp(pattern, flags);
            const matches = [...rangeText.matchAll(regex)];

            if (matches.length > 0) {
                let match: RegExpMatchArray = matches[matches.length - 1];
                if (match.index) {
                    this.jumpToAbsoluteIndex(match.index, select);
                    return new CommandResult("Success");
                }
                return new CommandResult("Error finding index for match", true);
            }

            return new CommandResult("No previous match found", true);
        } catch (error) {
            console.error(error);

            return new CommandResult(!error.message || error.message === "" ? "Invalid regex pattern" : error.message, true);
        }
    }

    public static jumpToParagraph(direction: 'forwards' | 'reverse', select: boolean = false) {
        if (!EditorUtil.getCurrentPosition()) return;
        let emptyLine;
        if (direction === 'forwards') {
            const text = EditorUtil.getRangeToEndOfDocumentFromCurrentPosition()!;
            for (let i = text.start.line + 1; i < EditorUtil.activeEditor!.document.lineCount; ++i)
                if (EditorUtil.getLineAt(i)!.isEmptyOrWhitespace) {
                    emptyLine = i;
                    break;
                }
        }
        else {
            const text = EditorUtil.getRangeToStartOfDocumentFromCurrentPosition()!;
            for (let i = text.end.line - 1; i >= 0; --i)
                if (EditorUtil.getLineAt(i)!.isEmptyOrWhitespace) {
                    emptyLine = i;
                    break;
                }
        }

        if (!emptyLine) return new CommandResult('No empty lines found', true);

        const pos = new vscode.Position(emptyLine, 0);
        const anchor = select
            ? EditorUtil.activeEditor!.selection.anchor
            : pos;
        EditorUtil.activeEditor!.selection = new vscode.Selection(anchor, pos);
        EditorUtil.activeEditor!.revealRange(new vscode.Range(pos, pos));
        return new CommandResult("Success");
    }

}