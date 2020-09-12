import NavigatorCommand from "./navigator";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";
import SearchDirection from "../../types/search-direction";

export default class PatternSearchCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.PATTERN_SEARCH);
        this._canToggleSensitivity = true;
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log('pattern search handler =>', args);
            if (args.value.length > 0)
                return NavigatorService.jumpToNextMatchViaPattern(args.value, SearchDirection.Forward, args.isCaseSensitive, args.select);
        }
    }

}