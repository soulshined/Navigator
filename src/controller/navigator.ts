import { isInteger } from "../util/frequent";
import UserConfig from "../util/userconfig";
import ContextItem from "../model/context";
import NavigatorCommand from "../model/commands/navigator";
import NavigatorCommandValueType from "../types/command-value-type";
import CommandArgs from "../types/command-args";
import NavigatorCommandsList from "../model/navigatior-command-list";
import CommandResult from "../types/command-result";
import FeedbackService from "../service/feebackservice";
import StatusBarService from "../service/statusbar";
import HistoryService from "../service/navigatorhistory";
import NavigatorMode from "../types/navigator-mode";
import StickyCursorsService from "../service/sticky-cursors";
import StickyCursorsCommand from "../model/commands/sticky-cursors";
import { commands } from "vscode";

export default class Navigator {
    private _statusBarService: StatusBarService = new StatusBarService;
    private _isInputMode: ContextItem = new ContextItem("navigator.isInputMode");
    private _isStickyCursorMode: ContextItem = new ContextItem("navigator.isStickyCursorMode");
    private _isAnyMode: ContextItem = new ContextItem("navigator.isAnyMode");
    private _navigatorMode: NavigatorMode = NavigatorMode.INPUT;
    private _isActive: boolean = false;
    private _activeCommand: NavigatorCommand = UserConfig.defaultCommand;
    private _input: string = "";
    private _history: HistoryService = new HistoryService;
    private _feedbackService: FeedbackService = new FeedbackService(this._statusBarService);
    private _caseSensitive: boolean = !UserConfig.defaultIgnoreCase;
    private _stickyCursors: StickyCursorsService = new StickyCursorsService;

    public async listen(text: string) {
        if (this.mode !== NavigatorMode.INPUT || this.getActiveCommand().valueType === NavigatorCommandValueType.NONE) return;

        this._input += text;
        this._statusBarService.setState({ text: this._input, command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });

        if (this.getActiveCommand().valueType == NavigatorCommandValueType.SINGLE_CHAR) {
            await this.doCommand();
            return;
        }

    }

    public get mode(): NavigatorMode {
        return this._navigatorMode;
    }

    public get stickyCursors(): StickyCursorsService {
        return this._stickyCursors;
    }

    private scrollHistory(target: "previous" | "next") {
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
        const result = await historyItem.command.handler(args);

        await this._feedbackService.initiateFeedbackFromResult(result, true);
        await this.clear(false, result, true);
    }

    public async doCommand(options?: { select: boolean }) {
        if (this.getCommandValue().length === 0 && this.getActiveCommand().valueType !== NavigatorCommandValueType.NONE) return;

        if (this.mode === NavigatorMode.STICKY_CURSOR)
            this.stickyCursors.convertToSelections();

        console.log('doing command: ' + this.getActiveCommand(), 'with value: ' + this.getCommandValue(), "options", options);

        const args: CommandArgs = {
            select: options ? options.select : false,
            value: this.getCommandValue(),
            isCaseSensitive: this._caseSensitive
        };

        const result = await this.getActiveCommand().handler(args);
        if (result && !result.isError)
            this._history.addItem({
                "command": this.getActiveCommand(),
                ...args
            });

        if (this.getActiveCommand().canRepeat) return;

        await this._feedbackService.initiateFeedbackFromResult(result);
        await this.clear(false, result);
    }

    public async setActiveCommand(commandId: string, args?: any) {
        console.log(`Attempting to set active command to '${commandId}' with args =>`, args);

        if (NavigatorCommandsList.exists(commandId))
            this._activeCommand = NavigatorCommandsList.getCommandByDescription(commandId);

        if (this._activeCommand instanceof StickyCursorsCommand)
            this.setMode(NavigatorMode.STICKY_CURSOR);
        else {
            this.setMode(NavigatorMode.INPUT);
            this.stickyCursors.clear();
        }

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
        if (this._activeCommand instanceof StickyCursorsCommand) this.setMode(NavigatorMode.STICKY_CURSOR);
        else this.setMode(NavigatorMode.INPUT);
        if (UserConfig.activateWithPreviousCommand)
            this._activeCommand = this._history.getFirstNonNoneValueType()?.command ?? UserConfig.defaultCommand;
        this._statusBarService.setState({ text: '', command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
        this._statusBarService.setColor(UserConfig.activeForeground);
    }

    public undo() {
        this._input = this._input.substring(0, this._input.length - 1);
        this._statusBarService.setState({ text: this.getCommandValue(), command: this.getActiveCommand(), isCaseSensitive: this._caseSensitive });
    }

    private setMode(mode: NavigatorMode = NavigatorMode.UNDEFINED) {
        switch (mode) {
            case NavigatorMode.INPUT:
                this._isInputMode.set(true);
                this._isStickyCursorMode.set(false);
                break;
            case NavigatorMode.STICKY_CURSOR:
                this._isInputMode.set(false);
                this._isStickyCursorMode.set(true);
                break;
            default:
                this._isInputMode.set(false);
                this._isStickyCursorMode.set(false);
                break;
        }

        this._navigatorMode = mode;
        this._isAnyMode.set(this.mode !== NavigatorMode.UNDEFINED)
    }

    public async doUp() {
        if (this.mode === NavigatorMode.INPUT)
            this.scrollHistory('next');

        else await commands.executeCommand('cursorUp');
    }

    public async doDown() {
        if (this.mode === NavigatorMode.INPUT)
            this.scrollHistory('previous');

        else await commands.executeCommand('cursorDown');
    }

    public async clear(clearText: boolean = false, result: CommandResult | undefined = undefined, isHistoryExecuted: boolean = false) {
        if (this.getActiveCommand().valueType === NavigatorCommandValueType.SINGLE_CHAR)
            this._input = this._input.charAt(1);

        if (result?.isError && UserConfig.stickyErrors && !isHistoryExecuted) return;

        await this._feedbackService.clear();
        this._statusBarService.setColor(UserConfig.inactiveForeground);


        this._isActive = false;
        this.setMode();
        this._stickyCursors.clear();
        if (!UserConfig.activateWithPreviousCaseSensitivity)
            this._caseSensitive = !UserConfig.defaultIgnoreCase;
        if (UserConfig.resetHistoryIndex)
            this._history.resetIndex();
        this._activeCommand = UserConfig.defaultCommand;
        this._input = "";
        if (clearText) this._statusBarService.clear();
    }

}