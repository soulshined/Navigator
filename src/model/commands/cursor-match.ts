import EditorUtil from "../../util/editor-util";
import NavigatorCommand from "./navigator";
import NavigatorCommandValueType from "../../types/command-value-type";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";

export default class CursorMatchCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_TO_NEXT_CURSOR_MATCH, NavigatorCommandValueType.NONE);
    }

    protected setCallback() {
        return async (args: CommandArgs) => {
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
        }
    }

}