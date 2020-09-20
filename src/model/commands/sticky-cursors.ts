import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorCommandValueType from "../../types/command-value-type";
import Constants from "../../util/constants";
import NavigatorCommand from "./navigator";

export default class StickyCursorsCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.STICKY_CURSORS, NavigatorCommandValueType.NONE);
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log('sticky cursor handler =>', args);
            return undefined;
        }
    }

}