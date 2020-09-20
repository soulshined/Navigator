import { DecorationRangeBehavior, OverviewRulerLane, TextEditorDecorationType, ThemeColor, window } from "vscode";

const cursorForeground = new ThemeColor('editorCursor.foreground');

export const StickyCursorDecorationType: TextEditorDecorationType = window.createTextEditorDecorationType({
    backgroundColor: cursorForeground,
    outlineColor: cursorForeground,
    outlineWidth: '1px',
    outlineStyle: 'solid',
    color: new ThemeColor('editorCursor.background'),
    overviewRulerColor: cursorForeground,
    overviewRulerLane: OverviewRulerLane.Center,
    rangeBehavior: DecorationRangeBehavior.ClosedClosed
})