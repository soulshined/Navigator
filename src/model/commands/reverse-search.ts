import CommandResult from "../../types/command-result";
import NavigatorCommand from "./navigator";
import CommandArgs from "../../types/command-args";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";
import SearchDirection from "../../types/search-direction";

export default class ReverseSearchCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.REVERSE_SEARCH);
        this._canToggleSensitivity = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log('reverse search handler =>', args);
            if (args.value.length > 0)
                return NavigatorService.jumpToNextSubstringMatch(args.value, SearchDirection.Reverse, args.isCaseSensitive, args.select);
        }
    }

}