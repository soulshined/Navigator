import EditorUtil from "../../util/editor-util";
import NavigatorCommand from "./navigator";
import NavigatorCommandValueType from "../../types/command-value-type";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";
import SearchDirection from "../../types/search-direction";

export default class PreviousParagraphCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_TO_PREVIOUS_PARAGRAPH, NavigatorCommandValueType.NONE);
        this._canRepeat = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log("prev paragraph handler =>", args);
            if (!EditorUtil.activeEditor) return;

            return NavigatorService.jumpToParagraph(SearchDirection.Reverse, args.select);
        }

    }

}