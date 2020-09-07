import { ContextItem } from "../model/context";
import { CommandArgs, CommandResult, NavigatorCommand, NavigatorCommandsList as Commands, NavigatorCommandValueType } from "../model/navigatiorcommand";
import { FeedbackService } from "../service/feebackservice";
import { HistoryService } from "../service/navigatorhistory";
import { StatusBarService } from "../service/statusbar";
import { UserConfig } from "../util/userconfig";
import { isInteger } from "../util/frequent";

export class Navigator {
    private _statusBarService: StatusBarService = new StatusBarService;
    private _isInputMode: ContextItem = new ContextItem("navigator.isInputMode");
    private _isActive: boolean = false;
    private _activeCommand: NavigatorCommand = UserConfig.defaultCommand;
    private _input: string = "";
    private _history: HistoryService = new HistoryService;
    private _feedbackService: FeedbackService = new FeedbackService(this._statusBarService);
    private _caseSensitive: boolean = !UserConfig.defaultIgnoreCase;

    public async listen(text: string) {
        this._input += text;
        this._statusBarService.setState({ text: this._input, command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });

        if (this.getActiveCommand().valueType == NavigatorCommandValueType.SINGLE_CHAR) {
            await this.doCommand();
            return;
        }

    }

    public scrollHistory(target: "previous" | "next") {
        if (this._history.isEmpty()) return;

        const action = this._history.getForUserRequest(target);
        if (!action) return;

        this._input = action.value;
        this._activeCommand = action.command;

        this._statusBarService.setState({ text: action.value, command: action.command, isHistoryItem: true, isCaseSensitive: action.isCaseSensitive });
    }

    public getCommandValue() {
        return this._input;
    }

    public getActiveCommand(): NavigatorCommand {
        return this._activeCommand;
    }

    public toggleCaseSensitivity() {
        if (!this._activeCommand.canToggleSensitivity) return;

        this._caseSensitive = !this._caseSensitive;
        this._statusBarService.setState({ text: this.getCommandValue(), command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
    }

    public async doHistory(index: number) {
        if (this._history.isEmpty() || index === undefined) return;

        const historyItem = this._history.get(index);
        if (!historyItem) return;

        const args: CommandArgs = {
            select: historyItem.select,
            value: historyItem.value,
            isCaseSensitive: historyItem.isCaseSensitive
        };
        const result = historyItem.command.handler(args);

        await this._feedbackService.initiateFeedbackFromResult(result, true);
        await this.clear(false, result, true);
    }

    public async doCommand(options?: { select: boolean }) {
        console.log('doing command: ' + this.getActiveCommand(), 'with value: ' + this.getCommandValue(), "options", options);

        const args: CommandArgs = {
            select: options ? options.select : false,
            value: this.getCommandValue(),
            isCaseSensitive: this._caseSensitive
        };

        const result = Commands.getCommand(this.getActiveCommand().description).handler(args);
        if ((result && !result.isError) || !result)
            this._history.addItem({
                "command": this.getActiveCommand(),
                ...args
            });

        await this._feedbackService.initiateFeedbackFromResult(result);
        await this.clear(false, result);
    }

    public async setActiveCommand(commandId: string, args?: any) {
        console.log(`Attempting to set active command to '${commandId}' with args =>`, args);

        if (Commands.exists(commandId))
            this._activeCommand = Commands.getCommand(commandId);

        if (args && args.isSequenceExecuted) {
            if (args.value) {
                this._input = args.value;
                this._statusBarService.setState({ text: this.getCommandValue(), command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
                return await this.doCommand();
            }
            return;
        }

        console.log(`Set active command result: '${this._activeCommand}'`);

        if (this.getActiveCommand().valueType !== NavigatorCommandValueType.ANY) {
            if (this.getActiveCommand().valueType !== NavigatorCommandValueType.INTEGER || !isInteger(this.getCommandValue()))
                this._input = "";
        }

        this._statusBarService.setState({ text: this.getCommandValue(), command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
    }

    public getHistory() {
        return this._history.getItems();
    }

    public get isActive() {
        return this._isActive;
    }

    public async activate() {
        await this.clear(true);
        this._isActive = true;
        this._isInputMode.set(true);
        if (UserConfig.activateWithPreviousCommand)
            this._activeCommand = this._history.getFirstNonNoneValueType()?.command ?? UserConfig.defaultCommand;
        this._statusBarService.setState({ text: '', command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
        this._statusBarService.setColor(UserConfig.activeForeground);
    }

    public undo() {
        this._input = this._input.substring(0, this._input.length - 1);
        this._statusBarService.setState({ text: this.getCommandValue(), command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
    }

    public async clear(clearText: boolean = false, result: CommandResult | undefined = undefined, isHistoryExecuted: boolean = false) {
        if (this.getActiveCommand().valueType === NavigatorCommandValueType.SINGLE_CHAR)
            this._input = this._input.charAt(1);

        if (result?.isError && UserConfig.stickyErrors && !isHistoryExecuted) return;

        await this._feedbackService.clear();
        this._statusBarService.setColor(UserConfig.inactiveForeground);

        this._isActive = false;
        this._isInputMode.set(false);
        if (!UserConfig.activateWithPreviousCaseSensitivity)
            this._caseSensitive = !UserConfig.defaultIgnoreCase;
        if (UserConfig.resetHistoryIndex)
            this._history.resetIndex();
        this._activeCommand = UserConfig.defaultCommand;
        this._input = "";
        if (clearText) this._statusBarService.clear();
    }

}