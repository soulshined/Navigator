export abstract class Constants {

    public static WORKSPACE_CONFIG = 'navigator';

    public static COMMANDS = {
        SEARCH: {
            IDENTIFIER: 'ctrl+s',
            DESCRIPTION: "SEARCH"
        },
        REVERSE_SEARCH: {
            IDENTIFIER: 'ctrl+shift+s',
            DESCRIPTION: "REVERSE SEARCH"
        },
        PATTERN_SEARCH: {
            IDENTIFIER: 'ctrl+r',
            DESCRIPTION: "PATTERN SEARCH"
        },
        REVERSE_PATTERN_SEARCH: {
            IDENTIFIER: 'ctrl+shift+r',
            DESCRIPTION: "REVERSE PATTERN SEARCH"
        },
        JUMP_LINES: {
            IDENTIFIER: 'ctrl+j',
            DESCRIPTION: "JUMP LINES"
        },
        JUMP_TO_LINE_LAST_CHAR_OCCURRENCE: {
            IDENTIFIER: 'ctrl+shift+4',
            DESCRIPTION: "LINE LAST CHAR OCCURRENCE"
        },
        JUMP_TO_LINE_FIRST_CHAR_OCCURRENCE: {
            IDENTIFIER: 'ctrl+shift+6',
            DESCRIPTION: "LINE FIRST CHAR OCCURRENCE"
        },
        JUMP_TO_LINE_N_CHAR: {
            IDENTIFIER: 'ctrl+shift+3',
            DESCRIPTION: "LINE N CHAR"
        },
        JUMP_TO_NEXT_CURSOR_MATCH: {
            IDENTIFIER: 'ctrl+n',
            DESCRIPTION: "CURSOR MATCH"
        },
        JUMP_TO_REVERSE_CURSOR_MATCH: {
            IDENTIFIER: 'ctrl+shift+n',
            DESCRIPTION: "REVERSE CURSOR MATCH"
        },
        JUMP_TO_NEXT_PARAGRAPH: {
            IDENTIFIER: 'ctrl+]',
            DESCRIPTION: 'NEXT PARAGRAPH'
        },
        JUMP_TO_PREVIOUS_PARAGRAPH: {
            IDENTIFIER: 'ctrl+[',
            DESCRIPTION: 'PREVIOUS PARAGRAPH'
        }
    }

    public static FEEDBACK_STYLE = {
        NONE: 'none',
        STATUS_BAR: 'statusbar',
        NOTIFICATION: 'notification'
    }

}

export const Commands = Constants.COMMANDS;
export interface ICommands {
    IDENTIFIER: string,
    DESCRIPTION: string
}