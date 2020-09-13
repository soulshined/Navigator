import EditorUtil from "../../util/editor-util";
import NavigatorCommand from "./navigator";
import NavigatorCommandValueType from "../../types/command-value-type";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";
import { regexEscape } from "../../util/frequent";

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
            if (!rangeToEndOfDoc) return;

            let textToEndOfDoc = EditorUtil.getText(rangeToEndOfDoc);
            if (selectionText.length === 0 && textToEndOfDoc.length > 0) selectionText = textToEndOfDoc.charAt(0);
            else if (selectionText.length === 0) return;

            const match = EditorUtil.findNextSubstringMatch(regexEscape(selectionText));
            if (match?.index) {
                NavigatorService.jumpToAbsoluteIndex(match.index, args.select);
                return new CommandResult("Success");
            }

            return new CommandResult("No match", true);
        }
    }

}