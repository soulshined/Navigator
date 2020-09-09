import { SymbolKind, window, workspace } from "vscode";
import { NavigatorCommand, NavigatorCommandsList, NavigatorCommandValueType } from "../model/navigatiorcommand";
import { Commands, Constants } from "./constants";
import { clamp } from "./frequent";


export type SequenceConfig = {
    commandId: string,
    args: { [key: string]: any }
};

const defaultAllowableSymbols = [
    SymbolKind.Class,
    SymbolKind.Constructor,
    SymbolKind.Enum,
    SymbolKind.Function,
    SymbolKind.Method,
    SymbolKind.Namespace,
    SymbolKind.Struct
];

export class UserConfig {
    private static get config() {
        return workspace.getConfiguration(Constants.WORKSPACE_CONFIG);
    }

    public static get defaultCommand(): NavigatorCommand {
        const commandDesc = this.config.get('defaultCommand', Commands.PATTERN_SEARCH.DESCRIPTION);

        if (NavigatorCommandsList.exists(commandDesc)) {
            const command = NavigatorCommandsList.getCommand(commandDesc);
            if (command.valueType !== NavigatorCommandValueType.NONE) return command;
        }

        return NavigatorCommandsList.getCommand(Commands.PATTERN_SEARCH.DESCRIPTION);
    }

    public static get defaultIgnoreCase(): boolean {
        return this.config.get('defaultIgnoreCase', true);
    }

    public static get activateWithPreviousCommand(): boolean {
        return this.config.get('activateWithMostRecentCommand', true);
    }

    public static get activateWithPreviousCaseSensitivity(): boolean {
        return this.config.get('activateWithPreviousCaseSensitivity', false);
    }

    public static get feedbackStyle() {
        const val = this.config.get('feedbackStyle', Constants.FEEDBACK_STYLE.STATUS_BAR);

        switch (val.toLowerCase()) {
            case 'none':
                return Constants.FEEDBACK_STYLE.NONE;
            case 'statusbar':
                return Constants.FEEDBACK_STYLE.STATUS_BAR
            case 'notification':
                return Constants.FEEDBACK_STYLE.NOTIFICATION
            default:
                return Constants.FEEDBACK_STYLE.STATUS_BAR
        }
    }

    public static get feedbackOnErrorOnly(): boolean {
        return this.config.get('feedbackOnErrorOnly', true);
    }

    public static get stickyErrors(): boolean {
        return this.config.get('stickyErrors', true);
    }

    public static get maxHistory(): number {
        return clamp(this.config.get('maxhistory', 10), 10, 50);
    }

    public static get resetHistoryIndex(): boolean {
        return this.config.get('resetHistoryIndex', true);
    }

    public static get activeForeground(): string {
        return this.config.get('activeForeground', '#000000');
    }

    public static get inactiveForeground(): string {
        return this.config.get('inactiveForeground', '#525252');
    }

    public static get multicursorSupportedCommandsMustAllMatch(): boolean {
        return this.config.get('multicursorSupportedCommandsMustAllMatch', true);
    }

    public static getSequenceConfig(sequence: number): SequenceConfig[] {
        const editor = window.activeTextEditor;
        if (!editor) {
            return this.config.get(`sequence${sequence}`) || [];
        }

        return workspace.getConfiguration(Constants.WORKSPACE_CONFIG, editor.document).get(`sequence${sequence}`) as SequenceConfig[];
    }

    public static get deactivateNavigatorOnEditorChangeEvent(): boolean {
        return this.config.get('deactivateNavigatorOnEditorChange', true);
    }

    public static get allowableSymbols(): SymbolKind[] {
        const editor = window.activeTextEditor;
        if (!editor) return defaultAllowableSymbols;

        const vals: Set<string> = workspace.getConfiguration(Constants.WORKSPACE_CONFIG, editor.document).get('allowableSymbols', new Set);

        if (vals.size === 0) return defaultAllowableSymbols;

        const symbols: SymbolKind[] = [];
        vals.forEach(val => {
            for (const kind in SymbolKind) {
                if (kind.toLowerCase() === val.toLowerCase()) {
                    symbols.push((<any>SymbolKind)[kind]);
                }
            }
        });

        return symbols.length === 0
            ? defaultAllowableSymbols
            : symbols;
    }
}