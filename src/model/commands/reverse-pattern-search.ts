import NavigatorCommand from "./navigator";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";
import SearchDirection from "../../types/search-direction";

export default class ReversePatternSearchCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.REVERSE_PATTERN_SEARCH);
        this._canToggleSensitivity = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log('reverse pattern search handler =>', args);
            if (args.value.length > 0)
                return NavigatorService.jumpToNextMatchViaPattern(args.value, SearchDirection.Reverse, args.isCaseSensitive, args.select);
        }
    }

}