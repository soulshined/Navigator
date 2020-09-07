import { StatusBar } from "../model/statusbar";
import { NavigatorCommand } from "../model/navigatiorcommand";
import { UserConfig } from "../util/userconfig";

export interface StatusBarServiceArgs {
    command: NavigatorCommand,
    text: string,
    isCaseSensitive: boolean,
    isHistoryItem?: boolean
}

export class StatusBarService {
    private component: StatusBar = new StatusBar;

    constructor() {
        this.setState({ text: '', command: UserConfig.defaultCommand, isCaseSensitive: false });
        this.setColor(UserConfig.inactiveForeground);
    }

    public clear(hide: boolean = false) {
        this.component.setText("");
        this.component.getStatusBarItem().tooltip = undefined;
        if (hide) this.component.getStatusBarItem().hide();
    }

    public setState({ text, command, isHistoryItem, isCaseSensitive }: StatusBarServiceArgs) {
        const historyMark = isHistoryItem ? '⭯ ' : '';
        const caseSensitiveMark = !isCaseSensitive && command.canToggleSensitivity ? ' i' : '';
        this.component.setText(`Navigator [${historyMark}${command.description}${caseSensitiveMark}]> ${text}`);
    }

    public setTooltip(text: string) {
        this.component.getStatusBarItem().tooltip = text;
    }

    public setColor(color: string | undefined) {
        this.component.getStatusBarItem().color = color;
    }

}