import { isInteger } from "../../util/frequent";
import NavigatorCommand from "./navigator";
import NavigatorCommandValueType from "../../types/command-value-type";
import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorService from "../../service/navigator";
import Constants from "../../util/constants";

export default class JumpLinesCommand extends NavigatorCommand {

    constructor() {
        super(Constants.COMMANDS.JUMP_LINES, NavigatorCommandValueType.INTEGER);
    }

    protected setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return async (args: CommandArgs) => {
            console.log("jump line handler =>", args);
            args.value = args.value.trim();

            if (isInteger(args.value)) return NavigatorService.jumpLines(+args.value, args.select);
            else return new CommandResult("Invalid value. Accepts integers only", true);
        }
    }

}