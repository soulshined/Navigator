import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import Constants from "../../util/constants";
import NavigatorCommand from "./navigator";
import EditorUtil from "../../util/editor-util";
import { DocumentSymbol, commands } from "vscode";
import UserConfig from "../../util/userconfig";
import NavigatorCommandValueType from "../../types/command-value-type";

export default class NextSymbolCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_TO_NEXT_SYMBOL, NavigatorCommandValueType.NONE);
        this._canRepeat = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log('next symbol handler =>', args);
            const pos = EditorUtil.getCurrentPosition();
            if (!EditorUtil.activeEditor || pos === undefined) return;

            let symbols: DocumentSymbol[] = await commands.executeCommand("vscode.executeDocumentSymbolProvider", EditorUtil.activeEditor.document.uri) || [];
            symbols.push(...symbols.flatMap(symbol => symbol.children));
            symbols = symbols.filter(symbol => UserConfig.allowableSymbols.includes(symbol.kind));
            symbols.sort((a, b) => a.selectionRange.start.line - b.selectionRange.start.line);

            let next = symbols.find(symbol => symbol.selectionRange.start.line > pos.line);
            if (!next && UserConfig.recursiveSearch && symbols.length > 1)
                next = symbols[0];
            else if (!next) return;

            await EditorUtil.setSelectionAndRevealCenter(next.selectionRange.start);
            return undefined;
        }
    }

}