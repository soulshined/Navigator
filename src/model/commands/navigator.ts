import CommandArgs from "../../types/command-args";
import CommandResult from "../../types/command-result";
import NavigatorCommandValueType from "../../types/command-value-type";

export default abstract class NavigatorCommand {
    private _description: string;
    private _fn: (args: CommandArgs) => Promise<CommandResult | undefined>;
    private _commandValueType: NavigatorCommandValueType;
    protected _canToggleSensitivity: boolean = false;
    protected _canRepeat: boolean = false;

    protected constructor(desc: string, valueType: NavigatorCommandValueType = NavigatorCommandValueType.ANY) {
        this._description = desc;
        this._commandValueType = valueType;
        this._fn = this.setCallback();
    }

    public get description(): string {
        return this._description;
    }

    public get handler(): (args: CommandArgs) => Promise<CommandResult | undefined> {
        return this._fn;
    }

    protected abstract setCallback(): (args: CommandArgs) => Promise<CommandResult | undefined>;

    public get valueType(): NavigatorCommandValueType {
        return this._commandValueType;
    }

    public get canToggleSensitivity(): boolean {
        return this._canToggleSensitivity;
    }

    public get canRepeat(): boolean {
        return this._canRepeat;
    }

    toString(): string {
        return this.description;
    }

}
