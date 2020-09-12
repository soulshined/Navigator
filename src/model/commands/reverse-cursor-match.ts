import EditorUtil from "../../util/editor-util";
import NavigatorCommand from "./navigator";
import NavigatorCommandValueType from "../../types/command-value-type";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";

export default class ReverseCursorMatchCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_TO_REVERSE_CURSOR_MATCH, NavigatorCommandValueType.NONE);
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
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
        }
    }

}