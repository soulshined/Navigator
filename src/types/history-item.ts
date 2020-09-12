import NavigatorCommand from "../model/commands/navigator";

type HistoryItem = {
    value: string,
    command: NavigatorCommand,
    select: boolean,
    isCaseSensitive: boolean
}

export default HistoryItem;