import { NavigatorCommandValueType } from "../model/navigatiorcommand";
import { HistoryItem, NavigatorHistory } from "../model/navigatorhistory";
import { clamp } from "../util/frequent";
import { UserConfig } from "../util/userconfig";

export class HistoryService {
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
        switch (direction) {
            case "next":
                if (this.hasNext()) {
                    this.next();
                }
                return this.getCurrent() || this.get(0);
            case "previous":
                if (this.hasPrevious()) {
                    this.previous();
                }
                return this.getCurrent();
        }
    }

    public addItem(historyItem: HistoryItem) {
        this._history.getItems().unshift(historyItem);
        this._history.getItems().splice(this._maxItems);
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