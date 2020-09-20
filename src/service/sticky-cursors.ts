import { DecorationOptions, Position, Range, Selection } from "vscode";
import { StickyCursorDecorationType } from "../types/decoration";
import StickyCursorStyle from "../types/sticky-cursor-style";
import EditorUtil from "../util/editor-util";
import UserConfig from "../util/userconfig";

export default class StickyCursorsService {
    private _items: DecorationOptions[] = [];

    public add() {
        const editor = EditorUtil.activeEditor;
        if (!editor) return;

        this._items.push({
            range: this.getRangeForSetting(editor.selection)
        })

        editor.setDecorations(StickyCursorDecorationType, this._items);
    }

    public remove() {
        const editor = EditorUtil.activeEditor;
        if (!editor) return;

        const index = this._items.findIndex(dec => dec.range.contains(editor.selection.active));

        if (index === -1) return;

        this._items.splice(index, 1);
        editor.setDecorations(StickyCursorDecorationType, this._items);
    }

    public clear() {
        const editor = EditorUtil.activeEditor;
        if (!editor) return;

        this._items = [];
        editor.setDecorations(StickyCursorDecorationType, this._items);
    }

    public convertToSelections() {
        const editor = EditorUtil.activeEditor;
        if (!editor) return;

        editor.selections = [editor.selection, ...this._items.map(decoration =>
            new Selection(decoration.range.start, decoration.range.start)
        )];
        this.clear();
    }

    private getRangeForSetting(selection: Selection): Range {
        const width = UserConfig.stickyCursorStyle === StickyCursorStyle.BLOCK ? 1 : 0;

        return new Range(selection.active, new Position(selection.active.line, selection.active.character + width));
    }
}