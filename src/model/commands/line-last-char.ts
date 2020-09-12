import EditorUtil from "../../util/editor-util";
import UserConfig from "../../util/userconfig";
import { Selection, Position } from "vscode";
import NavigatorCommand from "./navigator";
import NavigatorCommandValueType from "../../types/command-value-type";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import Constants from "../../util/constants";

export default class LineLastCharOccurrenceCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_TO_LINE_LAST_CHAR_OCCURRENCE, NavigatorCommandValueType.SINGLE_CHAR);
        this._canToggleSensitivity = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log("last char occurrence handler =>", args);

            if (!EditorUtil.activeEditor) return;

            let updatedSelections: Selection[] = [];
            let selCount = EditorUtil.activeEditor.selections.length;
            for (let i = 0; i < selCount; ++i) {
                const selection = EditorUtil.activeEditor.selections[i];
                const line = EditorUtil.getLineAt(selection.active.line);
                if (!line) continue;
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
                const pos = new Position(selection.active.line, index + selection.active.character + 1);
                updatedSelections.push(new Selection(pos, pos));
            }

            EditorUtil.activeEditor.selections = updatedSelections;

            return new CommandResult("Success");
        }
    }

}