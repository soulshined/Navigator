import { NavigatorCommand } from "./navigatiorcommand";

export type HistoryItem = {
    value: string,
    command: NavigatorCommand,
    select: boolean,
    isCaseSensitive: boolean
}

export class NavigatorHistory {
    private _items: HistoryItem[] = [];

    public getItems() {
        return this._items;
    }

}