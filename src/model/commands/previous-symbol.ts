import NavigatorCommand from "./navigator";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import EditorUtil from "../../util/editor-util";
import { DocumentSymbol, commands } from "vscode";
import UserConfig from "../../util/userconfig";
import Constants from "../../util/constants";
import NavigatorCommandValueType from "../../types/command-value-type";

export default class PreviousSymbolCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_TO_PREVIOUS_SYMBOL, NavigatorCommandValueType.NONE);
        this._canRepeat = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log('previous symbol handler =>', args);
            const pos = EditorUtil.getCurrentPosition();
            if (!EditorUtil.activeEditor || pos === undefined) return;

            const symbols: DocumentSymbol[] = await commands.executeCommand("vscode.executeDocumentSymbolProvider", EditorUtil.activeEditor.document.uri) || [];
            symbols.push(...symbols.flatMap(symbol => symbol.children));
            symbols.sort((a, b) => a.selectionRange.start.line - b.selectionRange.start.line);

            const prev = symbols.filter(symbol => UserConfig.allowableSymbols.includes(symbol.kind)).reverse().find(symbol => symbol.selectionRange.start.line < pos.line);

            if (!prev) return;

            await EditorUtil.setSelectionAndRevealCenter(prev.selectionRange.start);
            return undefined;
        }
    }

}