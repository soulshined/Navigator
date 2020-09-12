import HistoryItem from "../types/history-item";

export default class NavigatorHistory {
    private _items: HistoryItem[] = [];

    public getItems() {
        return this._items;
    }

}