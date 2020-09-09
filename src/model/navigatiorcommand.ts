import * as vscode from "vscode";
import { NavigatorService } from "../service/navigator";
import { Commands, ICommands } from "../util/constants";
import { EditorUtil } from "../util/editorutil";
import { isInteger } from "../util/frequent";
import { UserConfig } from "../util/userconfig";
export type CommandArgs = {
    value: string,
    select: boolean,
    isCaseSensitive: boolean
}

export class CommandResult {
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

export class NavigatorCommand {
    private _identifier: string;
    private _description: string;
    private _fn: (args: CommandArgs) => CommandResult | undefined;
    private _commandValueType: NavigatorCommandValueType;
    private _canToggleSensitivity: boolean;
    private _canRepeat: boolean;

    constructor(commandConstant: ICommands, fn: (args: CommandArgs) => CommandResult | undefined, valueType: NavigatorCommandValueType = NavigatorCommandValueType.ANY, canToggleSensitivity: boolean = false, isRepeatableCommand: boolean = false) {
        this._identifier = commandConstant.IDENTIFIER;
        this._fn = fn;
        this._description = commandConstant.DESCRIPTION;
        this._commandValueType = valueType;
        this._canToggleSensitivity = canToggleSensitivity;
        this._canRepeat = isRepeatableCommand;
    }

    public get identifier(): string {
        return this._identifier;
    }

    public get description(): string {
        return this._description;
    }

    public get handler(): (args: CommandArgs) => CommandResult | undefined {
        return this._fn;
    }

    public get valueType(): NavigatorCommandValueType {
        return this._commandValueType;
    }

    public get canToggleSensitivity(): boolean {
        return this._canToggleSensitivity;
    }

    public get canRepeat(): boolean {
        return this._canRepeat;
    }

    toString(): string {
        return this.description;
    }

}

export enum NavigatorCommandValueType {
    SINGLE_CHAR,
    NONE,
    INTEGER,
    ANY
}

export class NavigatorCommandsList {

    private static _commands: Map<String, NavigatorCommand> = new Map<String, NavigatorCommand>([
        [Commands.JUMP_LINES.IDENTIFIER, new NavigatorCommand(Commands.JUMP_LINES, (args: CommandArgs) => {
            console.log("jump line handler =>", args);
            args.value = args.value.trim();

            if (isInteger(args.value)) return NavigatorService.jumpLines(+args.value, args.select);
        }, NavigatorCommandValueType.INTEGER)],

        [Commands.JUMP_TO_LINE_N_CHAR.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_LINE_N_CHAR, (args: CommandArgs) => {
            console.log("jump to line n char handler =>", args);
            args.value = args.value.trim();

            if (isInteger(args.value))
                return NavigatorService.jumpToCurrentLineCharIndex(+args.value, args.select);

        }, NavigatorCommandValueType.INTEGER)],

        [Commands.PATTERN_SEARCH.IDENTIFIER, new NavigatorCommand(Commands.PATTERN_SEARCH, (args: CommandArgs) => {
            console.log('pattern search handler =>', args);
            if (args.value.length > 0)
                return NavigatorService.jumpToNextMatchViaPattern(args.value, args.isCaseSensitive, args.select);
        }, NavigatorCommandValueType.ANY, true)],

        [Commands.SEARCH.IDENTIFIER, new NavigatorCommand(Commands.SEARCH, (args: CommandArgs) => {
            console.log('search handler =>', args);
            if (args.value.length > 0)
                return NavigatorService.jumpToNextSubstring(args.value, args.isCaseSensitive, args.select);
        }, NavigatorCommandValueType.ANY, true)],

        [Commands.JUMP_TO_NEXT_CURSOR_MATCH.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_NEXT_CURSOR_MATCH, (args: CommandArgs) => {
            console.log('next cursor match handler =>');
            const editor = EditorUtil.activeEditor;
            if (!editor) return;
            let selectionText = EditorUtil.getText(editor.selection);

            const rangeToEndOfDoc = EditorUtil.getRangeToEndOfDocumentFromCurrentPosition();
            let posOffset = EditorUtil.getCurrentPositionOffset();
            if (!rangeToEndOfDoc || posOffset === undefined) return;

            let textToEndOfDoc = EditorUtil.getText(rangeToEndOfDoc);
            if (selectionText.length === 0 && textToEndOfDoc.length > 0) {
                selectionText = textToEndOfDoc.charAt(0);
                textToEndOfDoc = textToEndOfDoc.substring(1);
                posOffset += 1;
            }

            if (selectionText.length === 0) return;

            const index = textToEndOfDoc.indexOf(selectionText);

            if (index !== -1) {
                NavigatorService.jumpToAbsoluteIndex(posOffset + index, args.select);
                return new CommandResult("Success");
            }

            return new CommandResult("No match", true);
        }, NavigatorCommandValueType.NONE)],

        [Commands.REVERSE_PATTERN_SEARCH.IDENTIFIER, new NavigatorCommand(Commands.REVERSE_PATTERN_SEARCH, (args: CommandArgs) => {
            console.log('reverse pattern search handler =>', args);
            if (args.value.length > 0) {
                return NavigatorService.jumpToPrevMatchViaPattern(args.value, args.isCaseSensitive, args.select);
            }

        }, NavigatorCommandValueType.ANY, true)],

        [Commands.REVERSE_SEARCH.IDENTIFIER, new NavigatorCommand(Commands.REVERSE_SEARCH, (args: CommandArgs) => {
            console.log('reverse search handler =>', args);
            if (args.value.length > 0) {
                return NavigatorService.jumpToPrevSubstring(args.value, args.isCaseSensitive, args.select);
            }

        }, NavigatorCommandValueType.ANY, true)],

        [Commands.JUMP_TO_REVERSE_CURSOR_MATCH.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_REVERSE_CURSOR_MATCH, (args: CommandArgs) => {
            console.log('reverse cursor match handler =>');
            const editor = EditorUtil.activeEditor;
            if (!editor) return;
            let selectionText = EditorUtil.getText(editor.selection);

            const rangeToStartOfDoc = EditorUtil.getRangeToStartOfDocumentFromCurrentPosition();
            const rangeToEndOfDoc = EditorUtil.getRangeToEndOfDocumentFromCurrentPosition();
            if (!rangeToStartOfDoc) return;

            const textToEndOfDoc = rangeToEndOfDoc === undefined ? '' : EditorUtil.getText(rangeToEndOfDoc);
            if (selectionText.length === 0 && textToEndOfDoc.length > 0)
                selectionText = textToEndOfDoc.charAt(0);

            if (selectionText.length === 0) return;

            const textToStartOfDoc = EditorUtil.getText(rangeToStartOfDoc);
            const index = textToStartOfDoc.lastIndexOf(selectionText);

            if (index !== -1) {
                NavigatorService.jumpToAbsoluteIndex(index, args.select);
                return new CommandResult("Success");
            }

            return new CommandResult("No match", true);
        }, NavigatorCommandValueType.NONE)],

        [Commands.JUMP_TO_LINE_LAST_CHAR_OCCURRENCE.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_LINE_LAST_CHAR_OCCURRENCE, (args: CommandArgs) => {
            console.log("last char occurrence handler =>", args);

            if (!EditorUtil.activeEditor) return;

            let updatedSelections: vscode.Selection[] = [];
            let selCount = EditorUtil.activeEditor.selections.length;
            for (let i = 0; i < selCount; ++i) {
                const selection = EditorUtil.activeEditor.selections[i];
                const line = EditorUtil.getLineAt(selection.active.line);
                if (!line) return;
                let lineText = line.text.substring(selection.active.character + 1);
                if (!args.isCaseSensitive) {
                    lineText = lineText.toLowerCase();
                    args.value = args.value.toLowerCase();
                }

                const index = lineText.lastIndexOf(args.value);
                if (index < 0) {
                    if (UserConfig.multicursorSupportedCommandsMustAllMatch || selCount === 1)
                        return new CommandResult(`No match found on line ${selection.active.line + 1}`, true);

                    continue;
                }
                const pos = new vscode.Position(selection.active.line, index + selection.active.character + 1);
                updatedSelections.push(new vscode.Selection(pos, pos));
            }

            EditorUtil.activeEditor.selections = updatedSelections;

            return new CommandResult("Success");
        }, NavigatorCommandValueType.SINGLE_CHAR, true)],

        [Commands.JUMP_TO_LINE_FIRST_CHAR_OCCURRENCE.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_LINE_FIRST_CHAR_OCCURRENCE, (args: CommandArgs) => {
            console.log("first char occurrence handler =>", args);
            if (!EditorUtil.activeEditor) return;

            let updatedSelections: vscode.Selection[] = [];
            let selCount = EditorUtil.activeEditor.selections.length;
            for (let i = 0; i < selCount; ++i) {
                const selection = EditorUtil.activeEditor.selections[i];
                const line = EditorUtil.getLineAt(selection.active.line);
                if (!line) continue;
                let lineText = line.text.substring(0, selection.active.character);
                if (!args.isCaseSensitive) {
                    lineText = lineText.toLowerCase();
                    args.value = args.value.toLowerCase();
                }

                const index = lineText.indexOf(args.value);
                if (index < 0) {
                    if (UserConfig.multicursorSupportedCommandsMustAllMatch || selCount === 1)
                        return new CommandResult(`No match found on line ${selection.active.line + 1}`, true);

                    continue;
                }
                const pos = new vscode.Position(selection.active.line, index);
                updatedSelections.push(new vscode.Selection(pos, pos));
            }

            EditorUtil.activeEditor.selections = updatedSelections;

            return new CommandResult("Success");
        }, NavigatorCommandValueType.SINGLE_CHAR, true)],

        [Commands.JUMP_TO_NEXT_PARAGRAPH.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_NEXT_PARAGRAPH, (args: CommandArgs) => {
            console.log("next paragraph handler =>", args);
            if (!EditorUtil.activeEditor) return;

            return NavigatorService.jumpToParagraph('forwards', args.select);
        }, NavigatorCommandValueType.NONE, false, true)],

        [Commands.JUMP_TO_PREVIOUS_PARAGRAPH.IDENTIFIER, new NavigatorCommand(Commands.JUMP_TO_PREVIOUS_PARAGRAPH, (args: CommandArgs) => {
            console.log("prev paragraph handler =>", args);
            if (!EditorUtil.activeEditor) return;

            return NavigatorService.jumpToParagraph('reverse', args.select);
        }, NavigatorCommandValueType.NONE, false, true)],
    ]);

    public static getCommand(description: string): NavigatorCommand {
        console.log(`Attemping to get command '${description}'`);

        return this.getCommandPredicate(command => command.description === description)!;
    }

    public static exists(description: string): boolean {
        return this.getCommandPredicate(command => command.description === description) !== undefined;
    }

    private static getCommandPredicate(predicate: (command: NavigatorCommand) => {}) {
        for (const [key, value] of this._commands) {
            if (predicate(value)) return this._commands.get(key);
        }

        return;
    }

}

