import NavigatorCommand from "./commands/navigator";
import CursorMatchCommand from "./commands/cursor-match";
import NavigateToLineNCharCommand from "./commands/jump-line-n-char";
import JumpLinesCommand from "./commands/jump-lines";
import LineFirstCharOccurrenceCommand from "./commands/line-first-char";
import LineLastCharOccurrenceCommand from "./commands/line-last-char";
import NextParagraphCommand from "./commands/next-paragraph";
import PatternSearchCommand from "./commands/pattern-search";
import PreviousParagraphCommand from "./commands/previous-paragraph";
import ReverseCursorMatchCommand from "./commands/reverse-cursor-match";
import ReversePatternSearchCommand from "./commands/reverse-pattern-search";
import ReverseSearchCommand from "./commands/reverse-search";
import SearchCommand from "./commands/search";
import PreviousSymbolCommand from "./commands/previous-symbol";
import NextSymbolCommand from "./commands/next-symbol";
import StickyCursorsCommand from "./commands/sticky-cursors";

export default class NavigatorCommandsList {

    private static _commands: Set<NavigatorCommand> = new Set<NavigatorCommand>([
        new CursorMatchCommand,
        new NavigateToLineNCharCommand,
        new JumpLinesCommand,
        new LineFirstCharOccurrenceCommand,
        new LineLastCharOccurrenceCommand,
        new NextParagraphCommand,
        new PatternSearchCommand,
        new PreviousParagraphCommand,
        new ReverseCursorMatchCommand,
        new ReversePatternSearchCommand,
        new ReverseSearchCommand,
        new SearchCommand,
        new NextSymbolCommand,
        new PreviousSymbolCommand,
        new StickyCursorsCommand
    ]);

    public static getCommandByDescription(description: string): NavigatorCommand {
        console.log(`Attemping to get command '${description}'`);

        return this.getCommandPredicate(command => command.description === description)!;
    }

    public static exists(description: string): boolean {
        return this.getCommandPredicate(command => command.description === description) !== undefined;
    }

    private static getCommandPredicate(predicate: (command: NavigatorCommand) => {}) {
        for (const value of this._commands) {
            if (predicate(value)) return value;
        }

        return;
    }

}

