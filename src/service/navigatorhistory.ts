import { clamp } from "../util/frequent";
import NavigatorHistory from "../model/navigator-history";
import HistoryItem from "../types/history-item";
import NavigatorCommandValueType from "../types/command-value-type";
import UserConfig from "../util/userconfig";

export default class HistoryService {
    private _history: NavigatorHistory = new NavigatorHistory;
    private _currentIndex: number = -1;
    private _maxItems: number = UserConfig.maxHistory;

    public get(index: number): HistoryItem | undefined {
        if (this.size() === 0) return;

        return this._history.getItems()[index];
    }

    public getItems() {
        return this._history.getItems();
    }

    public getNext(): HistoryItem | undefined {
        return this.get(this._currentIndex + 1);
    }

    public getPrevious(): HistoryItem | undefined {
        return this.get(this._currentIndex - 1);
    }

    public hasNext(): boolean {
        return this.get(this._currentIndex + 1) !== undefined;
    }

    public hasPrevious(): boolean {
        return this.get(this._currentIndex - 1) !== undefined;
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }

    public next() {
        this._currentIndex = clamp(++this._currentIndex, -1, this.size());
    }

    public previous() {
        this._currentIndex = clamp(--this._currentIndex, -1);
    }

    public getCurrent(): HistoryItem | undefined {
        return this.get(this._currentIndex);
    }

    public getForUserRequest(direction: "next" | "previous"): HistoryItem | undefined {
        let index = this._currentIndex;
        switch (direction) {
            case "next":
                while (this.get(++index) !== undefined) {
                    if (this.get(index)!.command.valueType !== NavigatorCommandValueType.NONE) {
                        this._currentIndex = index;
                        return this.get(index);
                    }
                }
            case "previous":
                while (this.get(--index) != undefined) {
                    if (this.get(index)!.command.valueType !== NavigatorCommandValueType.NONE) {
                        this._currentIndex = index;
                        return this.get(index);
                    }
                }
        }
    }

    public addItem(historyItem: HistoryItem) {
        this._history.getItems().unshift(historyItem);
        this._history.getItems().splice(this._maxItems);
        console.log("new history", this._history.getItems());
    }

    public clear() {
        this._history.getItems().splice(0);
    }

    public getFirstNonNoneValueType(): HistoryItem | undefined {
        return this.getItems().find(i => i.command.valueType !== NavigatorCommandValueType.NONE);
    }

    public resetIndex() {
        this._currentIndex = -1;
    }

    public size(): number {
        return this._history.getItems().length;
    }

}